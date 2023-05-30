const path = require('path');

exports.getModulePath = function (moduleName) {
  // 현재 파일 기준 상대적 경로 갖고 싶을 때 = __dirname을 쓰면 좋다
  // 현재 해당 모듈을 사용하고 있는 "working directory" 기준으로 경로를 갖고 싶을 때 = process.cwd를 쓰면 좋다
  return path.resolve(process.cwd(), 'node_modules', moduleName);
};
