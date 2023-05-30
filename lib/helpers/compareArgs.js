exports.compareArgs = (a, b) => {
  // b 배열을 Set으로 변환하여 중복된 값 제거
  const aSet = new Set(a);
  const bSet = new Set(b);
  console.log(aSet, bSet);

  for (let arg of aSet) {
    if (bSet.has(arg)) {
      continue;
    } else {
      return false;
    }
  }

  return true;
};
