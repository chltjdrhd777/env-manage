exports.transformUrlAnswer = function (answer) {
  function isUrlStartsWithScheme(url) {
    const pattern = /^(http|https):\/\//;
    return pattern.test(url);
  }

  const removeComma = answer.replace(/["']/g, '');
  const addScheme = isUrlStartsWithScheme(removeComma)
    ? removeComma
    : `http://${removeComma}`;

  return addScheme;
};
