/* wraps params into array */
function paramsToArray(params) {
  if (Array.isArray(params))
    return params;

  return [params];
}

module.exports = paramsToArray;
