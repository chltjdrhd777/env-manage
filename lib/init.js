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

exports.init = async function (args, sveEndpoint, geeEndpoint) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answers = [];

  const modulePath = getModulePath('env-manage');
  const dataJsonPath = path.join(modulePath, '/data.json');

  rl.addListener('close', () => {
    if (answers.length && !answers.some(e => e === '')) {
      console.log('🗒  응답지 리스트', answers);

      // 0 : 개발서버 env 엔드포인트 주소
      // 1 : 운영서버 env 엔드포인트 주소
      // 2 : secret 값
      const data = {
        devOrigin: answers[0] ?? '',
        prodOrigin: answers[1] ?? '',
        sveEndpoint,
        geeEndpoint,
        accessToken: answers[2] ?? '',
      };
      const jsonData = JSON.stringify(data, null, 2);

      const isModuleExist = checkExist(modulePath);

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
    }
  });

  console.log('⭐ origin들을 설정해주세요.\n');
  console.log('주소 입력 시 scheme(ex http) 부분도 같이 붙여주셔야 합니다.');
  console.log('붙이시지 않을 경우, 자동 http로 설정됩니다.\n');

  const questions = [
    {
      question: '개발 서버 origin을 입력해주세요(ex https://devExample.com): ',
      validator: answer => {
        if (!answer) {
          console.log('\n값을 입력하지 않았습니다');
          return false;
        }

        answers.push(transformUrlAnswer(answer));
        return true;
      },
    },
    {
      question: '운영 서버 origin을 입력해주세요(ex https://prodExample.com): ',
      validator: answer => {
        if (!answer) {
          console.log('\n값을 입력하지 않았습니다');
          return false;
        }

        answers.push(transformUrlAnswer(answer));
        return true;
      },
    },
    {
      question: 'secret 값을 입력해주세요: ',
      validator: async answer => {
        const baseURL = args.includes('-d')
          ? answers[0]
          : args.includes('-p')
          ? answers[1]
          : '';

        const fullURLtoString = genURL(sveEndpoint, baseURL, args);

        try {
          const accessToken = await axios.post(fullURLtoString, {
            secret: answer,
          });

          if (accessToken.data?.token) {
            answers.push(accessToken.data?.token);
            return true;
          } else {
            throw accessToken.error;
          }
        } catch (err) {
          console.log('\nsecret 검증에 실패하였습니다.');
          console.log(`\nerror name : ${err?.name}`);
          console.log(`\nerror message : ${err?.message}`);
          console.log(`\nerror code : ${err?.code}`);
          answers.push('');
          return false;
        }
      },
    },
  ];

  askQuestions(questions, rl);
};
