exports.checkCLIValue = function (argsFromCLI, targetIdx) {
  return (
    targetIdx === -1 ||
    !argsFromCLI[targetIdx + 1] ||
    argsFromCLI[targetIdx + 1].startsWith('-')
  );
};
