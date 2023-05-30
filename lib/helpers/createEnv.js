#!/usr/bin/env node
const fs = require('fs');

exports.createEnv = (filePath, data) => {
  fs.writeFileSync(filePath, data);
  console.log('.env 파일이 생성되었습니다.');
};
