const axios = require('axios');

// abort controller을 이용하여, 네트워크 요청을 취소시킬 수 있도록 axios 인스턴스를 커스터마이징하여 생성한다.
// 이렇게 하는 이유는, 네트워크 혼잡이나 사용자 취소 등 예외 상황이 발생했을 때 불필요한 작업을 중단시키켜 자원의 낭비를 방지하기 위함이다.
const abortController = new AbortController();

const instance = axios.create({
  timeout: 3000,
});

instance.interceptors.response.use(
  response => {
    return response;
  },
  err => {
    console.log(`🚫 axios 요청 에러가 발생했습니다 : ${err?.message}\n`);

    if (err.code === 'ECONNABORTED') {
      console.log('\n응답 지연으로 인해 네트워크 요청을 취소합니다.\n');
      abortController.abort();
    }
  },
);

module.exports = instance;
