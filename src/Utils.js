import { Chip } from "@mui/material";
import { Store } from "react-notifications-component";

export const getQuestionScore = (question, response) => {
  // console.log('type: ' + question.type);

  switch (question.type) {
    case "singleChoice":
      return question.choices.find((item) => item.isCorrect).value == response
        ? question.points
        : 0;
    case "fillInTheBlank":
      console.log(question.type);

      return question.answer == response ? question.points : 0;
    case "multiChoice":
      const userAnswers = [...response];
      const choices = [...question.choices];
      const correctUserAnswers = userAnswers.filter((answer) =>
        choices.find((item) => item.value === answer && item.isCorrect)
      );
      return correctUserAnswers.length * question.points;
    case "matchingType":
      const mtchoices = [...question.choices];
      const mtuserAnswers = { ...response };
      const mtcorrectUserAnswers = mtchoices.filter(
        (choice) => mtuserAnswers[choice.desc] === choice.value
      );
      console.log("correct matches", mtcorrectUserAnswers);

      return mtcorrectUserAnswers.length * question.points;
    default:
      return 0;
  }
};

export const getQuizScore = (questionResopnses) => {
  let scores = 0;
  console.log("getQuizScore", questionResopnses);

  Object.keys(questionResopnses).map((key) => {
    scores += questionResopnses[key].points;
  });
  return scores;
};
export const getQuizTotalPoints = (questions) => {
  let totalPoints = 0;
  // console.log('getQuizScore', questionResopnses);
  questions.map((question) => {
    switch (question.type.toString()) {
      case "singleChoice":
        totalPoints += question.points;
        console.log("signle cr", question.points);
        break;
      case "multiChoice":
        totalPoints +=
          question.points *
          question.choices.filter((choice) => choice.isCorrect === true).length;
        console.log(
          "mulitchoice sc",
          question.points *
            question.choices.filter((choice) => choice.isCorrect === true)
              .length
        );

        break;
      case "matchingType":
        totalPoints += question.points * question.choices.length;
        console.log("matching", question.points * question.choices.length);

        break;
      case "essay":
        totalPoints += question.points;
        console.log("ess sr", question.points);
        break;
      case "fileUpload":
        totalPoints += question.points;
        break;
      case "fillInTheBlank":
        totalPoints += question.points;
        break;
      default:
        console.log("question type not supported", question.type);
        break;
    }
  });
  return totalPoints;
};
export const calculatePoints = (responses) => {
  let totalPoints = 0;
  Object.values(responses).forEach((response) => {
    totalPoints += response.points;
  });
  return totalPoints;
};
export const calculateQuestionTotalPoints = (question) => {
  let totalPoints = 0;
  // console.log('getQuizScore', questionResopnses);
  switch (question.type.toString()) {
    case "singleChoice":
      totalPoints += question.points;
      // console.log('signle cr', question.points);
      break;
    case "multiChoice":
      totalPoints +=
        question.points *
        question.choices.filter((choice) => choice.isCorrect === true).length;
      // console.log('mulitchoice sc', question.points * question.choices.filter(choice => choice.isCorrect === true).length);
      break;
    case "matchingType":
      totalPoints += question.points * question.choices.length;
      // console.log('matching', question.points * question.choices.length);
      break;
    case "essay":
      totalPoints += question.points;
      // console.log('ess sr', question.points);
      break;
    case "fileUpload":
      totalPoints += question.points;
      break;
    case "fillInTheBlank":
      totalPoints += question.points;
      break;
    default:
      console.log("question type not supported", question.type);
      break;
  }
  return totalPoints;
};
export const popMessage = (title, msg) => {
  Store.addNotification({
    title: title,
    message: msg,
    type: "info",
    container: "top-right",
    // animationIn: ["animate__animated", "animate__tada"],
    animationIn: ["animate__animated", "animate__rubberBand"],
    animationOut: ["animate__animated", "animate__backOutDown"],
    dismiss: {
      duration: 3000,
      onScreen: true,
    },
  });
};
export function calculateGradePoint(percentage) {
  if (percentage >= 98) return "1.0";
  if (percentage >= 95) return "1.25";
  if (percentage >= 92) return "1.50";
  if (percentage >= 89) return "1.75";
  if (percentage >= 86) return "2.0";
  if (percentage >= 83) return "2.25";
  if (percentage >= 80) return "2.50";
  if (percentage >= 77) return "2.75";
  if (percentage >= 75) return "3.0";
  return "5.0"; // Below 70 gets the lowest grade
}
