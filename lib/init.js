#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const axios = require('axios');
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

exports.init = async function (args, endpoint) {
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

      const data = {
        devOrigin: answers[0] ?? '',
        prodOrigin: answers[1] ?? '',
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

  // 0 : 개발서버 env 엔드포인트 주소
  // 1 : 운영서버 env 엔드포인트 주소
  // 2 : secret 값

  function askQuestions(questions, index = 0) {
    if (index >= questions.length) {
      rl.close();
      return;
    }

    const question = questions[index]?.question;
    const validator = questions[index]?.validator;

    rl.question(question, async answer => {
      const isValid = !validator ? false : await validator(answer);

      if (!isValid) {
        rl.close();
      } else {
        askQuestions(questions, index + 1); // 다음 질문으로 이동
      }
    });
  }

  const questions = [
    {
      question: '개발 서버 origin을 입력해주세요: ',
      validator: answer => {
        if (!answer) {
          console.log('\n값을 입력하지 않았습니다');
          return false;
        }

        answers.push(answer.replace(/["']/g, ''));
        return true;
      },
    },
    {
      question: '운영 서버 origin을 입력해주세요: ',
      validator: answer => {
        if (!answer) {
          console.log('\n값을 입력하지 않았습니다');
          return false;
        }

        answers.push(answer.replace(/["']/g, ''));
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

        const fullURLtoString = genURL(endpoint, baseURL);

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
          // console.log('secret 검증에 실패하였습니다.', err);
          console.log('\nsecret 검증에 실패하였습니다.');
          answers.push('');
          return false;
        }
      },
    },
  ];

  askQuestions(questions);
};
