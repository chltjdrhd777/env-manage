#!/usr/bin/env node
const fs = require('fs');

exports.createEnv = (filePath, data, filename = '.env') => {
  fs.writeFileSync(filePath, data);
  console.log(`${filename} 파일이 생성되었습니다.`);
};
