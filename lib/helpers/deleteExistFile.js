#!/usr/bin/env node
const fs = require('fs');

exports.deleteExistFile = (filePath, callback) => {
  const isExist = fs.existsSync(filePath);
  if (isExist) {
    fs.unlink(filePath, err => {
      if (err) {
        console.log('기존에 존재하던 파일 삭제 실패', err);
      } else {
        callback && callback();
      }
    });
  }

  callback && callback();
};
