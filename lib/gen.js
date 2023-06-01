#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const axios = require(path.join(__dirname, './module/axios'));
const { createEnv } = require(path.join(__dirname, '/helpers/createEnv'));
const { genURL } = require(path.join(__dirname, '/helpers/genURL'));

exports.gen = (args, repo, filenameIdx, dataPath, mode) => {
  fs.readFile(dataPath, 'utf-8', async (err, rawJSON) => {
    if (err) {
      console.log('🧏 파일을 읽는 것을 실패했습니다.', err);
    } else {
      const json = JSON.parse(rawJSON);
      const baseURL =
        mode === '-d' ? json.devOrigin : mode === '-p' ? json.prodOrigin : '';
      const genEnvEndpoint = json.geeEndpoint;
      const fullURLtoString = genURL(genEnvEndpoint, baseURL, args);

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

        const envList = envRequest?.data ?? [];

        refinedEnvList = envList
          .map(
            (envData, envId) =>
              `${envData?.key ?? `undefined-${envId}`}=${
                envData?.value ?? '()'
              }`,
          )
          .join('\n');
      } catch (err) {
        console.log('env 요청이 실패하였습니다.\n');
        console.log(`\nerror name : ${err?.name}`);
        console.log(`\nerror message : ${err?.message}`);
        console.log(`\nerror code : ${err?.code}`);
        return;
      }

      try {
        let envPath = '';

        if (
          filenameIdx !== -1 &&
          args[filenameIdx + 1] &&
          !args[filenameIdx + 1].startsWith('-')
        ) {
          envPath = `./${args[filenameIdx + 1]}`;
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
              createEnv(envPath, refinedEnvList, envPath.slice(2));
            }
          });
        } else {
          createEnv(envPath, refinedEnvList, envPath.slice(2));
        }
      } catch (err) {
        console.error('파일 생성, 삭제 중 오류가 발생했습니다:', err);
      }
    }
  });
};
