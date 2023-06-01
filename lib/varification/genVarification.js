#!/usr/bin/env node
const path = require('path');
const { checkExist } = require(path.join(__dirname, '../helpers/checkExist'));
const { getModulePath } = require(path.join(
  __dirname,
  '../helpers/getModulePath',
));
const { checkInvalidCLIValue } = require(path.join(
  __dirname,
  '../helpers/checkInvalidCLIValue',
));

exports.genVarification = (argsFromCLI, madatoryArgs, repoIdx) => {
  //1. CLI 유효성 체크
  if (checkInvalidCLIValue(argsFromCLI, repoIdx)) {
    console.log('😑 repo를 설정해주세요.\n');
    console.log('해당 repo로 DB에서 필터링하여 필요한 값을 가져옵니다.\n');
    console.log(
      'gen 예시) npx env-manage gen -d -repo afun-wallet-app -filename .env.development',
    );
    return false;
  }

  if (!argsFromCLI.includes('-d') && !argsFromCLI.includes('-p')) {
    console.log(
      '\nenv를 가져올 환경을 설정해주세요\n' +
        `해당 mode 설정에 따라, init 당시에 저장했던 origin 주소로 요청을 보내 env 값을 가져옵니다\n`,
      '\n😑 사용가능 mode = ' + madatoryArgs.mode + '\n',
      'gen 예시) npx env-manage gen -d -repo afun-wallet-app -filename .env.development',
    );
    return false;
  } else if (argsFromCLI.includes('-d') && argsFromCLI.includes('-p')) {
    console.log('\nmode는 하나만 설정해 주세요. (-d 혹은 -p)');
    return false;
  }

  //2. 데이터 파일 존재여부 체크
  const modulePath = getModulePath('env-manage');
  const isModuleExist = checkExist(modulePath);
  const isDataExist = isModuleExist
    ? checkExist(path.join(modulePath, '/data.json'))
    : checkExist('./data.json');

  if (!isDataExist) {
    console.log('\n🧏 데이터가 존재하지 않습니다');
    console.log('\ninit 먼저 진행해주세요');
    console.log(
      '\ninit 예시) npx env-manage init -d -sve v1/env-init -gee v1/env-generate',
    );
    return false;
  }

  return true;
};
