exports.initVarification = (
  argsFromCLI,
  madatoryArgs,
  secretVarificationEndpointIdx,
) => {
  if (
    secretVarificationEndpointIdx === -1 ||
    !argsFromCLI[secretVarificationEndpointIdx + 1] ||
    !argsFromCLI[secretVarificationEndpointIdx + 1].includes('/')
  ) {
    console.log('😑 secret 확인을 위한 endpoint를 설정해주세요.\n');
    console.log('init 예시) npx env-manage init -d -sve v1/env-init');
    return false;
  }

  if (!argsFromCLI.includes('-d') && !argsFromCLI.includes('-p')) {
    console.log(
      '\n필요한 command가 비어있습니다.\n' +
        '😑 사용가능 command list = ' +
        madatoryArgs.init +
        '\n',
      'init 예시) npx env-manage init -d -sve v1/env-init',
    );
    return false;
  } else if (argsFromCLI.includes('-d') && argsFromCLI.includes('-p')) {
    console.log('\nmode는 하나만 설정해 주세요. (-d 혹은 -p)');
    return false;
  }

  return true;
};
