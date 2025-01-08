/**
 * _AXIOS
 * @description 針對特定的response設定處理方式，統一處理錯誤
 */

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
        // 關閉LoadingBackdrop
        if (instance.autoLoadingBackdrop) {
          instance.backdrop.hidden();
        }
        //  resData { errno, data }
        let resData = response.data;
        if (
          //  後端需要登入權限的請求，響應 noLogin 提醒
          resData.errno === COMMON.ERR_RES.AXIOS.RESPONSE_NO_LOGIN.errno ||
          //  後端針對news請求，響應 noLogin 提醒
          (resData.errno === COMMON.ERR_RES.AXIOS.NEWS_NO_LOGIN.errno &&
            !this.#ACTIVE_WHITE_LIST.some((item) => item === active))
        ) {
          return Promise.reject(resData);
        }
        return Promise.resolve(resData);
      },
      (axiosError) => {
        // 關閉LoadingBackdrop
        if (instance.autoLoadingBackdrop) {
          instance.backdrop.hidden();
        }
        !process.env.isProd && console.log("_axios捕獲到Server Error");
        // axiosError.response.data { errno, data }
        return Promise.reject(axiosError.response.data);
      }
    );
    return instance;
  }
}
