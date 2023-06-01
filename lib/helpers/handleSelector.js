exports.handleSelector = function (answers, callback) {
  // 선택지 목록
  const choices = ['개발', '운영'];
  let selectedIndex = 0;

  // 줄바꿈 처리를 위한 ANSI escape 코드
  function eraseLines() {
    const count = choices.length;
    process.stdout.write(`\x1b[${count}A\x1b[K`); // \1xb = ANSI 이스케이프 시퀀스 시작점. [ 이후 제어코드 실행함. A는 커서를 위로 올린다는 것이고 B는 해당 커서 이후 행의 내용 다 지운다는 의미.
  }

  // 선택지 출력 및 현재 커서 위치 표시 함수
  function renderChoices() {
    for (let i = 0; i < choices.length; i++) {
      if (i === selectedIndex) {
        process.stdout.write('> ' + choices[i] + '\n');
      } else {
        process.stdout.write('  ' + choices[i] + '\n');
      }
    }
  }

  // 초기 설정 표시
  renderChoices();

  // 방향키 입력 이벤트
  // keypress(process.stdin); // readline의 termianl을 false로 할 경우, 스트림에서 실행되도록 하기 때문에 화살표같은 특수키 입력값 처리를 위해 keypress 라이브러리를 이용하여 감싼다.
  process.stdin.setRawMode(true); // 기본 lineMode(입력을 계속 버퍼 저장하다가 엔터하면 처리) 에서 rawMode(입력마다 처리) 로 변경한다.
  process.stdin.resume(); // 기본적으로 스트림 상태는 pause상태이기 떄문에, resume으로 재실행. (일반적으로 realine 실행 시 resume으로 재게하여 사용자 입력 대기상태가 된다.)

  process.stdin.on('keypress', function (_, key) {
    if (key) {
      if (key.name === 'up') {
        selectedIndex =
          selectedIndex === 0 ? choices.length - 1 : selectedIndex - 1;
        eraseLines();
        renderChoices();
      } else if (key.name === 'down') {
        selectedIndex =
          selectedIndex === choices.length - 1 ? 0 : selectedIndex + 1;
        eraseLines();
        renderChoices();
      } else if (key.name === 'return') {
        // 엔터 키를 누르면 선택 완료
        process.stdin.pause(); // 스트림을 종료하여 입력값을 더이상 받지 않음.
        const selectedChoice = choices[selectedIndex];
        answers.push(selectedChoice === '개발' ? 'devOrigin' : 'prodOrigin');
        callback && callback();
      }
    }
  });
};
