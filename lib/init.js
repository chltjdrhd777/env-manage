#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const axios = require(path.join(__dirname, './module/axios'));
const { getModulePath } = require(path.join(
  __dirname,
  './helpers/getModulePath',
));

const { checkExist } = require(path.join(__dirname, '/helpers/checkExist'));

const { deleteExistFile } = require(path.join(
  __dirname,
  '/helpers/deleteExistFile',
));

const { genURL } = require(path.join(__dirname, '/helpers/genURL'));
const { askQuestions } = require(path.join(
  __dirname,
  './helpers/askQuestions',
));
const { transformUrlAnswer } = require(path.join(
  __dirname,
  './helpers/transformUrlAnswer',
));
const { handleSelector } = require(path.join(
  __dirname,
  './helpers/handleSelector',
));

exports.init = async function (args, sveEndpoint, geeEndpoint) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // 0 : 개발서버 env 엔드포인트 주소
  // 1 : 운영서버 env 엔드포인트 주소
  // 2 : accessToken 발급받을 환경
  // 3 : accessToken
  const answers = Array(4).fill(undefined);

  const modulePath = getModulePath('env-manage');
  const dataJsonPath = path.join(modulePath, '/data.json');

  rl.addListener('close', rlCloseListner);

  console.log('⭐ origin들을 설정해주세요.\n');
  console.log('주소 입력 시 scheme(ex http) 부분도 같이 붙여주셔야 합니다.');
  console.log('붙이시지 않을 경우, 자동 http로 설정됩니다.\n');

  function rlCloseListner() {
    if (answers[0] && answers[1]) {
      handleSelector({
        answers,
        answerIndex: 2,
        callback: modeSelectorCallback,
        message:
          '어떤 서버에서 Access Token을 발급받길 원하십니까:\n\n🗒   개발 = 개발 서버 origin으로 요청\n🗒   운영 = 운영 서버 origin으로 요청\n',
      });
    }
  }

  function modeSelectorCallback() {
    process.stdin.setRawMode(false); // 기본 lineMode(입력을 계속 버퍼 저장하다가 엔터하면 처리) 에서 rawMode(입력마다 처리) 로 변경한다.
    process.stdin.resume();

    const secretRl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false, //terminal: false 옵션을 사용하면 readline이 터미널이 아닌 스트림에서 실행되도록 설정 (즉, 화살표 등 특이 커맨드의 경우 추가 처리 로직 필요, terminal 커스터마이징)
    });

    secretRl.question(
      '\nAccess Token 발급을 위한 secret을 입력해주세요: ',
      secret => {
        if (!secret) {
          console.log('\n값을 입력하지 않았습니다');
          secretRl.close();
        } else {
          secretValidator(secret, answers, secretRl, generateFileCallback);
        }
      },
    );
  }

  async function secretValidator(secret, answers, secretRl, callback) {
    const baseURL =
      answers[2] === 'devOrigin'
        ? answers[0]
        : answers[2] === 'prodOrigin'
        ? answers[1]
        : '';

    const fullURLtoString = genURL(sveEndpoint, baseURL, args);

    try {
      const accessToken = await axios.post(fullURLtoString, {
        secret,
      });

      if (accessToken.data?.token) {
        // answers.push(accessToken.data?.token);
        answers[3] = accessToken.data?.token;
        callback(secretRl);
      } else {
        throw accessToken.error;
      }
    } catch (err) {
      console.log('\nsecret 검증에 실패하였습니다.');
      console.log(`\nerror name : ${err?.name}`);
      console.log(`\nerror message : ${err?.message}`);
      console.log(`\nerror code : ${err?.code}`);
      // answers.push('');
      answers[3] = '';
      secretRl.close();
    }
  }

  function generateFileCallback(secretRl) {
    // 0 : 개발서버 env 엔드포인트 주소
    // 1 : 운영서버 env 엔드포인트 주소
    // 2 : secret 값

    console.log('\n🗒  응답지 리스트', answers);

    const data = {
      devOrigin: answers[0] ?? '',
      prodOrigin: answers[1] ?? '',
      sveEndpoint,
      geeEndpoint,
      accessToken: answers[3] ?? '',
    };
    const jsonData = JSON.stringify(data, null, 2);

    const isModuleExist = checkExist(modulePath);

    try {
      if (isModuleExist) {
        //모듈이 존재한다는 것은 => 현재 이 스크립트가 타 프로젝트에서 인스톨되어 사용되고 있다는 뜻
        // console.log('run from module');
        deleteExistFile(dataJsonPath, () => {
          fs.writeFileSync(dataJsonPath, jsonData, 'utf-8');
        });
      } else {
        //모듈이 없다는 것 => 테스트 환경에서 로컬로 돌려보고 있는 중
        // console.log('run from local');
        deleteExistFile('./data.json', () => {
          fs.writeFileSync('./data.json', jsonData, 'utf-8');
        });
      }
      secretRl.close();
    } catch (error) {
      console.log(
        '\n존재하는 data.json 파일 삭제가 실패하였습니다. 다시 시도해주세요.',
      );
      secretRl.close();
    }
  }

  function URLValidator(answer, index) {
    if (!answer) {
      console.log('\n값을 입력하지 않았습니다');
      return false;
    }

    // answers.push(transformUrlAnswer(answer));
    answers[index] = transformUrlAnswer(answer);
    return true;
  }

  const questions = [
    {
      question: '개발 서버 origin을 입력해주세요(ex https://devExample.com): ',
      validator: URLValidator,
    },
    {
      question: '운영 서버 origin을 입력해주세요(ex https://prodExample.com): ',
      validator: URLValidator,
    },
  ];

  askQuestions(questions, rl);
};
