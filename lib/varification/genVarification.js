#!/usr/bin/env node
const path = require('path');
const { checkExist } = require(path.join(__dirname, '../helpers/checkExist'));
const { getModulePath } = require(path.join(
  __dirname,
  '../helpers/getModulePath',
));
const { checkCLIValue } = require(path.join(
  __dirname,
  '../helpers/checkCLIValue',
));

exports.genVarification = (
  argsFromCLI,
  madatoryArgs,
  repoIdx,
  genEnvEndpointIdx,
) => {
  // function cliVarification(targetIdx) {
  //   return (
  //     targetIdx === -1 ||
  //     !argsFromCLI[targetIdx + 1] ||
  //     argsFromCLI[targetIdx + 1].startsWith('-')
  //   );
  // }
  //1. CLI 유효성 체크
  if (checkCLIValue(argsFromCLI, repoIdx)) {
    console.log('😑 repo를 설정해주세요.\n');
    console.log(
      'gen 예시) npx env-manage gen -d -repo afun-wallet-app -gee v1/env-generate -filename env.production',
    );
    return false;
  }

  if (checkCLIValue(argsFromCLI, genEnvEndpointIdx)) {
    console.log('😑 env를 가져올 엔드포인트를 설정해주세요.(-gee)\n');
    console.log(
      'gen 예시) npx env-manage gen -d -repo afun-wallet-app -gee v1/env-generate -filename env.production',
    );
    return false;
  }

  if (!argsFromCLI.includes('-d') && !argsFromCLI.includes('-p')) {
    console.log(
      '\n필요한 command가 비어있습니다.\n' +
        '😑 사용가능 command list = ' +
        madatoryArgs.gen +
        '\n',
      'gen 예시) npx env-manage gen -d -repo afun-wallet-app -gee v1/env-generate -filename env.production',
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
    console.log('\ninit 예시) npx env-manage init -d -sve v1/env-init');
    return false;
  }

  return true;
};
