const path = require('path');
const fs = require('fs');
const axios = require(path.join(__dirname, './module/axios'));
const readline = require('readline');
const { handleSelector } = require(path.join(
  __dirname,
  './helpers/handleSelector',
));
const { deleteExistFile } = require(path.join(
  __dirname,
  './helpers/deleteExistFile',
));
const { genURL } = require(path.join(__dirname, './helpers/genURL'));

exports.refresh = function (dataJsonPath) {
  const answers = [];

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false, //terminal: false 옵션을 사용하면 readline이 터미널이 아닌 스트림에서 실행되도록 설정 (즉, 화살표 등 특이 커맨드의 경우 추가 처리 로직 필요, terminal 커스터마이징)
  });

  handleSelector(answers, () => {
    process.stdin.setRawMode(false); // 기본 lineMode (입력이 완료되고 엔터치면 한번에 버퍼를 처리하도록 변경) 하도록 스위칭한다.
    process.stdin.resume();

    rl.question('secret값을 입력해주세요 : ', answer => {
      if (!answer) {
        console.log('🧏 값을 입력하지 않으셨습니다.');
        rl.close();
      } else {
        answers.push(answer);
        rl.close();

        const [mode, secret] = answers;

        fs.readFile(dataJsonPath, 'utf-8', async (err, rawJSON) => {
          if (err) {
            console.log('🧏 파일을 읽는 것을 실패했습니다.', err);
          } else {
            const json = JSON.parse(rawJSON);
            const baseURL = json[mode];
            const sveEndpoint = json?.sveEndpoint;
            const fullURLtoString = genURL(sveEndpoint, baseURL);

            try {
              const accessToken = await axios.post(fullURLtoString, {
                secret,
              });
              if (accessToken.data?.token) {
                console.log(
                  '\n생성된 accessToken : ',
                  accessToken.data?.token,
                  '\n',
                );

                const jsonData = JSON.stringify(
                  {
                    ...json,
                    accessToken: accessToken.data?.token,
                  },
                  null,
                  2,
                );

                deleteExistFile(
                  dataJsonPath,
                  () => {
                    fs.writeFileSync(dataJsonPath, jsonData, 'utf-8');
                  },
                  '🔑 Access token을 data.json에 업데이트합니다.',
                );
              } else {
                throw accessToken.error;
              }
            } catch (err) {
              console.log('\nsecret 검증에 실패하였습니다.');
              console.log(`\nerror name : ${err?.name}`);
              console.log(`\nerror message : ${err?.message}`);
              console.log(`\nerror code : ${err?.code}`);
            }
          }
        });
      }
    });
  });
};
