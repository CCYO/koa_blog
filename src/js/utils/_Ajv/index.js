/* UTILS      ----------------------------------------------------------------------------- */
import AJV_CONFIG from "./config";

/* CUSTOM     ----------------------------------------------------------------------------- */
import schema_list from "./schema";
import { _Ajv } from "../../../../common/dist/index.esm";

export default function (axios) {
  const _ajv = new _Ajv({
    axios,
    schema_list,
    AJV_CONFIG,
  });
  return _ajv;
}
