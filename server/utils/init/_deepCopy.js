function deepCopy(inputObject, prop) {
  if (
    inputObject instanceof Date ||
    typeof inputObject !== "object" ||
    inputObject === null
  ) {
    return inputObject;
  }
  let box = Array.isArray(inputObject) ? [] : {};
  for (let prop in inputObject) {
    let val = inputObject[prop];
    box[prop] = deepCopy(val, prop);
  }
  return box;
}

module.exports = {
  deepCopy,
};
