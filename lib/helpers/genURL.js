exports.genURL = (endpoint, baseURL) => {
  let fullURLtoString = '';
  try {
    const replacedEndpoint = endpoint[0] !== '/' ? '/' + endpoint : endpoint;

    const fullURL = new URL(replacedEndpoint, baseURL);
    fullURLtoString = fullURL.toString();
  } catch (err) {
    console.log(
      `\n유효한 ${
        args.includes('-d') ? '개발' : args.includes('-p') ? '운영' : '서버'
      } origin 주소를 입력하지 않으셨습니다.`,
    );
  }

  return fullURLtoString;
};
