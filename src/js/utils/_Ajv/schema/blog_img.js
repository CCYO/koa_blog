import TYPE from "../type";
export default function (HOST, DEFAULT) {
  const DEFAULT_URL = `${HOST}/${DEFAULT}.json#/definitions`;
  return {
    $id: `${HOST}/${TYPE.BLOG_IMG}.json`,
    type: "object",
    properties: {
      size: {
        type: "number",
        $ref: `${DEFAULT_URL}/blogImg_size`,
      },
      ext: {
        type: "string",
        $ref: `${DEFAULT_URL}/img_ext`,
      },
    },
    required: ["size", "ext"],
    _noSpace: ["ext"],
    _notEmpty: ["ext"],
  };
}
