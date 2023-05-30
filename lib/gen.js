#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const axios = require('axios');
const { createEnv } = require(path.join(__dirname, '/helpers/createEnv'));
const { genURL } = require(path.join(__dirname, '/helpers/genURL'));

exports.gen = (args, repo, genEnvEndpoint, filenameIdx, dataPath, mode) => {
  console.log('오는 값 제대로 오는 지 확인');
  console.log(args, repo, dataPath, filenameIdx, mode);

  const readJSON = fs.readFile(dataPath, 'utf-8', async (err, rawJSON) => {
    if (err) {
      console.log('🧏 파일을 읽는 것을 실패했습니다.');
    } else {
      const json = JSON.parse(rawJSON);
      const baseURL =
        mode === '-d' ? json.devOrigin : mode === '-p' ? json.prodOrigin : '';
      const fullURLtoString = genURL(genEnvEndpoint, baseURL);

      console.log('json', json, fullURLtoString);

      let refinedEnvList;

      try {
        const envRequest = await axios.post(
          fullURLtoString,
          {
            repo,
          },
          {
            headers: {
              Authorization: json.accessToken,
            },
          },
        );

        const envList = envRequest.data ?? [];

        refinedEnvList = envList
          .map(envData => `${envData.key}=${envData.value ?? '()'}`)
          .join('\n');
      } catch (err) {
        console.log('env 요청이 실패하였습니다.');
        refinedEnvList = [];
      }

      try {
        let envPath = '';

        if (
          filenameIdx !== -1 &&
          args[filenameIdx + 1] &&
          !args[filenameIdx + 1].startsWith('-')
        ) {
          envPath = `./.${args[filenameIdx + 1]}`;
        } else {
          envPath = './.env';
        }

        const isEnvExist = fs.existsSync(envPath);
        if (isEnvExist) {
          console.log(
            '🧏 이미 해당 이름의 파일이 존재하므로, 삭제 후 재생성합니다.',
          );
          fs.unlink(envPath, err => {
            if (err) {
              console.log('🧏 파일을 삭제하던 도중 문제가 발생했습니다.', err);
            } else {
              createEnv(envPath, refinedEnvList);
            }
          });
        } else {
          createEnv(envPath, refinedEnvList);
        }
      } catch (err) {
        console.error('파일 생성, 삭제 중 오류가 발생했습니다:', err);
      }
    }
  });
};
