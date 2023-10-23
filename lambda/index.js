const Alexa = require('ask-sdk-core');
const fetch = require('node-fetch');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        console.log("deviceId", handlerInput.requestEnvelope.context.System.device.deviceId);
        console.log("accessToken", handlerInput.requestEnvelope.context.System.apiAccessToken);
        
        const speakOutput = `Welcome, this is the alexa Skill, here to provide you with guidance or advice. You can say what should I do in a power cut or help?`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const powerCutMessages = {
    "southderbyshire": "ok",
    "burtonontrent": "ok"
}

const RegionIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RegionIntent';
    },
    async handle(handlerInput) {
        
        const { requestEnvelope, responseBuilder } = handlerInput;
        console.log("trying", requestEnvelope.context.Geolocation);
        
        if (!requestEnvelope.context.Geolocation) {
            console.log("its on undefined.")
            const speechText = 'Please enable geolocation in your Alexa app settings.';

            return responseBuilder
                .speak(speechText)
                .withAskForPermissionsConsentCard(['alexa::devices:all:geolocation:read'])
                .getResponse();
        } else {
            console.log("its hit here");
            // Geolocation permission is already granted, you can proceed with using the location data
            const geolocation = requestEnvelope.context.Geolocation;
            const latitude = geolocation.coordinate.latitudeInDegrees;
            const longitude = geolocation.coordinate.longitudeInDegrees;
            console.log(latitude, longitude)
            const getLocationResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const json = await getLocationResponse.json();
            
            const getAddressKey = (json.address.city) ? json.address.city.replace(/[\W_]+/g, "").toLowerCase() : json.address.town.replace(/[\W_]+/g, "").toLowerCase();
            const getAddress = (json.address.city) ? json.address.city : json.address.town;

      
            if (powerCutMessages[getAddressKey]) {
                const speechText = `The ${getAddress} power status is: ${powerCutMessages[getAddressKey]}`;

                return responseBuilder
                    .speak(speechText)
                    .getResponse();
            }
            
            return responseBuilder
                .speak('Sorry, I was unable to find the status of this location.')
                .reprompt('Sorry, I was unable to find the status of this location.')
                .getResponse();
            
            
        }

        
    }
};

const DOCUMENT_ID = "refill-boiler";

const datasource = {
    "videoPlayerTemplateData": {
        "type": "object",
        "properties": {
            "backgroundImage": "",
            "displayFullscreen": false,
            "headerTitle": "How to refill a boiler",
            "headerSubtitle": "",
            "logoUrl": "https://www.scottishpower.com/userfiles/image/logo_sp_rect.jpg",
            "videoControlType": "skip",
            "videoSources": [
                "https://dd8wu6t0ikyje.cloudfront.net/s5f3t2%2Ffile%2F02b479859cb607688851589c984a7bf3_How+to+Refill+Your+Boiler.mp4?response-content-disposition=inline%3Bfilename%3D%2202b479859cb607688851589c984a7bf3_How%20to%20Refill%20Your%20Boiler.mp4%22%3B&response-content-type=video%2Fmp4&Expires=1696564850&Signature=Y4oObZlWSq~lits1PTYqQR-9GLEPXYuv2YbKZl4kZNtk9dIVv87XbP-ZFzAXcugeMdosR6ZyP96W~gdjFA56o6L2XJRhlfdujRPZTFWdDhJc2zzpLCpVuoqwN4j0Tn4lFdoZzNTt4ArfSVAlgtjRG5088nCRGq-X4CBPUCmFi9lxH2E8Asq8VdO40U8n0Or77spYHI5Maw1~-rfOP-MJ9EaRJuKwHr9rInwVXK6StcmliCZWY4~nCUwB934UckSA5o6NDViUsslGXj-rUmT96pCcaymaNj47tfnDC-vb8GNL432IJfS9JZXc-tUpH-aOw7S3liAeffcG4OAS9c7-ag__&Key-Pair-Id=APKAJT5WQLLEOADKLHBQ",
                "https://dd8wu6t0ikyje.cloudfront.net/s5f3t2%2Ffile%2F02b479859cb607688851589c984a7bf3_How+to+Refill+Your+Boiler.mp4?response-content-disposition=inline%3Bfilename%3D%2202b479859cb607688851589c984a7bf3_How%20to%20Refill%20Your%20Boiler.mp4%22%3B&response-content-type=video%2Fmp4&Expires=1696564850&Signature=Y4oObZlWSq~lits1PTYqQR-9GLEPXYuv2YbKZl4kZNtk9dIVv87XbP-ZFzAXcugeMdosR6ZyP96W~gdjFA56o6L2XJRhlfdujRPZTFWdDhJc2zzpLCpVuoqwN4j0Tn4lFdoZzNTt4ArfSVAlgtjRG5088nCRGq-X4CBPUCmFi9lxH2E8Asq8VdO40U8n0Or77spYHI5Maw1~-rfOP-MJ9EaRJuKwHr9rInwVXK6StcmliCZWY4~nCUwB934UckSA5o6NDViUsslGXj-rUmT96pCcaymaNj47tfnDC-vb8GNL432IJfS9JZXc-tUpH-aOw7S3liAeffcG4OAS9c7-ag__&Key-Pair-Id=APKAJT5WQLLEOADKLHBQ"
            ],
            "sliderType": "determinate"
        }
    }
};
const createDirectivePayload = (aplDocumentId, dataSources = {}, tokenId = "documentToken") => {
    return {
        type: "Alexa.Presentation.APL.RenderDocument",
        token: tokenId,
        document: {
            type: "Link",
            src: "doc://alexa/apl/documents/" + aplDocumentId
        },
        datasources: dataSources
    }
};

const BoilerIntentHandler = {
    canHandle(handlerInput) {
        // handle named intent
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'BoilerIntent';
    },
    handle(handlerInput) {
        console.log('this supported',Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL'])
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            console.log("apl has been hit here")
            // generate the APL RenderDocument directive that will be returned from your skill
            const aplDirective = createDirectivePayload(DOCUMENT_ID, datasource);
            // add the RenderDocument directive to the responseBuilder
            handlerInput.responseBuilder.addDirective(aplDirective);
        }

        // send out skill response
        return handlerInput.responseBuilder.speak("This will be now viewed on your Fire TV").getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        RegionIntentHandler,
        BoilerIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();