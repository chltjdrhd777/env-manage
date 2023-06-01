exports.askQuestions = function askQuestions(questions, rl, index = 0) {
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
      askQuestions(questions, rl, index + 1); // 다음 질문으로 이동
    }
  });
};
