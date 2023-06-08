#!/usr/bin/env node
const fs = require('fs');

exports.refreshVarification = dataPath => {
  try {
    // 찾지 못하면 자동으로 에러를 throw하여 catch로 빠진다.
    fs.readFileSync(dataPath);
    return true;
  } catch {
    console.log('🧏 데이터가 존재하지 않습니다.\n');
    console.log('init을 해주시기 바랍니다.\n');
    console.log('npx env-manage init -sve v1/env-init -gee v1/env-generate');
    return false;
  }
};
