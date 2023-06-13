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
const { refreshVarification } = require(path.join(
  __dirname,
  './lib/varification/refreshVarification',
));

// main
const { init } = require(path.join(__dirname, '/lib/init'));
const { gen } = require(path.join(__dirname, '/lib/gen'));
const { refresh } = require(path.join(__dirname, '/lib/refresh'));

const [command, ...args] = process.argv.slice(2);
const modulePath = getModulePath('env-manage');
const dataJsonPath = path.join(modulePath, '/data.json');
const isModuleExist = checkExist(modulePath);
const dataPath = isModuleExist ? dataJsonPath : './data.json';

const mandatoryArgs = {
  command: ['init', 'gen', 'refresh'],
  init: ['-sve'],
  gen: ['-repo', '-filename'],
  mode: ['-d', '-p'],
};

if (!mandatoryArgs.command.includes(command) && command !== '-h') {
  console.log('\n 🧏 유효한 커맨드를 입력하지 않으셨습니다.');
  console.log('\n 유효한 커맨드 종류는 아래와 같습니다.');
  console.log(`\n ${mandatoryArgs.command}, -h`);
  return;
}

if (command === '-h') {
  //todo console art
  console.log('여기에는 DOC과 관련된 콘솔을 생성합니다.');
  return;
}

if (command === 'init') {
  const secretVarificationEndpointIdx = args.findIndex(e => e === '-sve');
  const genEnvEndpointIdx = args.findIndex(e => e === '-gee');

  if (
    !initVarification(
      args,
      mandatoryArgs,
      secretVarificationEndpointIdx,
      genEnvEndpointIdx,
    )
  ) {
    return;
  }

  init(
    args,
    args[secretVarificationEndpointIdx + 1],
    args[genEnvEndpointIdx + 1],
  );
}

if (command === 'gen') {
  const repoIdx = args.findIndex(e => e === '-repo');
  const filenameIdx = args.findIndex(e => e === '-filename');
  const mode = args.includes('-d') ? '-d' : args.includes('-p') ? '-p' : '';

  if (!genVarification(args, mandatoryArgs, repoIdx)) {
    return;
  }

  gen(args, args[repoIdx + 1], filenameIdx, dataPath, mode);
}

if (command === 'refresh') {
  if (!refreshVarification(dataPath)) {
    return;
  }

  refresh(dataPath);
}
