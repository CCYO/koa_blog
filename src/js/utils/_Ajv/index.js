/* UTILS      ----------------------------------------------------------------------------- */
import type from "./type";

/* CUSTOM     ----------------------------------------------------------------------------- */
import schemaFn_list from "./schema";
// import { _Ajv } from "../../../assets/js/common";
import { _Ajv } from "../../../../common/dist/common.esm.js";

export default function (axios) {
  const _ajv = new _Ajv({
    axios,
    schemaFn_list,
    type,
  });
  return _ajv;
}
