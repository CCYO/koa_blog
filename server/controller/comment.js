const C_MsgReceiver = require("./msgReceiver");
const Comment = require("../server/comment");
const Opts = require("../utils/seq_options");
const Init = require("../utils/init");
const { SuccModel, ErrModel, MyErr } = require("../utils/model");
const { CACHE, ENV, ERR_RES } = require("../config");

async function add({ commenter_id, article_id, html, pid, author_id }) {
  //  創建 comment
  let newComment = await Comment.create(
    Opts.COMMENT.CREATE.one({ commenter_id, article_id, html, pid })
  );
  //  尋找
  //  *既存且須要更新的 msgReceiver
  //  *newComment 建立關係的 commenter
  let info = await _findInfoForAdd({ ...newComment, author_id });
  //  找出新創comment時，需更新、新創的 *msgReceiver，以及既存與尚未建立關聯的 receiver
  let {
    //  與newComment有關係的 msgReceiver
    msgReceiver: { author, curCommenter, others }, //  other 評論過的紀錄
    //  與newComment有關係的 user
    commenters: { notReceiver, all }, //  other 無論有無評論
  } = info.data;

  //  存放要更新的數據
  let newDatas = [];
  //  存放待整理為 newDatas Item
  let container = [];
  //  必定會更新到的數據屬性
  let defProp = { msg_id: newComment.id, updatedAt: newComment.createdAt };
  //  確認 commenter === author
  let isAuthor = commenter_id === author_id;

  if (isAuthor) {
    ////  若留言者是文章作者

    //  若作者沒有「與 pid 相關的 msgReceiver」
    if (!author) {
      //  找出作者「與article_id相關的 msgReceiver」
      let { errno, data } = await _findMsgReceiverOfAuthor({
        author_id,
        article_id,
      });
      //  若存在，則賦值給 author，稍後提供給newData使用
      if (!errno) {
        author = data;
      }
      //  若不存在，代表目前為止，文章只有作者自己在留言
    }
    //  若作者與pid之間，有相關的msgReceiver存在，且
    author &&
      //  msgReveiver尚未確認，則
      !author.confirm &&
      //  將 msgReviever 改為{ confirm: true, updatedAt: 同 newComment 創建時間 }
      //  並存入 newDatas 備用
      newDatas.push({
        ...author,
        updatedAt: newComment.createdAt,
        confirm: true,
      });
  } else {
    ////  若留言者不是文章作者

    //  若作者也擁有「與 pid 相關的 msgReceiver」
    if (author) {
      //  放入待處理的數據列表 container 中
      container.push(author);
    } else {
      //  若作者沒有「與 pid 相關的 msgReceiver」
      //  找出作者「與article_id相關的 msgReceiver」
      let { errno, data } = await _findMsgReceiverOfAuthor({
        author_id,
        article_id,
      });
      if (!errno) {
        //  若存在，則放入待處理的數據列表 container 中
        container.push(data);
      } else {
        //  若不存在，則將作者列入 notReceiver 之中，待後續創建全新通知
        notReceiver.add(author_id);
      }
    }
    //  若符合 pid 的 留言者自身通知 存在，且處於「未確認」狀態
    if (curCommenter && !curCommenter.confirm) {
      //  改為「已確認狀態」，存入 newDatas
      newDatas.push({
        ...curCommenter,
        updatedAt: newComment.createdAt,
        confirm: true,
      });
    }
  }

  //  將作者與留言者以外，其他評論者所擁有的「與 pid 相關的 msgReceiver」
  //  放入待處理的數據列表 container 中
  if (others.length) {
    container = container.concat(others);
  }
  //  整理待更新數據
  for (let msgReceiver of container) {
    if (msgReceiver.confirm) {
      //  針對「已確認」狀態的msgReceiver，更新為新創見的狀態 ---------------------------------> 新通知
      newDatas.push({
        ...msgReceiver,
        ...defProp,
        createdAt: newComment.createdAt,
        confirm: false,
      });
    } else {
      //  針對「未確認」狀態的msgReceiver，更新為新創見的狀態 ---------------------------------> 更新舊通知
      //  更新 { msg_id: newComment.id, updatedAt: newComment.createdAt };
      newDatas.push({ ...msgReceiver, ...defProp });
    }
  }
  //  針對既非作者與非留言者，尚未建立「與 pid 相關的 msgReceiver」的receiver，創建全新通知 ----> 新通知
  for (let receiver_id of notReceiver) {
    newDatas.push({
      ...defProp,
      receiver_id,
      createdAt: newComment.createdAt,
      confirm: false,
    });
  }
  //  更新
  if (newDatas.length) {
    await C_MsgReceiver.setList(newDatas);
  }
  //  讀取符合Blog格式數據格式的新Comment
  let { data } = await _findItemForRender(newComment.id);
  let opts = { data };
  if (!ENV.isNoCache) {
    opts.cache = {
      [CACHE.TYPE.PAGE.BLOG]: [article_id],
      [CACHE.TYPE.NEWS]: [...all],
    };
  }
  return new SuccModel(opts);
}
async function remove({ user_id, comment_id }) {
  //  刪除comment
  let row = await Comment.destroyList(Opts.COMMENT.REMOVE.list([comment_id]));
  if (!row) {
    throw new MyErr({
      ...ERR_RES.COMMENT.REMOVE.ROW,
      error: `刪除 comment/${comment_id} 失敗`,
    });
  }
  let removedComment = await Comment.read(
    Opts.COMMENT.FIND._wholeInfo(comment_id, (paranoid = false))
  );
  let {
    pid,
    commenter: { id: commenter_id },
    article: {
      id: article_id,
      author: { id: author_id },
    },
  } = removedComment;
  //  確認 user_id 是否有刪除權限(必須是 留言者本人 或 author_id)
  if (user_id !== commenter_id && user_id !== author_id) {
    throw new MyErr({
      ...ERR_RES.COMMENT.REMOVE.ERR_NO_PERMISSION,
      error: `comment/${comment_id} 刪除失敗`,
    });
  }
  //  找出符合 msg_id = comment_id 的 msgReceiver
  let { receivers } = await Comment.read(
    Opts.COMMENT.FIND._infoAboutItem(comment_id, (paranoid = false))
  );
  let msgReceivers = receivers.reduce(
    (acc, { MsgReceiver }) => {
      if (MsgReceiver.receiver_id === author_id) {
        acc.msgReceiverOfAuthor = MsgReceiver;
      } else {
        acc.msgReceiverOfOthers.push(MsgReceiver);
      }
      return acc;
    },
    { msgReceiverOfAuthor: undefined, msgReceiverOfOthers: [] }
  );
  let { msgReceiverOfAuthor, msgReceiverOfOthers } = msgReceivers;
  let container;
  let isAuthor = commenter_id === author_id;
  //  從作者的通知開始分析
  //  依據作者的通知是否存在 + 此次刪除的是否為作者自己留下的評論，分析如何更新 MsgReceiver數據
  //  若作者的通知存在，且被刪除的評論屬於作者留下的
  if (msgReceiverOfAuthor && isAuthor) {
    //  報錯，因為作者不可能收到自己評論的通知
    throw new MyErr(ERR_RES.MSG_RECEIVER.READ.SHOULD_NOT_EXIST);
  } else if (msgReceiverOfAuthor && !isAuthor) {
    //  找出除了被刪除的評論外，文章中最近一次應該給作者提出通知的評論
    let resModelOfAuthor = await _findLastItemOfNotSelf(
      article_id,
      author_id,
      removedComment.createdAt
    );
    container = _resetMsgReceiver(resModelOfAuthor, msgReceiverOfAuthor);
  } //  其他狀況則是作者的通知不存在，那更本沒東西可更新，則作者的部分不再處理

  //  作者通知的數據更新已完成，接下來處理，其他使用者的通知數據
  //  若存在 除了作者以外，其他使用者的通知
  if (msgReceiverOfOthers.length) {
    let _removedComment = removedComment;
    //  尋找屬於個別使用者，在此文章中，同一pid + 不屬於自己留言 的最新留言
    for (let msgReceiver of msgReceiverOfOthers) {
      let resModelOfOther = await _findLastItemOfPidAndNotSelf(
        article_id,
        msgReceiver.receiver_id,
        _removedComment.createdAt,
        pid
      );
      container = _resetMsgReceiver(resModelOfOther, msgReceiver, container);
    }
  } //  其他狀況則是其他使用者的通知不存在，那更本沒東西可更新，則其他使用者的部分不再處理

  if (container) {
    let { updateList, deleteList } = container;
    //  更新數據
    if (updateList.length) {
      await C_MsgReceiver.setList(updateList);
    }
    //  硬刪除
    if (deleteList.length) {
      await C_MsgReceiver.removeList(deleteList, (force = true));
    }
  }
  let data = Init.time.comment(removedComment);
  let opts = {
    data,
  };
  if (!ENV.isNoCache) {
    opts.cache = { [CACHE.TYPE.PAGE.BLOG]: [article_id] };
  }
  return new SuccModel(opts);
  //  整理出要刪除與更新的msgReceiver
  function _resetMsgReceiver(
    resModelOfLastComment,
    msgReceiver,
    container = { deleteList: [], updateList: [] }
  ) {
    let { errno, data: lastComment } = resModelOfLastComment;
    //  存放需移除的msgReceiver
    let deleteList = container.deleteList;
    //  存放需要更新的msgReceiver
    let updateList = container.updateList;
    if (errno) {
      deleteList.push(msgReceiver.id);
    } else {
      ////  假使存在，依屬於作者通知的comfirm值來判斷要如何更新數據
      if (msgReceiver.confirm) {
        ////  若 confirm，需要修改 msg_id + createdAt
        updateList.push({
          ...msgReceiver,
          msg_id: lastComment.id, //  改為上一筆評論id
          createdAt: lastComment.createdAt, //  改為上一筆評論的創建時間
        });
      } else {
        //  unconfirm 正常來說 createdAt 與 updatedAt 要是一樣的
        //  在addCommmet 時，若發現當前相關的msg還未確認，便會手動改變 updatedAt
        //  便會產生 msg 未確認，新msg也未確認，但是createdAt與createdAt都不同的狀態

        ////  若 unconfirm，依據屬於作者通知的 createdAt - updatedAt 來判斷如何更新數據
        if (msgReceiver.created - msgReceiver.updatedAt === 0) {
          ////  代表僅這筆被刪除的評論通知未確認，但前一筆已經確認過了
          //  更新 msg_id + createdAt + confirm
          updateList.push({
            ...msgReceiver,
            msg_id: lastComment.id,
            createdAt: lastComment.createdAt,
            confirm: true,
          });
        } else {
          //  因為 createdAt與updatedAt不一樣，代表lastComment未確認時msgReceiver便被覆蓋
          //  代表除了這筆被刪除的評論通知未確認，至少連最新的這筆回應未確認
          //  更新 msg_id + updatedAt
          updateList.push({
            ...msgReceiver,
            msg_id: lastComment.id,
          });
        }
      }
    }
    return container;
  }
}
//  提供給前端，渲染newsItem的數據
async function findInfoForNews(comment_id) {
  let info = await Comment.read(Opts.COMMENT.FIND._wholeInfo(comment_id));
  if (!info) {
    throw new ErrModel(ERR_RES.COMMENT.READ.NOT_EXIST);
  }
  let { createdAt, pid, article } = info;

  //  使前端的通知數據，能呈現「某某,某某,...以及其他N人，都回覆你的留言or文章」
  let { data: earlierComments } = await _findUnconfirmListBeforeNews({
    comment_id,
    pid,
    article_id: article.id,
    createdAt,
  });
  //  分類為 commenter (不重複 + 非此 msg 留言者 ) + commentId
  let otherComments = earlierComments.reduce(
    (acc, comment) => {
      let { commenters, comments } = acc;
      let {
        id,
        commenter: { id: commenter_id },
      } = comment;
      let isExist = commenters.some(
        (commenter) => commenter.id === commenter_id
      );
      if (!isExist) {
        let { id, nickname } = comment.commenter;
        commenters.push({ id, nickname });
      }
      comments.push(id);
      return acc;
    },
    { commenters: [], comments: [] }
  );
  let data = { ...info, otherComments };
  return new SuccModel({ data });

  //  獲取早前未確認到的comment資訊
  //  同樣Pid + 晚於 time(createdAt) 的 comment資料
  async function _findUnconfirmListBeforeNews({
    comment_id,
    pid,
    article_id,
    createdAt,
  }) {
    let data = await Comment.readList(
      Opts.COMMENT.FIND._unconfirmListBeforeNews({
        comment_id,
        pid,
        article_id,
        createdAt,
      })
    );
    return new SuccModel({ data });
  }
}
async function confirmNews({ receiver_id, msgReceiver_id }) {
  let comment = await Comment.read(
    Opts.COMMENT.FIND.itemByMsgReceiver({ receiver_id, msgReceiver_id })
  );
  if (!comment) {
    //  msg不存在
    //  譬如msg已刪除，但newsCache不會針對刪除做更新，故receiver可能在session.news中取得已被刪除的msgReceiver_id
    let opts = ERR_RES.NEWS.READ.NOT_EXIST;
    if (!ENV.isNoCache) {
      opts.cache = { [CACHE.TYPE.NEWS]: [receiver_id] };
    }
    return new ErrModel(opts);
  }
  let opts = {
    data: { url: `/blog/${comment.article.id}#comment_${comment.id}` },
  };
  let { MsgReceiver } = comment.receivers[0];
  if (!ENV.isNoCache && !MsgReceiver.confirm) {
    //  更新 msgReceiver
    await C_MsgReceiver.modify(msgReceiver_id, { confirm: true });
    opts.cache = { [CACHE.TYPE.NEWS]: [receiver_id] };
  }
  return new SuccModel(opts);
}

async function removeListInBlog(article_id) {
  let comments = await Comment.readList(
    Opts.COMMENT.FIND._removeListInBlog(article_id)
  );
  let comment_id_list = comments.map((comment) => comment.id);
  let receivers = comments
    .map((comment) => {
      if (comment.receivers?.length) {
        return comment.receivers;
      } else {
        return undefined;
      }
    })
    .filter(Boolean)
    .flat();
  let msgReceiver_id_list = receivers.map(
    (receiver) => receiver.MsgReceiver.id
  );
  if (comment_id_list.length) {
    await Comment.destroyList(Opts.COMMENT.REMOVE.list(comment_id_list));
  }
  if (msgReceiver_id_list) {
    await C_MsgReceiver.removeList(msgReceiver_id_list);
  }
  return new SuccModel();
}

async function destoryReceiver(article_id) {
  let comment_list = await Comment.readList(
    Opts.COMMENT.FIND._receiverListForDestory(article_id)
  );
  let receiver_list = comment_list.map((item) => item.receivers).flat();
  let msgReceiver_id_list = receiver_list.map(
    (receiver) => receiver.MsgReceiver.id
  );
  await C_MsgReceiver.removeList(msgReceiver_id_list);
  return new SuccModel();
}

async function restoryReceiver(article_id) {
  let comment_list = await Comment.readList(
    Opts.COMMENT.FIND._receiverListForRestory(article_id)
  );
  let receiver_list = comment_list.map((item) => item.receivers).flat();
  let msgReceiver_id_list = receiver_list.map(
    (receiver) => receiver.MsgReceiver.id
  );
  await C_MsgReceiver.restoryList(msgReceiver_id_list);
  return new SuccModel();
}

module.exports = {
  restoryReceiver,
  destoryReceiver,
  removeListInBlog,
  confirmNews,
  findInfoForNews,
  remove,
  add,
};
//  找出指定article內，最新 + 與pid相關 + 非commenter_id的評論
async function _findLastItemOfPidAndNotSelf(
  article_id,
  commenter_id,
  time,
  pid
) {
  let comment = await Comment.read(
    Opts.COMMENT._findLastItemOfPidAndNotSelf(
      article_id,
      commenter_id,
      time,
      pid
    )
  );
  if (!comment) {
    return new ErrModel(ERR_RES.COMMENT.READ.NOT_EXIST);
  }
  return new SuccModel({ data: comment });
}
//  找出指定article內，最新且非commenter_id的評論
async function _findLastItemOfNotSelf(article_id, commenter_id, time) {
  let comment = await Comment.read(
    Opts.COMMENT.FIND.lastItemOfNotSelf(article_id, commenter_id, time)
  );
  if (!comment) {
    return new ErrModel(ERR_RES.COMMENT.READ.NOT_EXIST);
  }
  return new SuccModel({ data: comment });
}
//  找出 comment數據，且是為了提供給 ejs render 的格式
async function _findItemForRender(comment_id) {
  let comment = await Comment.read(Opts.COMMENT.FIND._one(comment_id));
  if (!comment) {
    return new ErrModel(ERR_RES.COMMENT.READ.NOT_EXIST);
  }
  let [data] = Init.NestedComments([comment]).tree;
  return new SuccModel({ data });
}
//  找出指定article內，與author的相關msgReceiver
async function _findMsgReceiverOfAuthor({ article_id, author_id }) {
  let comment = await Comment.read(
    Opts.COMMENT.FIND._msgReceiverOfAuthor({ article_id, author_id })
  );
  if (!comment) {
    return new ErrModel(ERR_RES.COMMENT.READ.NOT_EXIST);
  }
  let data = comment.receivers[0].MsgReceiver;
  return new SuccModel({ data });
}
//  找出新創comment時，需更新、新創的 *msgReceiver，以及既存與尚未建立關聯的 receiver
async function _findInfoForAdd({ article_id, commenter_id, pid, author_id }) {
  //  [ comment { id,
  //      receivers: [ { id,
  //        MsgReceiver: { id, msg_id, receiver_id, confirm, deletedAt, createdAt }
  //      }, ...],
  //      commenter: { id }
  //    }, ... ]

  //  尋找 pid、author 相符的 msgReciever
  let list = await Comment.readList(
    Opts.COMMENT.FIND._infoAboutPid({ article_id, pid })
  );

  let res = {
    msgReceiver: {
      others: [],
      author: undefined,
      curCommenter: undefined,
    },
    //  紀錄author與curCommenter以外，與pid相關的commenter
    commenters: {
      //  無論有沒有被登記過
      all: new Set(),
      //  不曾被登記過
      notReceiver: new Set(),
    },
  };
  if (commenter_id !== author_id) {
    res.commenters.all.add(author_id);
  }
  let off = new Set();
  //  receivers: [{ id, msgReceiver: {id, msg_id, receiver_id, confirm, deletedAt, ...time} }]
  //  comment: { id, commenter_id }
  let data = list.reduce((acc, { receivers, ...comment }) => {
    let { msgReceiver, commenters } = acc;
    //  沒有 msgReceiver 的 item
    //  若 reveiver 已經存在其他 item.msgReceiver 時
    //  不須再重複加入 notReceiver 與 other

    //  整理 與pid相關的commenter
    if (
      //  忽略作者
      comment.commenter_id !== author_id &&
      //  忽略留言者
      comment.commenter_id !== commenter_id &&
      //  忽略重複的人
      !off.has(commenter_id)
    ) {
      //  紀錄，避免重複登記
      off.add(comment.commenter_id);
      //  不曾登記過
      commenters.notReceiver.add(comment.commenter_id);
      //  無論有沒有被登記過
      commenters.all.add(comment.commenter_id);
    }
    for (let { id, MsgReceiver } of receivers) {
      ////  整理與此pid有關的receiver
      if (id === author_id) {
        //  紀錄與 作者 有關的 msgReceiver
        msgReceiver.author = MsgReceiver;
      } else if (id === commenter_id) {
        //  紀錄與 留言者 有關的 msgReceiver
        msgReceiver.curCommenter = MsgReceiver;
      } else {
        //  紀錄與 評論者 有關的 msgReceiver
        msgReceiver.others.push(MsgReceiver);
      }
      //  從不曾被列入msgReceiver的評論者名單中過濾掉
      commenters.notReceiver.delete(id);
    }
    return acc;
  }, res);
  return new SuccModel({ data });
}
