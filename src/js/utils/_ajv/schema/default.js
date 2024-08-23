import AJV_CONFIG from "../config";
import definitions from "@config/ajv_default_esm";

const { HOST, TYPE } = AJV_CONFIG;

export default {
  $id: `${HOST}/${TYPE.DEFAULT}.json`,
  definitions,
};
