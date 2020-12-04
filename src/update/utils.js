function zipObject(keys, values) {
  const object = {};

  for (let i = 0; i < keys.length; ++i) {
    object[keys[i]] = values[i];
  }

  return object;
}

module.exports = { zipObject };
