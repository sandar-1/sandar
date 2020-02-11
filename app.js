
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
  app = express().use(body_parser.json()); // creates express http server

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
  if (received_message.text == "Delivery!") {    
    response = {
      "text": `Pls send me address.`
    }
  }else if (received_message.text == "I will come!") {    
    response = {
      "text": `OK! See ya!`
    }
  }else if (received_message.text == "How!") {    
    response = {
            "attachment":{
            "type":"image", 
            "payload":{
              "url":"https://www.dummies.com/wp-content/uploads/how-to-get-your-body-measurements.jpg", 
              "is_reusable":true
            }
          },
          "quick_replies":[
                  {
                    "content_type":"text",
                    "title":"Start!",
                    "payload":"S"
                  },{
                    "content_type":"text",
                    "title":"Not now!",
                    "payload":"nn"
                  }]
    }
  }else if (received_message.text == "Not now!") {    
    response = {
      "text": `OK!`
    }
  }else if (received_message.text == "Start!") {    
    response = {
      "text": `First let's measure Chest.`
    }
  }else if (received_message.text == "1") {    
    response = {
      "text": `Now Upper arm.`
    }
  }else if (received_message.text == "2") {    
    response = {
      "text": `Let's measure Sleeve length.`
    }
  }else if (received_message.text == "3") {    
    response = {
      "text": `And measure your Waist.`
    }
  }else if (received_message.text == "4") {    
    response = {
      "text": `Now your Hips.`
    }
  }else if (received_message.text == "5") {    
    response = {
      "text": `Measure your Thigh.`
    }
  }else if (received_message.text == "6") {    
    response = {
      "text": `Finally! your Inseam.`
    }
  }else if (received_message.text == "7") {    
    response = {
      "attachment": {
                  "type": "template",
                  "payload": {
                    "template_type": "generic",
                    "elements": [{
                      "title": "Now I get your body measurement!",
                      "subtitle": "Let's chooes cloth type",
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
                        }
                      ],
                    }]
                  }
                }
    }
  }else if (received_message.text == "No!") {    
    response = {
      "text": `Well, send me cloth design.`
    }
  }else if (received_message.text == "Yes!") {    
    response = {
      "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"This is up-to-date design!",
            "image_url":"https://i.pinimg.com/236x/ba/d6/d6/bad6d638a17ee82b7c563483b65a7a2d--kebaya-indonesia-thai-dress.jpg",
            "subtitle":"Do you like it?",
            "default_action": {
              "type": "web_url",
              "url": "https://i.pinimg.com/236x/ba/d6/d6/bad6d638a17ee82b7c563483b65a7a2d--kebaya-indonesia-thai-dress.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"I like this one.",
                "payload":"likethis"
              }              
            ]      
          },
          {
            "title":"This is up-to-date design!",
            "image_url":"https://i.pinimg.com/236x/19/86/a9/1986a99c86fd95f55a4da544ca51b4fa.jpg",
            "subtitle":"Do you like it?",
            "default_action": {
              "type": "web_url",
              "url": "https://i.pinimg.com/236x/19/86/a9/1986a99c86fd95f55a4da544ca51b4fa.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"I like this one.",
                "payload":"likethis"
              }              
            ]      
          },
          {
            "title":"This is up-to-date design!",
            "image_url":"https://i.pinimg.com/236x/47/9d/80/479d803ae3ab903776130660918e58d1.jpg",
            "subtitle":"Do you like it?",
            "default_action": {
              "type": "web_url",
              "url": "https://i.pinimg.com/236x/47/9d/80/479d803ae3ab903776130660918e58d1.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"I like this one.",
                "payload":"likethis"
              }              
            ]      
          },
          {
            "title":"This is up-to-date design!",
            "image_url":"https://i.pinimg.com/236x/c9/63/7b/c9637bf64bba26e5da12852822f4779f.jpg",
            "subtitle":"Do you like it?",
            "default_action": {
              "type": "web_url",
              "url": "https://i.pinimg.com/236x/c9/63/7b/c9637bf64bba26e5da12852822f4779f.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"I like this one.",
                "payload":"likethis"
              }              
            ]      
          },
          {
            "title":"This is up-to-date design!",
            "image_url":"https://i.pinimg.com/236x/b4/57/dd/b457dd49dba5e06dd0f8862c11dfb184.jpg",
            "subtitle":"Do you like it?",
            "default_action": {
              "type": "web_url",
              "url": "https://i.pinimg.com/236x/b4/57/dd/b457dd49dba5e06dd0f8862c11dfb184.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"I like this one.",
                "payload":"likethis"
              }              
            ]      
          }
        ]
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
  if (payload === 'STC') {
    response = { "text": "Give your body measure!",
                  "quick_replies":[
                  {
                    "content_type":"text",
                    "title":"How!",
                    "payload":"D"
                  },{
                    "content_type":"text",
                    "title":"Not now!",
                    "payload":"IWC"
                  }]
   }
  }else if (payload === 'GF') {
    response = { "text": "You can say freely." }
  }else if (payload === 'VO') {
    response = { "text": "Finish!",
                  "quick_replies":[
                  {
                    "content_type":"text",
                    "title":"Delivery!",
                    "payload":"D"
                  },{
                    "content_type":"text",
                    "title":"I will come!",
                    "payload":"IWC"
                  }]
                }
  } else if (payload === 'get_started') {
    response = { "attachment": {
                  "type": "template",
                  "payload": {
                   "template_type": "generic",
                    "elements": [{
                      "title": "Hello Wecome",
                      "subtitle": "What do you want?",
                      "buttons": [
                        {
                          "type": "postback",
                          "title": "Sewing the clothe",
                          "payload": "STC",
                        },
                        {
                          "type": "postback",
                          "title": "Give feedback!",
                          "payload": "GF",
                        },
                        {
                          "type": "postback",
                          "title": "View order",
                          "payload": "VO",
                        }
                      ],
                    }]
                  }
                }
    }
  }else if (payload === 'ceremony') {
    response = { "attachment": {
                  "type": "template",
                  "payload": {
                   "template_type": "generic",
                    "elements": [{
                      "title": "OK!",
                      "subtitle": "Which type of ceremony?",
                      "buttons": [
                        {
                          "type": "postback",
                          "title": "Wedding",
                          "payload": "W",
                        },
                        {
                          "type": "postback",
                          "title": "Graduation",
                          "payload": "W",
                        },
                        {
                          "type": "postback",
                          "title": "Donation",
                          "payload": "W",
                        }
                      ],
                    }]
                  }
                }
    }
  }else if (payload === 'S') {
    response = { "attachment": {
                  "type": "template",
                  "payload": {
                   "template_type": "generic",
                    "elements": [{
                      "title": "Oh! tell me",
                      "subtitle": "Which type of cloth?",
                      "buttons": [
                        {
                          "type": "postback",
                          "title": "For university",
                          "payload": "W",
                        },
                        {
                          "type": "postback",
                          "title": "Just Sewing",
                          "payload": "W",
                        }
                      ],
                    }]
                  }
                }
    }
  }else if (payload === 'W') {
    response = { "text": "Do you want any suggestions?",
                  "quick_replies":[
                  {
                    "content_type":"text",
                    "title":"Yes!",
                    "payload":"D"
                  },{
                    "content_type":"text",
                    "title":"No!",
                    "payload":"IWC"
                  }]
     }
  }else if (payload === 'likethis') {    
     let response1 = {"attachment":{
                      "type":"image", 
                      "payload":{
                        "url":"https://i.pinimg.com/236x/ba/d6/d6/bad6d638a17ee82b7c563483b65a7a2d--kebaya-indonesia-thai-dress.jpg", 
                        "is_reusable":true
                      }
                    }
                  };
      let response2 = {"text": "This one!"};
      let response3 = {"text": "To add new task, type 'new'"};   
      let response4 = {"text": "If you forget who you are, type 'who am i'"};
        callSendAPI(sender_psid, response1).then(()=>{
          return callSendAPI(sender_psid, response2).then(()=>{
            return callSendAPI(sender_psid, response3).then(()=>{
              return callSendAPI(sender_psid, response4);
            });
          });
      });
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
