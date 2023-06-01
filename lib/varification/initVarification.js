const path = require('path');
const { checkInvalidCLIValue } = require(path.join(
  __dirname,
  '../helpers/checkInvalidCLIValue',
));

exports.initVarification = (
  argsFromCLI,
  madatoryArgs,
  secretVarificationEndpointIdx,
  genEnvEndpointIdx,
) => {
  if (checkInvalidCLIValue(argsFromCLI, secretVarificationEndpointIdx)) {
    console.log('😑 secret 확인을 위한 endpoint를 설정해주세요.(-sve)\n');
    console.log(
      'init 예시) npx env-manage init -d -sve v1/env-init -gee v1/env-generate',
    );
    return false;
  }

  if (checkInvalidCLIValue(argsFromCLI, genEnvEndpointIdx)) {
    console.log(
      '😑 env generate을 위한 endpoint 초깃값을 설정해주세요.(-gee)\n',
    );
    console.log(
      'init 예시) npx env-manage init -d -sve v1/env-init -gee v1/env-generate',
    );
    return false;
  }

  if (!argsFromCLI.includes('-d') && !argsFromCLI.includes('-p')) {
    console.log(
      '\n어떤 환경에서 secret을 검증할 것인지 선택해 주세요\n' +
        `해당 mode에 따라서, 기존 답변하신 origin에 요청하여 secret을 검증합니다.\n`,
      '\n😑 사용가능 command mode = ' + madatoryArgs.mode + '\n',
      'init 예시) npx env-manage init -d -sve v1/env-init',
    );
    return false;
  } else if (argsFromCLI.includes('-d') && argsFromCLI.includes('-p')) {
    console.log('\nmode는 하나만 설정해 주세요. (-d 혹은 -p)');
    return false;
  }

  return true;
};
