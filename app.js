
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
  if (received_message.text == "Delivery!") {    
    let response1 = {
      "text": `Pls send me address.`
    };
    let response2 = {
      "text": `Please send me address.`
    }
    
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2);
    });
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
    measuring(sender_psid)
    }else if (received_message.text == "No!") {    
    response = {
      "text": `Well, send me design.`,
      "metadata": "attachment1",
    }
    designAttachment = true;
    bdesignAttachment = false;
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
            "subtitle":"If you don't like, upload cloth design.",
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
          },
          {
            "title":"This is up-to-date design!",
            "image_url":"https://i.pinimg.com/236x/19/86/a9/1986a99c86fd95f55a4da544ca51b4fa.jpg",
            "subtitle":"If you don't like, upload cloth design.",
            "default_action": {
              "type": "web_url",
              "url": "https://i.pinimg.com/236x/19/86/a9/1986a99c86fd95f55a4da544ca51b4fa.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"I like this one.",
                "payload":"likethis2"
              }              
            ]      
          },
          {
            "title":"This is up-to-date design!",
            "image_url":"https://i.pinimg.com/236x/47/9d/80/479d803ae3ab903776130660918e58d1.jpg",
            "subtitle":"If you don't like, upload cloth design.",
            "default_action": {
              "type": "web_url",
              "url": "https://i.pinimg.com/236x/47/9d/80/479d803ae3ab903776130660918e58d1.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"I like this one.",
                "payload":"likethis3"
              }              
            ]      
          }
        ]
      }
    }
    }
  }else if (received_message.text == "👎Nope") {    
    response = {
      "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"This is up-to-date design!",
            "image_url":"https://i.pinimg.com/236x/ba/d6/d6/bad6d638a17ee82b7c563483b65a7a2d--kebaya-indonesia-thai-dress.jpg",
            "subtitle":"If you don't like, upload cloth design.",
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
          },
          {
            "title":"This is up-to-date design!",
            "image_url":"https://i.pinimg.com/236x/19/86/a9/1986a99c86fd95f55a4da544ca51b4fa.jpg",
            "subtitle":"If you don't like, upload cloth design.",
            "default_action": {
              "type": "web_url",
              "url": "https://i.pinimg.com/236x/19/86/a9/1986a99c86fd95f55a4da544ca51b4fa.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"I like this one.",
                "payload":"likethis2"
              }              
            ]      
          },
          {
            "title":"This is up-to-date design!",
            "image_url":"https://i.pinimg.com/236x/47/9d/80/479d803ae3ab903776130660918e58d1.jpg",
            "subtitle":"If you don't like, upload cloth design.",
            "default_action": {
              "type": "web_url",
              "url": "https://i.pinimg.com/236x/47/9d/80/479d803ae3ab903776130660918e58d1.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"I like this one.",
                "payload":"likethis3"
              }              
            ]      
          },
          {
            "title":"This is up-to-date design!",
            "image_url":"https://i.pinimg.com/236x/c9/63/7b/c9637bf64bba26e5da12852822f4779f.jpg",
            "subtitle":"If you don't like, upload cloth design.",
            "default_action": {
              "type": "web_url",
              "url": "https://i.pinimg.com/236x/c9/63/7b/c9637bf64bba26e5da12852822f4779f.jpg",
              "webview_height_ratio": "tall",
            }
        ]
      }
    }
    }
  }else if (received_message.text == "Ok👍") {    
    response = { "text" : "Do you wanna put some beaded embroidery on the cloth?",
                  "quick_replies":[
                  {
                    "content_type":"text",
                    "title":"What?",
                    "payload":"D"
                  },{
                    "content_type":"text",
                    "title":"I do!",
                    "payload":"IWC"
                  }]
     }
  }else if (received_message.text == "What?") {    
    response = {
       "attachment":{
                  "type":"template",
                  "payload":{
                    "template_type":"generic",
                    "elements":[
                       {
                        "title":"Beaded embroidery on the cloth",
                        "image_url":"https://i.pinimg.com/236x/fc/aa/15/fcaa15d588bb3c3cd0cefcb671d3674f--unik-baju.jpg",
                        "subtitle":"Like this.....",
                        "default_action": {
                          "type": "web_url",
                          "url": "https://i.pinimg.com/236x/fc/aa/15/fcaa15d588bb3c3cd0cefcb671d3674f--unik-baju.jpg",
                          "webview_height_ratio": "tall",
                        },
                        "buttons":[
                         {
                            "type":"postback",
                            "title":"Sure.",
                            "payload":"sure"
                          },{
                            "type":"postback",
                            "title":"Don't do it.",
                            "payload":"ddt"
                          }              
                        ]      
                      }
                      ]
                   }
                 }
    }
  }else if (received_message.text == "I do!") {    
     response = { "text": "The same as the beaded emboroidery design that you have been chonsen?", 
                  "quick_replies":[
                  {
                    "content_type":"text",
                    "title":"YES",
                    "payload":"D"
                  },{
                    "content_type":"text",
                    "title":"NO",
                    "payload":"IWC"
                  }]
    }
  }else if (received_message.text == "YES") {    
    response = {
      "text": `The estimated price and date is 15000 and 14 feb 2020.`,
      "quick_replies":[
                  {
                    "content_type":"text",
                    "title":"Order",
                    "payload":"D"
                  },{
                    "content_type":"text",
                    "title":"Cancle",
                    "payload":"IWC"
                  }]
    }
  }else if (received_message.text == "NO") {    
    response = {
      "text": `Ok! send me design.`
    }
    bdesignAttachment = true;
    designAttachment = false;
  }else if (received_message.attachments && bdesignAttachment == true) {
    console.log('meta data',received_message);
    bdesignAttachment == false;
    let attachment_url = received_message.attachments[0].payload.url;
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is this the right Design?",
            "subtitle": "Tap a button to answer.",
            "image_url": attachment_url,
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "YES",
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
  }else if (received_message.text == "Order") {    
    response = {
      "text": `Thanks! Your order will finish at 14feb.2020. Don't forget to check the order.`
    }
  }else if (received_message.text == "Cancle") {    
    response = {
      "text": `Opps! Do you want to adjust the appointment date?`,
      "quick_replies":[
                  {
                    "content_type":"text",
                    "title":"Yes,pls.",
                    "payload":"D"
                  },{
                    "content_type":"text",
                    "title":"No,Thz.",
                    "payload":"IWC"
                  }]
    }
  }else if (received_message.text == "Yes,pls.") {    
    response = {
      "attachment": {
                  "type": "template",
                  "payload": {
                   "template_type": "generic",
                    "elements": [{
                      "title": "Which date do you want to finish.",
                      "subtitle": "😉",
                      "buttons": [
                        {
                          "type": "postback",
                          "title": "3feb.2020",
                          "payload": "ep",
                        },
                        {
                          "type": "postback",
                          "title": "10feb.2020",
                          "payload": "ep",
                        },
                        {
                          "type": "postback",
                          "title": "12feb.2020",
                          "payload": "ep",
                        }
                      ],
                    }]
                  }
                },
                "quick_replies":[
                  {
                    "content_type":"text",
                    "title":"No,Thz.",
                    "payload":"IWC"
                  }]
    }
  }else if (received_message.text == "No,Thz.") {    
    response = {
      "text": `Oh! Ok, Thanks for visiting our page.`
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
  }else if (payload === 'likethis1') {
    let response1 = { 
            "attachment":{
            "type":"image", 
            "payload":{
              "url":"https://i.pinimg.com/236x/ba/d6/d6/bad6d638a17ee82b7c563483b65a7a2d--kebaya-indonesia-thai-dress.jpg", 
              "is_reusable":true
            }
          }
          
    }
    let response2 = {
        "text": "Do you like this one?",
        "quick_replies":[
                  {
                    "content_type":"text",
                    "title":"Ok👍",
                    "payload":"ok"
                  },{
                    "content_type":"text",
                    "title":"👎Nope",
                    "payload":"nope"
                  }]

    }
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2);
    });
  }else if (payload === 'likethis2') {
    response = { 
              "attachment":{
            "type":"image", 
            "payload":{
              "url":"https://i.pinimg.com/236x/19/86/a9/1986a99c86fd95f55a4da544ca51b4fa.jpg",
              "is_reusable":true
            }
          },
          "quick_replies":[
                  {
                    "content_type":"text",
                    "title":"Ok👍",
                    "payload":"ok"
                  },{
                    "content_type":"text",
                    "title":"👎Nope",
                    "payload":"nope"
                  }]
    }
  }else if (payload === 'likethis3') {
    response = { 
              "attachment":{
            "type":"image", 
            "payload":{
              "url":"https://i.pinimg.com/236x/47/9d/80/479d803ae3ab903776130660918e58d1.jpg",
              "is_reusable":true
            }
          },
          "quick_replies":[
                  {
                    "content_type":"text",
                    "title":"Ok👍",
                    "payload":"ok"
                  },{
                    "content_type":"text",
                    "title":"👎Nope",
                    "payload":"nope"
                  }]
    }
  }else if (payload === 'yes') {
    response = {  "text" : "Do you wanna put some beaded embroidery on the cloth?",
                  "quick_replies":[
                  {
                    "content_type":"text",
                    "title":"What?",
                    "payload":"D"
                  },{
                    "content_type":"text",
                    "title":"I do!",
                    "payload":"IWC"
                  }]
     }
  }else if (payload === 'no') {
    response = { "text": "Oh! ok, send me again." }
  }else if (payload === 'sure') {
    response = { "text": "The same as the beaded emboroidery design that you have been chonsen?", 
                  "quick_replies":[
                  {
                    "content_type":"text",
                    "title":"YES",
                    "payload":"D"
                  },{
                    "content_type":"text",
                    "title":"NO",
                    "payload":"IWC"
                  }]
    }
  }else if (payload === 'YES') {
    response = { "text": `The estimated price and date is 15000 and 14 feb 2020.`,
                 "quick_replies":[
                  {
                    "content_type":"text",
                    "title":"Order",
                    "payload":"D"
                  },{
                    "content_type":"text",
                    "title":"Cancle",
                    "payload":"IWC"
                  }]
     }
  }else if (payload === 'ddt') {
    response = { "text": "Oh! ok, your estimated price and date is 10000ks and 14feb.2020.",
                "quick_replies":[
                  {
                    "content_type":"text",
                    "title":"Order",
                    "payload":"D"
                  },{
                    "content_type":"text",
                    "title":"Cancle",
                    "payload":"IWC"
                  }]
    }
  }else if (payload === 'ep') {
    response = { "text": "You got this. Don't forget to check the order. Have a nice day." }
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
      callSend(sender_psid,response1).then(()=>{
        return callSend(sender_psid,response2).then(()=>{
          return callSend(sender_psid,response3).then(()=>{
            return callSend(sender_psid,response4).then(()=>{
              return callSend(sender_psid,response5).then(()=>{
                return callSend(sender_psid,response6).then(()=>{
                  return callSend(sender_psid,response7).then(()=>{
                    return callSend(sender_psid,response8);
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

function measuring(sender_psid) {
  let response = {
      "text": `First let's measure Chest.`
    }
    measurement.chest = true;
  }else if (received_message.text && measurement.chest == true) {   
    userEnteredMeasurement.chest =  received_message.text;
    response = {
      "text": `Now Upper arm.`
    }
    measurement.chest = false;
    measurement.upperArm = true;
  }else if (received_message.text && measurement.upperArm == true) { 
    userEnteredMeasurement.upperArm = received_message.text; 
    response = {
      "text": `Let's measure Sleeve length.`
    }
    measurement.chest = false;
    measurement.upperArm = false;
    measurement.sleevelength = true;
  }else if (received_message.text && measurement.sleevelength == true) { 
    userEnteredMeasurement.sleevelength = received_message.text;   
    response = {
      "text": `And measure your Waist.`
    }
    measurement.chest = false;
    measurement.upperArm = false;
    measurement.sleevelength = false;
    measurement.waist = true;
  }else if (received_message.text && measurement.waist == true) {
    userEnteredMeasurement.waist = received_message.text;    
    response = {
      "text": `Now your Hips.`
    }
    measurement.chest = false;
    measurement.upperArm = false;
    measurement.sleevelength = false;
    measurement.waist = false;
    measurement.hips = true;
  }else if (received_message.text && measurement.hips == true) { 
    userEnteredMeasurement.hips = received_message.text;   
    response = {
      "text": `Measure your Thigh.`
    }
    measurement.chest = false;
    measurement.upperArm = false;
    measurement.sleevelength = false;
    measurement.waist = false;
    measurement.hips = false;
    measurement.thigh = true;
  }else if (received_message.text && measurement.thigh == true) {   
    userEnteredMeasurement.thigh = received_message.text; 
    response = {
      "text": `Finally! your Inseam.`
    }
    measurement.chest = false;
    measurement.upperArm = false;
    measurement.sleevelength = false;
    measurement.waist = false;
    measurement.hips = false;
    measurement.thigh = false;
    measurement.inseam = true;
  }else if (received_message.text && measurement.inseam == true) {   
    userEnteredMeasurement.inseam = received_message.text; 
         response = {
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
                          "title": "Measurement again",
                          "payload": "S",
                        }
                      ],
                    }]
                  }
                }
    };
    bodymeasure(sender_psid);
    measurement.chest = false;
    measurement.upperArm = false;
    measurement.sleevelength = false;
    measurement.waist = false;
    measurement.hips = false;
    measurement.thigh = false;
    measurement.inseam = false;
  
}
