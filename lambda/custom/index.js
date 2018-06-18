/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const axios = require('axios');

const AIUrl = 'https://h282dtqxfc.execute-api.us-east-1.amazonaws.com/dev/tictactoe';

async function getAIDecision(board, coordinate) {
  const response = await axios({
    method: 'post',
    url: AIUrl,
    data: { board, coordinate },
  });

  return response.data;
}

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    console.log('LaunchRequest');
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    console.log('Attributes', attributes);
    console.log(handlerInput.requestEnvelope.request.intent);
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to the Bot Battle Skill. You can start by saying: "Start a Game"';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Welcome to Bot Battle', speechText)
      .getResponse();
  },
};

const StartGameIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'StartGameIntent';
  },
  async handle(handlerInput) {
    const speechText = 'Ok, Google. Start Bot Battle';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Ok, Google. Start Bot Battle', speechText)
      .withShouldEndSession(false)
      .getResponse();
  },
};

const TurnIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'TurnIntent';
  },
  async handle(handlerInput) {
    const { slots } = handlerInput.requestEnvelope.request.intent;
    const turnNumber = (slots.turnNumber.value) ? slots.turnNumber.value : '';
    const turnLetter = (slots.turnLetter.value) ? slots.turnLetter.resolutions.resolutionsPerAuthority[0].values[0].value.name : '';

    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const currentBoard = attributes.board || ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
    console.log(`Recognized values ${turnLetter}${turnNumber}`);
    const data = await getAIDecision(currentBoard, `${turnLetter}${turnNumber}`);
    const {
      board, newTurnCoordinate, winStatus,
    } = data;
    handlerInput.attributesManager.setSessionAttributes({ board });

    let speechText;
    if (winStatus) {
      speechText = 'I win. You lose.';
    } else {
      speechText = `My turn is ${newTurnCoordinate}`;
    }

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(speechText, speechText)
      .withShouldEndSession(false)
      .getResponse();
  },
};

const LoseIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'LoseIntent';
  },
  handle(handlerInput) {
    const speechText = 'Ooooo, nooo. I will beat you next time';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(speechText, speechText)
      .withShouldEndSession(true)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    StartGameIntentHandler,
    TurnIntentHandler,
    LoseIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
