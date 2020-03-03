
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

let measurement = {
  chest:false,
  upperArm:false,
  sleevelength:false,
  waist:false,
  hips:false,
  thigh:false,
  inseam:false,
}

let designAttachment = false;
let bdesignAttachment = false;

let userEnteredMeasurement = {};

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
  if (received_message.text == "hi") {    
   greetUser (sender_psid);
  }else if (received_message.attachments && designAttachment == true) {
    console.log('meta data',received_message);
    designAttachment == false;
    let attachment_url = received_message.attachments[0].payload.url;
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Your Design?",
            "subtitle": "Tap a button to answer.",
            "image_url": attachment_url,
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no",
              }
            ],
          }]
        }
      }
    }
  }
  callSendAPI(sender_psid, response);    
}

function handlePostback(sender_psid, received_postback) {
  console.log('ok')
   let response;
  let payload = received_postback.payload;
  if (payload === 'SEW') {
    sewing (sender_psid);
  }else if (payload === 'WEDDING') {
    forwedding (sender_psid);
  }else if (payload === 'OCCASION') {
    foroccasion (sender_psid);
  }else if (payload === 'CASUAL') {
    forcasual (sender_psid);
  }else if (payload === 'ABD') {
    forbechelor (sender_psid);
  }
  callSendAPI(sender_psid, response);
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
      "uri": "https://graph.facebook.com/"+sender_psid+"?fields=first_name,last_name,profile_pic&access_token=EAAC0Amc4MRgBAGR5JMXzFDQBBZCbHRjOkVPeKg3UokgQzZAYlIAZBQoPnwsKo6FZBmSOd5kPm16TUJEFdveL9iZA4IAG2EN1IozqH17jKueHNU2rPObJYjxkL6Kq3WttHxYhaj83SGYNK9ZBEtYXkJTOiXVV9key1xS8WZCpWXoQy3bluiMysR5IYlm1Q9QfVQZD",
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

/*Function for sew*/
async function sewing(sender_psid){
    let response1 = {"text":"For what kind of event?"};
    let response2 = {"text":"These are the kinds of sewing we do in our shop."};
    let response3 = {
       "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"A wedding?",
            "image_url":"https://i.pinimg.com/236x/e6/77/cc/e677cc25d57a184fc8928a001f5f25c2--traditional-wedding-dresses-traditional-outfits.jpg",
            "subtitle":"👰",
            "default_action": {
              "type": "web_url",
              "url": "https://i.pinimg.com/236x/e6/77/cc/e677cc25d57a184fc8928a001f5f25c2--traditional-wedding-dresses-traditional-outfits.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"This one.",
                "payload":"WEDDING"
              }              
            ]      
          },
          {
            "title":"Occasion?",
            "image_url":"https://i.pinimg.com/236x/a4/93/0d/a4930df067551676be9f50906b62ed56.jpg",
            "subtitle":"💃",
            "default_action": {
              "type": "web_url",
              "url": "https://i.pinimg.com/236x/a4/93/0d/a4930df067551676be9f50906b62ed56.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"This one.",
                "payload":"OCCASION"
              }              
            ]      
          },
          {
            "title":"Casual?",
            "image_url":"https://i.pinimg.com/236x/8e/4f/34/8e4f3428ae5c12d2d91c7847ff087bfb--kebaya-indonesia-thai-dress.jpg",
            "subtitle":"🤷",
            "default_action": {
              "type": "web_url",
              "url": "https://i.pinimg.com/236x/8e/4f/34/8e4f3428ae5c12d2d91c7847ff087bfb--kebaya-indonesia-thai-dress.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"This one.",
                "payload":"CASUAL"
              }              
            ]      
          },
          {
            "title":"For a bechelor's degree?",
            "image_url":"https://scontent-sea1-1.xx.fbcdn.net/v/t1.0-9/29792720_1006980256115703_3053445385785054787_n.jpg?_nc_cat=108&_nc_sid=110474&_nc_ohc=MvKZ7Bf0e1oAX-_9g54&_nc_ht=scontent-sea1-1.xx&oh=d6203387d93b6ad874ddf661dab28425&oe=5E8106ED",
            "subtitle":"👩‍🎓",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent-sea1-1.xx.fbcdn.net/v/t1.0-9/29792720_1006980256115703_3053445385785054787_n.jpg?_nc_cat=108&_nc_sid=110474&_nc_ohc=MvKZ7Bf0e1oAX-_9g54&_nc_ht=scontent-sea1-1.xx&oh=d6203387d93b6ad874ddf661dab28425&oe=5E8106ED",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"This one.",
                "payload":"ABD"
              }              
            ]      
          }
        ]
      }
    }
  }
  callSend(sender_psid, response1).then(()=>{
    return callSend(sender_psid, response2).then(()=>{
      return callSend(sender_psid, response3);
    });
  });
}

/*Function for wedding*/
async function forwedding (sender_psid){
    let response1 = {"text":"Congratulation! "};
    let response2 = {"text":"Here are some good suggestions designs for you."};
    let response3 = {
      "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"I hope you like it.👩👩",
            "image_url":"https://i.pinimg.com/236x/ba/d6/d6/bad6d638a17ee82b7c563483b65a7a2d--kebaya-indonesia-thai-dress.jpg",
            "subtitle":"It's okey! If you don't like it, you can send me any design picture you like.",
            "default_action": {
              "type": "web_url",
              "url": "https://i.pinimg.com/236x/ba/d6/d6/bad6d638a17ee82b7c563483b65a7a2d--kebaya-indonesia-thai-dress.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"I like this one.",
                "payload":"likethis1"
              }              
            ]      
          }
        ]
      }
    }
    };
  callSend(sender_psid, response1).then(()=>{
    return callSend(sender_psid, response2).then(()=>{
      return callSend(sender_psid, response3);
    });
  });
}

/*Function for occasion*/
async function foroccasion (sender_psid){
    let response1 = {"text":"Let me make it beautiful."};
    let response2 = {"text":"Here are some good suggestions designs for you."};
    let response3 = {
      "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"I hope you like it.👩👩",
            "image_url":"https://i.pinimg.com/236x/ba/d6/d6/bad6d638a17ee82b7c563483b65a7a2d--kebaya-indonesia-thai-dress.jpg",
            "subtitle":"It's okey! If you don't like it, you can send me any design picture you like.",
            "default_action": {
              "type": "web_url",
              "url": "https://i.pinimg.com/236x/ba/d6/d6/bad6d638a17ee82b7c563483b65a7a2d--kebaya-indonesia-thai-dress.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"I like this one.",
                "payload":"likethis1"
              }              
            ]      
          }
        ]
      }
    }
    };
  callSend(sender_psid, response1).then(()=>{
    return callSend(sender_psid, response2).then(()=>{
      return callSend(sender_psid, response3);
    });
  });
}

/*Function for casual*/
async function forcasual (sender_psid){
    let response1 = {"text":"Sometimes it is nice to wear lightweight Myanmar dress.! "};
    let response2 = {"text":"Here are some good suggestions designs for you."};
    let response3 = {
      "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"I hope you like it.👩👩",
            "image_url":"https://i.pinimg.com/236x/ba/d6/d6/bad6d638a17ee82b7c563483b65a7a2d--kebaya-indonesia-thai-dress.jpg",
            "subtitle":"It's okey! If you don't like it, you can send me any design picture you like.",
            "default_action": {
              "type": "web_url",
              "url": "https://i.pinimg.com/236x/ba/d6/d6/bad6d638a17ee82b7c563483b65a7a2d--kebaya-indonesia-thai-dress.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"I like this one.",
                "payload":"likethis1"
              }              
            ]      
          }
        ]
      }
    }
    };
  callSend(sender_psid, response1).then(()=>{
    return callSend(sender_psid, response2).then(()=>{
      return callSend(sender_psid, response3);
    });
  });
}

/*Function for bechelor*/
async function forbechelor (sender_psid){
    let response1 = {"text":"Congratulation Sis! You did it! "};
    let response2 = {"text":"Here are some good suggestions designs for you."};
    let response3 = {
      "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"I hope you like it.👩👩",
            "image_url":"https://i.pinimg.com/236x/ba/d6/d6/bad6d638a17ee82b7c563483b65a7a2d--kebaya-indonesia-thai-dress.jpg",
            "subtitle":"It's okey! If you don't like it, you can send me any design picture you like.",
            "default_action": {
              "type": "web_url",
              "url": "https://i.pinimg.com/236x/ba/d6/d6/bad6d638a17ee82b7c563483b65a7a2d--kebaya-indonesia-thai-dress.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"I like this one.",
                "payload":"likethis1"
              }              
            ]      
          }
        ]
      }
    }
    };
  callSend(sender_psid, response1).then(()=>{
    return callSend(sender_psid, response2).then(()=>{
      return callSend(sender_psid, response3);
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

function bodymeasure(sender_psid){
    let response1 = {"text": `Chest: `+ userEnteredMeasurement.chest};
    let response2 = {"text": 'Upper arm: ' + userEnteredMeasurement.upperArm};
    let response3 = {"text": 'Sleeve length: ' + userEnteredMeasurement.sleevelength};
    let response4 = {"text": 'Waist: '+ userEnteredMeasurement.waist};
    let response5 = {"text": 'Hips: '+ userEnteredMeasurement.hips};
    let response6 = {"text": 'Thigh: ' + userEnteredMeasurement.thigh};
    let response7 = {"text": 'Inseam: '+ userEnteredMeasurement.inseam};
    let response8 = {"text": 'Is this the right measurment?'};
    let response9 = {
      "attachment": {
                  "type": "template",
                  "payload": {
                    "template_type": "generic",
                    "elements": [{
                      "title": "Pls. chooes the type",
                      "buttons": [
                        {
                          "type": "postback",
                          "title": "Ceromonies",
                          "payload": "ceremony",
                        },
                        {
                          "type": "postback",
                          "title": "Simple",
                          "payload": "S",
                        },
                        {
                          "type": "postback",
                          "title": "Measuring again",
                          "payload": "measureagain",
                        }
                      ],
                    }]
                  }
                }
    };
      callSend(sender_psid,response1).then(()=>{
        return callSend(sender_psid,response2).then(()=>{
          return callSend(sender_psid,response3).then(()=>{
            return callSend(sender_psid,response4).then(()=>{
              return callSend(sender_psid,response5).then(()=>{
                return callSend(sender_psid,response6).then(()=>{
                  return callSend(sender_psid,response7).then(()=>{
                    return callSend(sender_psid,response8).then(()=>{
                        return callSend(sender_psid, response9);
                    });
                  });
                });
              });
            });
          });
        });
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
