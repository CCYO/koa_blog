/* Const Module ----------------------------------------------------------------------------- */
import FRONTEND from "@config/frontend_esm";
/* Utils Module ----------------------------------------------------------------------------- */
import axios from "axios";
import errorHandle from "./errorHandle";
import { dev_log } from "./dev";

export default class {
  REG = {
    IGNORE_PATH:
      /^\/(login)|(register)|(other)|(square)|(blog)|(permission)|(serverError)/,
  };
  constructor({ backdrop = undefined }) {
    if (!backdrop) {
      throw new Error("創建axios instance未提供blockPage參數");
    }
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
        let resolve = true;
        let {
          config: { url },
          data: { errno, msg },
        } = response;
        //  res { errno, data }
        let res = response.data;

        if (
          errno === FRONTEND._AXIOS.ERR_RES.NEWS_NO_LOGIN.errno &&
          !this.REG.IGNORE_PATH.test(location.pathname)
        ) {
          ////  response 為 news請求的 noLogin 提醒
          resolve = false;
        } else if (errno === FRONTEND._AXIOS.ERR_RES.NO_LOGIN.errno) {
          ////  response 為 非news請求的 noLogin 提醒
          resolve = false;
        }
        if (instance.autoLoadingBackdrop) {
          instance.backdrop.hidden();
        }
        if (!resolve) {
          return Promise.reject(new Error(JSON.stringify(res)));
        }
        return Promise.resolve(res);
      },
      (axiosError) => {
        dev_log("_axios 捕獲到錯誤，交給 $M_common.error_handle 處理");
        errorHandle(axiosError.response.data);
      }
    );
    return instance;
  }
}
