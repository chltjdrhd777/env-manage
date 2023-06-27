## 🗒 Env-manage

---

![env-manage](https://raw.githubusercontent.com/chltjdrhd777/image-hosting/main/%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA%202023-05-19%20%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE%2012.31.52.png)

<img src="https://img.shields.io/badge/.ENV-000000?style=for-the-badge&logo=.ENV&logoColor=white">
<img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">

<br/>

사내 env 데이터를 가져와서 파일로 사용할 수 있도록 만들어본 툴입니다.

개발 시 env를 번거롭게 초기화하지 않고 커맨드로 재생성하여 업데이트 할 수 있도록 구현하였습니다.

> 개발 후기와 관련하여 정리한 내용은 [개인 블로그](https://velog.io/@chltjdrhd777/react-native-%EB%B3%B4%EC%95%88%EA%B3%BC-env%EC%97%90-%EB%8C%80%ED%95%B4%EC%84%9C)에서 확인하실 수 있습니다.

## Quick Features

- CLI 명령어를 이용해 초기 설정
- CLI 명령어를 이용해 env 생성 및 업데이트

---

## Prerequisite

- 해당 버전은 REST 통신을 기반으로 합니다
- 기본 워크플로우는 아래와 같습니다

<img src="https://raw.githubusercontent.com/chltjdrhd777/image-hosting/main/env-manager%20-workflow.png">

<br/>

> 해당 구조에 따라, 보안적으로 필요되는 서버 및 데이터베이스 구조는 아래와 같습니다.

0. access token을 [JWT](https://www.npmjs.com/package/jsonwebtoken)로 생성하기 위해 필요한 **secret** 값.
   <br/>
   해당 secret은 개발자들이 대외비로 알고 있어야 하며, 서버 측은 이 secret을 저장하고 이것과 jwt 라이브러리를 이용하여 access token을 생성 및 검증하는 로직을 만들어야 합니다.
   <img src="https://raw.githubusercontent.com/chltjdrhd777/image-hosting/main/secret%20env%20%E1%84%8B%E1%85%A8%E1%84%89%E1%85%B5.png">

1. access token 발급을 위한 **Init Endpoint(-sve)** (POST/Body 내에 secret 값 검증 후 일치하면 jwt토큰을 생성하여 전달)<br/>

   <img src="https://raw.githubusercontent.com/chltjdrhd777/image-hosting/main/init%20endpoint%20controller%20example.png"/>

2. database 조회 후 해당 데이터를 전달해줄 **Generate Endpoint** (POST/Body 내에 repo 값으로 데이터 필터링) <br/>

   - 해당 endpoint는 init 때 발급받은 access token을 검증하는 로직 필요 (미들웨어 구조 추천)
     <img src="https://raw.githubusercontent.com/chltjdrhd777/image-hosting/main/access%20token%20%E1%84%80%E1%85%A5%E1%86%B7%E1%84%8C%E1%85%B3%E1%86%BC%20%E1%84%86%E1%85%B5%E1%84%83%E1%85%B3%E1%86%AF%E1%84%8B%E1%85%B0%E1%84%8B%E1%85%A5.png"><br/>

   - 토큰 검증 미들웨어를 작성할 때, access token은 Authorization Header을 통해 전달되므로, 검증 middleware에서 해당 header의 access token을 검증하도록 구현해야 함<br/>
     <br/>
     <img src="https://raw.githubusercontent.com/chltjdrhd777/image-hosting/main/varification%20example.png"/>
     <br/>
   - generate endpoint는 body에서 전달받는 "repo" 값을 기준으로 데이터베이스를 필터링하여 Env 값을 조회하는 것을 권장함
     <img src="https://raw.githubusercontent.com/chltjdrhd777/image-hosting/main/repo%20%E1%84%91%E1%85%B5%E1%86%AF%E1%84%90%E1%85%A5%E1%84%85%E1%85%B5%E1%86%BC.png">
     <br/>
   - generate endpoint에서 response로 전달해줘야 할 env 리스트는 그 값 자체를 Json으로 보내주어야 함
     <img src="https://raw.githubusercontent.com/chltjdrhd777/image-hosting/main/generate%20reulst%20example.png">

3. "repo" 라는 컬럼명을 지닌 env 관리 테이블. (repo 컬럼은 예를 들어, 웹개발 환경인지, 앱개발 환경인지, 서버인지 등등을 구분하여 env 데이터를 저장합니다. 자세 사항은 gen 커맨드 설명 내용 참조.)
   <img src="https://raw.githubusercontent.com/chltjdrhd777/image-hosting/main/repo%20example%20image.png"/>

---

## Commands

📖 `init` : 초기 환경 설정을 실행합니다 </br>

init이 진행방향은 아래와 같습니다.</br>

a. command 입력<br/>
b. origin 입력(개발, 운영)<br/>
c. mode 입력(access token 발급받을 서버 환경 선택)
d. secret 입력

_args_</br>

1. -sve (토큰 발급주소) : 서버의 어떤 Endpoint를 통해 secret 값을 검증하고 access token을 발행받을 지를 작성하여 data.json에 저장합니다.

2. -gee (env 발급주소) : 서버의 어떤 Endpoint를 통해 DB의 env 값을 조회하고, 사용자에게 전달해줄 지를 작성하여 data.json에 저장합니다.

```
# init command 예시

npx env-manage init -sve v1/env-init -gee v1/env-generate
```

> init이 완료되면, 초기설정에 대한 값이 data.json이라는 파일에 저장되어 해당 모듈의 폴더 아래에 저장됩니다.

<img src="https://raw.githubusercontent.com/chltjdrhd777/image-hosting/main/data%20json%20file%20position.png"/>

---

📖 `gen` : evn 파일을 생성합니다 </br>

_args_</br>

1. mode ("-d" or "-p") : 환경을 설정합니다. 설정된 환경의 서버로부터 `env 데이터`를 발급받습니다.

2. -repo (env 필터링 쿼리) : env가 관리되는 데이터베이스 테이블에서 예를 들어 "afun-wallet-app"이라는 장소의 env만 필요할 경우, 해당 데이터만 필터링하여 조회할 수 있도록 전달되어야 하는 값잆니다.

3. -filename (env 이름, _optional_) : env를 생성할 시, 어떤 이름으로 설정할 것인지를 결정합니다. 만약 입력하지 않는다면 ".env"로 자동 설정됩니다.

```
# gen command 예시

npx env-manage gen -d -repo afun-wallet-app -filename .env.development
```

---

📖 `refresh` : init시에 저장되어 있던 access token이 만료될 경우, 해당 토큰을 업데이트하는 데 사용합니다. (generate를 위해서는 만료가 지나지 않은 access token이 필요합니다.) </br>

해당 refresh 커맨드를 사용하기 위해서는 먼저 `init` 커맨드를 이용하여 초기 설정을 저장해 두어야 합니다.

초기 설정이 완료된 이후에는, 해당 데이터를 기반으로 access token을 업데이트합니다.

<img src="https://raw.githubusercontent.com/chltjdrhd777/image-hosting/main/gif/env-manage%20refresh%20exmaple2.gif"/>

```
# gen command 예시

npx env-manage refresh
```
