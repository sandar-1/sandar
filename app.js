
/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Messenger Platform Quick Start Tutorial
 *
 * This is the completed code for the Messenger Platform quick start tutorial
 *
 * https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start/
 *
 * To run this code, you must do the following:
 *
 * 1. Deploy this code to a server running Node.js
 * 2. Run `npm install`
 * 3. Update the VERIFY_TOKEN
 * 4. Add your PAGE_ACCESS_TOKEN to your environment vars
 *
 */

'use strict';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
// Imports dependencies and set up http server
const 
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  firebase = require("firebase-admin"),
  app = express().use(body_parser.json()); // creates express http server

  firebase.initializeApp({
  credential: firebase.credential.cert({
    "private_key": process.env.Firebase_privatekey.replace(/\\n/g, '\n'),
    "client_email": process.env.Firebase_clientemail,
    "project_id": process.env.Firebase_projectID,
  }),
  databaseURL: "https://sandarbot.firebaseio.com"
 });

let db = firebase.firestore();

let userInformation = {
  name : false;
  chest:false,
  upperArm:false,
  sleevelength:false,
  waist:false,
  hips:false,
  thigh:false,
  inseam:false,
  htameintype:false,
  htameinfold:false,
  khar:false,
  ankle:false,
};


let designAttachment = false;
let bdesignAttachment = false;
let sharepicAttachment = false;

let userEnteredInformation = {};


// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {  

  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

    body.entry.forEach(function(entry) {

      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender ID: ' + sender_psid);   

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);        
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
      
    });
    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

app.get('/setgsbutton',function(req,res){
    setupGetStartedButton(res);    
});

app.get('/setpersistentmenu',function(req,res){
    setupPersistentMenu(res);    
});

app.get('/clear',function(req,res){    
    removePersistentMenu(res);
});

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {
  
  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  
  // Parse params from the webhook verification request
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Check if a token and mode were sent
  if (mode && token) {
    
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});

function handleMessage(sender_psid, received_message) {
  let response;
  if (received_message.text == "hi" || received_message.text == "Hi") {    
     greetUser (sender_psid);}
  // }else if (received_message.text && userInformation.name == true) {   
  //   userEnteredInformation.name =  received_message.text;
  //   let response1 = {"text" : "Let's get your body measurement. Here are some ways to measure your body. Hopefully it will be usefull. :)"};
  //   let response2 = {"attachment":{
  //                       "type":"image", 
  //                       "payload":{
  //                       "url":"https://www.dummies.com/wp-content/uploads/how-to-get-your-body-measurements.jpg", 
  //                       "is_reusable":true
  //                                 }
  //                   }                    
  //   };
  //   let response3 = {"text" = "Well.... let's measure your Chest first. "};
  //    callSend(sender_psid, response1).then(()=>{
  //     return callSend(sender_psid, response2).then(()=>{
  //       return callSend(sender_psid, response3);
  //     });
  //   });
  //   userInformation.name = false;
  //   userInformation.chest = true;
  // }
  callSendAPI(sender_psid, response);    
}

function handlePostback(sender_psid, received_postback) {
  console.log('ok')
   let response;
  let payload = received_postback.payload;
  if (payload === 'SEW') {
    let response = {"text" : "Please tell me your name. :)"};
    userInformation.name = true;
  }
  callSendAPI(sender_psid, response);
}

/*function to greet user*/
async function greetUser(sender_psid){  
  let user = await getUserProfile(sender_psid);
  let response1 = {"text": "🙋‍♀ Hi. "+user.first_name+" "+user.last_name+". Warmly welcome to SH.🙆‍♀"};
  let response2 = {"text": "Do you want to sew 👗 or want to share pictures 🤳. And you can also see pictures of others 😉."}
  let response3 = {
          "attachment": {
              "type": "template",
              "payload": {
                "template_type": "generic",
                "elements": [{
                  "title": "I'm waiting for your answer.",
                  "subtitle": "👩👩",
                  "buttons": [
                    {
                      "type": "postback",
                      "title": "I want to sew 👗",
                      "payload": "SEW",
                    },{
                      "type": "postback",
                      "title": "Share pictures",
                      "payload": "SP",
                    },
                    {
                      "type": "postback",
                      "title": "Pictures of others",
                      "payload": "POO",
                    }
                  ],
                }]
              }
            }
        }; 
  let response4 = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is it in order?",
            "subtitle": "You can see the order here. 💁🏽‍♀",
            "buttons": [
              {
                "type": "postback",
                "title": "View order.",
                "payload": "VO",
              }
            ],
          }]
        }
      }
    };
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2).then(()=>{
        return callSend(sender_psid, response3).then(()=>{
          return callSend(sender_psid, response4);
        });
      });
    });
}




/*function function save data to firebase*/
function saveData(sender_psid) {
  const info = {
    id : sender_psid,
    chest : userEnteredMeasurement.chest,
    upperArm : userEnteredMeasurement.upperArm,
    sleevelength : userEnteredMeasurement.sleevelength,
    waist : userEnteredMeasurement.waist,
    hips : userEnteredMeasurement.hips,
    thigh : userEnteredMeasurement.thigh,
    inseam : userEnteredMeasurement.inseam,
    htameintype : userEnteredMeasurement.htameintype,
    htameinfold : userEnteredMeasurement.htameinfold,
    khar : userEnteredMeasurement.khar,
    ankle : userEnteredMeasurement.ankle,
  }
  db.collection('user_information').add(info);
}


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
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
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

function callSendAPINew(sender_psid, response) {  
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }
  
  return new Promise(resolve => {
    request({
      "uri": "https://graph.facebook.com/v2.6/me/messages",
      "qs": { "access_token": PAGE_ACCESS_TOKEN },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        resolve('message sent!')
      } else {
        console.error("Unable to send message:" + err);
      }
    }); 
  });
}

async function callSend(sender_psid, response){
  let send = await callSendAPINew(sender_psid, response);
  return 1;
}

function getUserProfile(sender_psid) {
  return new Promise(resolve => {
    request({
      "url": "https://graph.facebook.com/"+sender_psid+"?fields=first_name,last_name,profile_pic&access_token=EAAC0Amc4MRgBAGR5JMXzFDQBBZCbHRjOkVPeKg3UokgQzZAYlIAZBQoPnwsKo6FZBmSOd5kPm16TUJEFdveL9iZA4IAG2EN1IozqH17jKueHNU2rPObJYjxkL6Kq3WttHxYhaj83SGYNK9ZBEtYXkJTOiXVV9key1xS8WZCpWXoQy3bluiMysR5IYlm1Q9QfVQZD",
      "method": "GET"
      }, (err, res, body) => {
        if (!err) { 
          let data = JSON.parse(body);  
          resolve(data);                 
    } else {
      console.error("Error:" + err);
    }
    });
  });
}

function setupGetStartedButton(res){
        var messageData = {
                "get_started":{"payload":"get_started"}                
        };
        // Start the request
        request({
            url: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token='+ PAGE_ACCESS_TOKEN,
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            form: messageData
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Print out the response body
                res.send(body);

            } else { 
                // TODO: Handle errors
                res.send(body);
            }
        });
    } 

function setupPersistentMenu(res){
        var messageData = { 
            "persistent_menu":[
                {
                  "locale":"default",
                  "composer_input_disabled":false,
                  "call_to_actions":[
                      {
                        "title":"Reslected!?",
                        "type":"nested",
                        "call_to_actions":[
                            {
                              "title":"Sewing the cloth",
                              "type":"postback",
                              "payload":"STC"
                            },
                            {
                              "title":"Give feedback!",
                              "type":"postback",
                              "payload":"GF"
                            },
                            {
                              "title":"View order",
                              "type":"postback",
                              "payload":"VO"
                            }
                        ]
                      },
                ]
            },
            {
              "locale":"zh_CN",
              "composer_input_disabled":false
            }
          ]          
        };
        // Start the request
        request({
            url: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token='+ PAGE_ACCESS_TOKEN,
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            form: messageData
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Print out the response body
                res.send(body);

            } else { 
                // TODO: Handle errors
                res.send(body);
            }
        });
    } 

function removePersistentMenu(res){
        var messageData = {
                "fields": [
                   "persistent_menu" ,
                   "get_started"                 
                ]               
        };
        // Start the request
        request({
            url: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token='+ PAGE_ACCESS_TOKEN,
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            form: messageData
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Print out the response body
                res.send(body);

            } else { 
                // TODO: Handle errors
                res.send(body);
            }
        });
    } 
