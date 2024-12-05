/* CONFIG      ----------------------------------------------------------------------------- */
const { NEWS } = require("../config");

/* NPM         ----------------------------------------------------------------------------- */
const { QueryTypes } = require("sequelize");

/* CUSTOM      ----------------------------------------------------------------------------- */
const { seq } = require("../db/mysql/model");

async function readList({ user_id, excepts }) {
  /*
    {
        unconfirm: [
        { type, id, timestamp, confirm, fans: ... },
        { type, id, timestamp, confirm, blog: ... },
        { type, id, timestamp, confirm, comment: ... },
        ... ],
        confirm: [...] 
    }*/
  return await seq.query(genQuery(user_id, excepts), {
    type: QueryTypes.SELECT,
  });

  function genQuery(user_id, excepts) {
    let list = { idolFans: "", articleReader: "", msgReceiver: "" };

    for (key in list) {
      list[key] =
        (excepts[key].length && ` AND id NOT IN (${excepts[key].join(",")})`) ||
        "";
    }
    return `
    SELECT type, id, target_id, follow_id, confirm, createdAt, updatedAt
    FROM (
        SELECT ${NEWS.TYPE.IDOL_FANS} as type, id , idol_id as target_id , fans_id as follow_id, confirm, createdAt, updatedAt
        FROM IdolFans
        WHERE 
            idol_id=${user_id}
            AND deletedAt IS NULL
            ${list.idolFans}
  
        UNION
  
        SELECT ${NEWS.TYPE.ARTICLE_READER} as type, id, article_id as target_id, reader_id as follow_id, confirm, createdAt, updatedAt 
        FROM ArticleReaders
        WHERE 
            reader_id=${user_id}
            AND deletedAt IS NULL
            ${list.articleReader}
  
        UNION
  
        SELECT ${NEWS.TYPE.MSG_RECEIVER} as type, id, msg_id as target_id, receiver_id as follow_id, confirm, createdAt, updatedAt 
        FROM MsgReceivers
        WHERE 
            receiver_id=${user_id}
            AND deletedAt IS NULL
            ${list.msgReceiver}
  
    ) AS table_dual
    ORDER BY confirm, updatedAt DESC
    LIMIT ${NEWS.LIMIT}
    `;
  }
}

async function count(user_id) {
  let [{ unconfirm, confirm, total }] = await seq.query(genQuery(user_id), {
    type: QueryTypes.SELECT,
  });
  return { unconfirm, confirm, total };

  function genQuery(user_id) {
    return `
      SELECT
          COUNT(if(confirm < 1, true, null)) as unconfirm, 
          COUNT(if(confirm = 1, true, null)) as confirm, 
          COUNT(*) as total
      FROM (
          SELECT ${NEWS.TYPE.IDOL_FANS} as type, id, confirm
          FROM IdolFans
          WHERE
              idol_id=${user_id} 
              AND deletedAt IS NULL 
          UNION
  
          SELECT ${NEWS.TYPE.ARTICLE_READER} as type, id, confirm
          FROM ArticleReaders
          WHERE 
              reader_id=${user_id}
              AND deletedAt IS NULL 
          UNION
  
          SELECT ${NEWS.TYPE.MSG_RECEIVER} as type, id, confirm
          FROM MsgReceivers
          WHERE
              receiver_id=${user_id}
              AND deletedAt IS NULL 
      ) AS table_dual
      `;
  }
}

module.exports = {
  readList,
  count,
};
