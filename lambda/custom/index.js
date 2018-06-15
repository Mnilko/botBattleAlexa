// /* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const axios = require('axios');

const AIUrl = 'https://h282dtqxfc.execute-api.us-east-1.amazonaws.com/dev/tictactoe';

const LETTER_NAMES = {
  a: 'alpha',
  b: 'bravo',
  c: 'charlie',
  d: 'delta',
};

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    console.log('LaunchRequest');
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    console.log('Attributes', attributes);
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
    const response = await axios({
      method: 'post',
      url: AIUrl,
      data: {
        board: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        coordinate: '',
      },
    });

    const {
      board, newTurnCoordinate, winStatus, isFault
    } = response.data;

    console.log(`Board: ${board}, coordinates: ${newTurnCoordinate}, winStatus: ${winStatus}, isFault: ${isFault}`);
    handlerInput.attributesManager.setSessionAttributes({ board, symbol: 'X' });

    const speechText = `Ok, Google. My turn is ${LETTER_NAMES[newTurnCoordinate[0]]} ${newTurnCoordinate[1]}`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World from Bot Battle!', speechText)
      .withShouldEndSession(false)
      .getResponse();
  },
};

const TurnIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'TurnIntent';
  },
  handle(handlerInput) {
    console.log('Slots', JSON.stringify(handlerInput.requestEnvelope.request.intent.slots));
    const turnNumber = handlerInput.requestEnvelope.request.intent.slots.turnNumber.value;
    const turnLetter = handlerInput.requestEnvelope.request.intent.slots.turnLetter.value;
    // add turn on board
    // send request to AI with current board
    // check if win
    // find the turn and crete response

    const speechText = `Your turn is ${turnLetter}${turnNumber}`;


    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(speechText, speechText)
      .withShouldEndSession(false)
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
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
