require("dotenv").config();
const request=require('request');
var rp = require('request-promise');

const postWebHook = (req, res) => {
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === "page") {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);


      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      
      console.log('Sender PSID: ' + sender_psid);

      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }

    });

    // Returns a '200 OK' response to all requests
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
};

const getWebHook = (req, res) => {
  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
};

// Handles messages events
async function handleMessage(sender_psid, received_message) {
  // const firstname=await getUsersName(sender_psid)
  let response;

  // Check if the message contains text
  if (received_message.text) {    

    // Create the payload for a basic text message
    // response = {
    //   "text": `Hi there, welcome to match bot.`
    // }
   await getAnswer(received_message.text,response);
  }  
  
  // Sends the response message
  callSendAPI(sender_psid, response); 
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": response
    }
  
    // Send the HTTP request to the Messenger Platform
    request({
      "uri": "https://graph.facebook.com/v2.6/me/messages",
      "qs": { "access_token": process.env.FACEBOOK_ACCESS_TOKEN },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log('message sent!')
      } else {
        console.error("Unable to send message:" + err);
      }
    }); 
}

function getAnswer(question,callback){
  let parsedQ= question.split('question')[1].split('?')[0].replace(' ','+');
  var options = {
   'method': 'GET',
   'url': `http://api.wolframalpha.com/v1/result?appid=&i=${parsedQ}%3f`,
 };
 request(options, function (error, response) {
   if (error){
       callback = {
           "text": 'answer not found, if you would like human help, start your question with "human" '
         }
   }
   callback = {
       "text": response.body
     }
 });
}

getAnswer()
module.exports = {
  postWebHook,
  getWebHook,
};
