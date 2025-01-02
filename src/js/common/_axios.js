/**
 * _AXIOS
 * @description 針對特定的response設定處理方式，統一處理錯誤
 */

/* UTILS      ----------------------------------------------------------------------------- */
import errorHandle from "../utils/errorHandle";

/* CONFIG     ----------------------------------------------------------------------------- */
import { COMMON } from "../../config";

/* NPM        ----------------------------------------------------------------------------- */
import axios from "axios";

/* EXPORT     ----------------------------------------------------------------------------- */
export default class {
  // 無登入權限也可訪問的白名單頁面
  #ACTIVE_WHITE_LIST = [
    //  不允許登入權限的頁面
    COMMON.PAGE.REGISTER_LOGIN.ACTIVE.REGISTER,
    COMMON.PAGE.REGISTER_LOGIN.ACTIVE.LOGIN,
    //  不需要登入權限的頁面
    COMMON.PAGE.SQUARE.ACTIVE._,
    COMMON.PAGE.USER.ACTIVE.OTEHR,
    COMMON.PAGE.BLOG.ACTIVE._,
    COMMON.PAGE.BLOG.ACTIVE.PREVIEW,
    COMMON.PAGE.ERR_PAGE.ACTIVE.NODE_JS,
    COMMON.PAGE.ERR_PAGE.ACTIVE.NGINX,
  ];

  constructor({ backdrop = undefined, active }) {
    let instance = axios.create();
    instance.backdrop = backdrop;

    /* 配置 axios 的 請求攔截器，統一處理報錯 */
    instance.interceptors.request.use(
      (config) => {
        //  當 axios 調用請求方法時，可利用config.backdrop.blockPage操作是否讓遮罩顯示在畫面中
        const backdrop_config = config.backdrop
          ? config.backdrop
          : { blockPage: false };
        if (instance.autoLoadingBackdrop) {
          //  開啟遮罩
          instance.backdrop.show(backdrop_config);
        }
        return config;
      },
      (error) => {
        throw error;
      }
    );

    /* 配置 axios 的 響應攔截器，統一處理報錯 */
    instance.interceptors.response.use(
      (response) => {
        let ok = true;
        //  resData { errno, data }
        let resData = response.data;

        if (
          resData.errno === COMMON.ERR_RES.AXIOS.NEWS_NO_LOGIN.errno &&
          !this.#ACTIVE_WHITE_LIST.some((item) => item === active)
        ) {
          //  response 為 news請求的 noLogin 提醒
          ok = false;
        } else if (
          resData.errno === COMMON.ERR_RES.AXIOS.RESPONSE_NO_LOGIN.errno
        ) {
          //  response 為 非news請求的 noLogin 提醒
          ok = false;
        }
        if (instance.autoLoadingBackdrop) {
          instance.backdrop.hidden();
        }
        if (!ok) {
          return Promise.reject(resData);
        }
        return Promise.resolve(resData);
      },
      (axiosError) => {
        !process.env.isProd && console.log("_axios捕獲到Server Error");
        // axiosError.response.data { model: { errno, data }}
        errorHandle(axiosError.response.data);
      }
    );
    return instance;
  }
}
