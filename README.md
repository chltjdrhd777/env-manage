## 🗒 Env-manage

---

![env-manage](https://raw.githubusercontent.com/chltjdrhd777/image-hosting/main/%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA%202023-05-19%20%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE%2012.31.52.png)

<img src="https://img.shields.io/badge/.ENV-000000?style=for-the-badge&logo=.ENV&logoColor=white">
<img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">

<br/>

손쉽게 env를 가져와서 파일로 사용할 수 있도록 만들어본 툴입니다.

## Quick Features

- CLI 명령어를 이용해 초기 설정
- CLI 명령어를 이용해 env 생성 및 업데이트

---

## Prerequisite

- 해당 버전은 REST 통신을 기반으로 합니다
- 기본 워크플로우는 아래와 같습니다

<img src="https://raw.githubusercontent.com/chltjdrhd777/image-hosting/main/env-manager%20-workflow.png">

<br/>

> 해당 구조에 따라, 필요한 서버 및 데이터베이스 구조는 아래와 같습니다.

1. access token 발급을 위한 Endpoint <br/>

2. database 조회 후 해당 데이터를 전달해줄 Endpoint <br/>
   `해당 endpoint는 init 때 발급받은 accessToken 검증하는 로직이 필요함 (미들웨어 구조 추천)`<br/>
   `해당 endpoint는 body에서 전달받는 "repo" 값을 기준으로 데이터베이스를 필터링하여 Env 값을 조회해야 함`
   <img src="https://raw.githubusercontent.com/chltjdrhd777/image-hosting/main/access%20token%20%E1%84%80%E1%85%A5%E1%86%B7%E1%84%8C%E1%85%B3%E1%86%BC%20%E1%84%86%E1%85%B5%E1%84%83%E1%85%B3%E1%86%AF%E1%84%8B%E1%85%B0%E1%84%8B%E1%85%A5.png"><br/>
   <img src="https://raw.githubusercontent.com/chltjdrhd777/image-hosting/main/repo%20%E1%84%91%E1%85%B5%E1%86%AF%E1%84%90%E1%85%A5%E1%84%85%E1%85%B5%E1%86%BC.png">

<br/>

3. "repo" 라는 컬럼명을 지닌 env 관리 테이블. (repo 컬럼은 예를 들어, 웹개발 환경인지, 앱개발 환경인지, 서버인지 등등을 구분합니다. 자세 사항은 gen 커맨드 설명 내용 참조.)

---

## Commands

📖 `init` : 초기 환경 설정을 실행합니다 </br>

_args_</br>

1. mode ("-d" or "-p") : 개발 환경을 설정합니다. 설정된 서버로부터 `access token`을 발급받습니다.

2. -sve (토큰 발급주소) : 서버의 어떤 Endpoint를 통해 secret 값을 검증하고 access token을 발행받을 지를 결정합니다.

```
# init command 예시

npx env-manage init -d -sve v1/env-init
```

---

📖 `gen` : evn 파일을 생성합니다 </br>

_args_</br>

1. mode ("-d" or "-p") : 개발 환경을 설정합니다. 설정된 서버로부터 `evn 데이터`를 발급받습니다.

2. -repo (토큰 발급주소) : 어떤 개발 장소에서 필요한 env인지 설정합니다. (ex, env가 관리되는 데이터베이스 테이블에서 "afun-wallet-app"이라는 장소의 env만 필요할 경우, 필터링에 사용됩니다.)

3. -gee (generate을 담당하는 endpoint) : 서버의 어떤 endpoint로 요청하여 env를 생성할 것인지를 결정합니다.

4. -filename (env 이름, optional) : env를 생성할 시, 어떤 이름으로 설정할 것인지를 결정합니다. 만약 입력하지 않는다면 ".env"로 자동 설정됩니다.

```
# gen command 예시

npx env-manage gen -d -repo afun-wallet-app -gee v1/env-generate -filename env.production
```
