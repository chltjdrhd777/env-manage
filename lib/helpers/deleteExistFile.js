#!/usr/bin/env node
const fs = require('fs');

exports.deleteExistFile = (
  filePath,
  callback,
  deleteComment = '🧏 이미 해당 이름의 파일이 존재하므로, 삭제 후 재생성합니다.',
) => {
  const isExist = fs.existsSync(filePath);
  if (isExist) {
    console.log(deleteComment);
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
