#!/usr/bin/env node
const path = require('path');

// helpers
const { compareArgs } = require(path.join(
  __dirname,
  '/lib/helpers/compareArgs',
));
const { checkExist } = require(path.join(
  __dirname,
  './lib/helpers/checkExist',
));
const { getModulePath } = require(path.join(
  __dirname,
  './lib/helpers/getModulePath',
));

// varifications
const { initVarification } = require(path.join(
  __dirname,
  '/lib/varification/initVarification',
));
const { genVarification } = require(path.join(
  __dirname,
  '/lib/varification/genVarification',
));

// main
const { init } = require(path.join(__dirname, '/lib/init'));
const { gen } = require(path.join(__dirname, '/lib/gen'));

const [command, ...args] = process.argv.slice(2);
const modulePath = getModulePath('env-manage');
const dataJsonPath = path.join(modulePath, '/data.json');

console.log(command, args, '이 콘솔은 나중에 지웁시다. cli.js의 20번째 줄');

const mandatoryArgs = {
  command: ['init', 'gen', 'refresh'],
  init: ['-d', '-p', '-sve'],
  gen: ['-d', '-p', '-repo', '-', '-filename'],
};

if (!mandatoryArgs.command.includes(command) && command !== '-h') {
  console.log('\n 🧏 유효한 커맨드를 입력하지 않으셨습니다.');
  console.log('\n 유효한 커맨드 종류는 아래와 같습니다.');
  console.log(`\n ${mandatoryArgs.command}`);
  return;
}

if (command === '-h') {
  console.log('여기에는 DOC과 관련된 콘솔을 생성합니다.');
  return;
}

if (command === 'init') {
  const secretVarificationEndpointIdx = args.findIndex(e => e === '-sve');

  if (!initVarification(args, mandatoryArgs, secretVarificationEndpointIdx)) {
    return;
  }

  init(args, args[secretVarificationEndpointIdx + 1]);
}

if (command === 'gen') {
  const repoIdx = args.findIndex(e => e === '-repo');
  const filenameIdx = args.findIndex(e => e === '-filename');
  const genEnvEndpointIdx = args.findIndex(e => e === '-gee');
  const mode = args.includes('-d') ? '-d' : args.includes('-p') ? '-p' : '';
  const isModuleExist = checkExist(modulePath);
  const dataPath = isModuleExist ? dataJsonPath : './data.json';

  if (!genVarification(args, mandatoryArgs, repoIdx, genEnvEndpointIdx)) {
    return;
  }

  gen(
    args,
    args[repoIdx + 1],
    args[genEnvEndpointIdx + 1],
    filenameIdx,
    dataPath,
    mode,
  );
}

if (command === 'refresh') {
  //1. 우선 data.json이 있는 지 찾는다
  //2. 만약 없다면, init 먼저 하라고 한다.
  //3. 만약 있다면, readline으로 secret과 환경을 물어본다
  //4. 어느 하나라도 답 안하면 바로 종료시킨다.
  //5. 만약 둘 다 답을 했으면, data.json에서 해당 환경에 대한 url로 secret 넣어서 검증받아서 token을 받아온다.
  //6. 그리고 나서 다시 data.json을 만들어서 저장한다.
  // 위의 로직은 init과 겹치는 부분이 존재하므로, 공통화 할 수 있는 부분이 있는 지 확인한다.-
}