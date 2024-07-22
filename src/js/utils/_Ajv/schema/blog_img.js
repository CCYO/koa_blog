import { type } from "jquery";
import AJV_CONFIG from "../config";

const { HOST, TYPE } = AJV_CONFIG;
const DEFAULT_URL = `${HOST}/${TYPE.DEFAULT}.json#/definitions`;

export default {
  $id: `${HOST}/${TYPE.BLOG_IMG}.json`,
  type: "object",
  properties: {
    size: {
      type: "number",
      maximum: 1 * 1024 * 1024,
    },
    ext: {
      type: "string",
      $ref: `${DEFAULT_URL}/avatar_ext`,
    },
    alt: {
      type: "string",
      $ref: `${DEFAULT_URL}/alt`,
    },
  },
  required: ["size", "ext", "alt"],
  _noSpace: ["ext", "alt"],
};
