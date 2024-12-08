export const getQuestionScore = (question, response) => {
    console.log('type: ' + question.type);

    switch (question.type) {
        case 'singleChoice':
            return question.choices.find(item => item.isCorrect).value == response ? 1 : 0;
        case 'multiChoice':
            const userAnswers = [...response];
            const choices = [...question.choices];
            const correctUserAnswers = userAnswers.filter(answer =>
                choices.find(item => item.value === answer && item.isCorrect)
            );
            return correctUserAnswers.length * question.points;
        case 'matchingType':
            const mtchoices = [...question.choices];
            const mtuserAnswers = { ...response };
            const mtcorrectUserAnswers = mtchoices.filter(choice =>
                mtuserAnswers[choice.desc] === choice.value
            );
            console.log('correct matches', mtcorrectUserAnswers);

            return mtcorrectUserAnswers.length * question.points;
        default:
            return 0;
    }
}
