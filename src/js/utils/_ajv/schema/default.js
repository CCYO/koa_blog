import AJV_CONFIG from "../config";
import definitions from "@config/ajv_default_esm";

export default {
  $id: `${AJV_CONFIG.HOST}/${AJV_CONFIG.TYPE.DEFAULT}.json`,
  definitions,
};
