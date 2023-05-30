#!/usr/bin/env node
const fs = require('fs');

exports.checkExist = path => {
  const isExist = fs.existsSync(path);

  return isExist;
};
