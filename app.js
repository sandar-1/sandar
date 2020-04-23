
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
  htameintype:false,
  htameinfold:false,
  khar:false,
  ankle:false,
};


let designAttachment = false;
let bdesignAttachment = false;
let sharepicAttachment = false;

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
  if (received_message.text == "hi" || received_message.text == "Hi") {    
   greetUser (sender_psid);
  }else if (received_message.text == "Start" || received_message.text == "start") {    
    response = {
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
    bodymeasure(sender_psid);
    measurement.chest = false;
    measurement.upperArm = false;
    measurement.sleevelength = false;
    measurement.waist = false;
    measurement.hips = false;
    measurement.thigh = false;
    measurement.inseam = false;
  }else if (received_message.text && measurement.htameintype == true) { 
    userEnteredMeasurement.htameintype = received_message.text;   
    let response1 = {"text": `which way you want to fold?`};
    let response2 = {"text" : "Left fold/Right fold.",
                      "quick_replies":[
                                      {
                                        "content_type":"text",
                                        "title":"Left fold",
                                        "payload":"lf"
                                      },{
                                        "content_type":"text",
                                        "title":"Right fold",
                                        "payload":"rf"
                                      }]
                    };
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2);
    });
    measurement.chest = false;
    measurement.upperArm = false;
    measurement.sleevelength = false;
    measurement.waist = false;
    measurement.hips = false;
    measurement.thigh = false;
    measurement.inseam = false;
    measurement.htameintype = false;
    measurement.htameinfold = true;
  }else if (received_message.text && measurement.htameinfold == true) { 
    userEnteredMeasurement.htameinfold = received_message.text;
    let response1 = {"text": "Khar to (end exactly with the waist),"};
    let response2 = {"text" : "Khar tin (ends at the hips) or"};
    let response3 = {"text" : "khar shay (ends below the hips)",
                      "quick_replies":[
                                      {
                                        "content_type":"text",
                                        "title":"Khar To",
                                        "payload":"kto"
                                      },{
                                        "content_type":"text",
                                        "title":"Khar Tin",
                                        "payload":"ktin"
                                      },{
                                        "content_type":"text",
                                        "title":"Khar Shay",
                                        "payload":"kshay"
                                      }]
                    };
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2).then(()=>{
        return callSend(sender_psid, response3);
      });
    });
    measurement.chest = false;
    measurement.upperArm = false;
    measurement.sleevelength = false;
    measurement.waist = false;
    measurement.hips = false;
    measurement.thigh = false;
    measurement.inseam = false;
    measurement.htameintype = false;
    measurement.htameinfold = false;
    measurement.khar = true;
  }else if (received_message.text && measurement.khar == true) { 
    userEnteredMeasurement.khar = received_message.text;   
    let response1 = {"text": `Would you like to cover ankle or not?`};
    let response2 = {"text" : "Upper ankle/cover ankle.",
                      "quick_replies":[
                                      {
                                        "content_type":"text",
                                        "title":"Upper Ankle",
                                        "payload":"ya"
                                      },{
                                        "content_type":"text",
                                        "title":"Cover Ankle",
                                        "payload":"ca"
                                      }]
                    };
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2);
    });
    measurement.chest = false;
    measurement.upperArm = false;
    measurement.sleevelength = false;
    measurement.waist = false;
    measurement.hips = false;
    measurement.thigh = false;
    measurement.inseam = false;
    measurement.htameintype = false;
    measurement.htameinfold = false;
    measurement.khar = false;
    measurement.ankle = true;
  }else if (received_message.text && measurement.ankle == true) { 
    userEnteredMeasurement.ankle = received_message.text;   
    user_answer(sender_psid);
    measurement.chest = false;
    measurement.upperArm = false;
    measurement.sleevelength = false;
    measurement.waist = false;
    measurement.hips = false;
    measurement.thigh = false;
    measurement.inseam = false;
    measurement.htameintype = false;
    measurement.htameinfold = false;
    measurement.khar = false;
    measurement.ankle = false;
  }else if (received_message.attachments && designAttachment == true) {
    console.log('meta data',received_message);
    designAttachment == false;
    let attachment_url2 = received_message.attachments[0].payload.url;
    designAttachment = attachment_url2;
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is this design?",
            "subtitle": "Wow! this one will totally suits you.I can't wait to sew it.",
            "image_url": attachment_url2,
            "buttons": [
              {
                "type": "postback",
                "title": "Yes, that one. :)",
                "payload": "yes",
              },
              {
                "type": "postback",
                "title": "No, sorry. :(",
                "payload": "no",
              }
            ],
          }]
        }
      }
    }
  }else if (received_message.attachments && bdesignAttachment == true) {
    console.log('meta data',received_message);
    bdesignAttachment == false;
    let attachment_url1 = received_message.attachments[0].payload.url;
    bdesignAttachment = attachment_url1;
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is tis one?",
            "subtitle": "You exactly know how to blink others people eyes.",
            "image_url": attachment_url1,
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
  }else if (received_message.attachments && sharepicAttachment == true) {
    console.log('meta data',received_message);
    sharepicAttachment == false;
    let attachment_url = received_message.attachments[0].payload.url;
    sharepicAttachment = attachment_url;
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is tis one?",
            "subtitle": ":)",
            "image_url": attachment_url,
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes_sp",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no_sp",
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
  }else if (payload === 'no') {
    response = { "text": "What's wrong! it's ok, send me again." }
  }else if (payload === 'yes') {
    askforbeaded (sender_psid);
  }else if (payload === 'send_design') {
    response = {"text" : "We will sew it look like the design you send or chooes. "};
    askforevent (sender_psid);
  }else if (payload === 'WEDDING') {
    asking_to_upload_design (sender_psid);
  }else if (payload === 'OCCASION') {
    asking_to_upload_design (sender_psid);
  }else if (payload === 'CASUAL') {
    asking_to_upload_design (sender_psid);
  }else if (payload === 'ABD') {
    asking_to_upload_design (sender_psid);
  }else if (payload === 'WEDDING_saw') {
    worrymeasurment (sender_psid);
  }else if (payload === 'OCCASION_saw') {
    worrymeasurment (sender_psid);
  }else if (payload === 'CASUAL_saw') {
    worrymeasurment (sender_psid);
  }else if (payload === 'ABD_saw') {
    worrymeasurment (sender_psid);
  }else if (payload === 'measure_again') {
    response = {"text" : "Type 'Start' to measure again 💁"}
  }else if (payload === 'yes_right') {
    saveData(sender_psid);
    response = {"text" : "Ok!"}
  }else if (payload === 'yes_sp') {
    response = {"text" : "Okkk!"}
  }else if (payload === 'yes_right_measurment') {
    let response1 = {"text" : "which type of htamein? "};
    let response2 = {"text" : "Cheik htamein/Hpi skirt/Simple htamein.",
                      "quick_replies":[
                                      {
                                        "content_type":"text",
                                        "title":"Cheik",
                                        "payload":"c"
                                      },{
                                        "content_type":"text",
                                        "title":"Hpi",
                                        "payload":"hpi"
                                      },{
                                        "content_type":"text",
                                        "title":"Simple",
                                        "payload":"s"
                                      }]
                    };
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2);
    });
    measurement.htameintype = true;
  }else if (payload === 'i_do_have') {
    response ={"text": "well, send me the beaded design that you want to do."};
    sharepicAttachment = false;
    designAttachment = false;
    bdesignAttachment = true;
  }else if (payload === 'nothing_added') {
    worrymeasurment (sender_psid);
  }else if (payload === 'same_as_design') {
    worrymeasurment (sender_psid);
  }else if (payload === 'YES') {
    worrymeasurment (sender_psid);
  }else if (payload === 'SAW') {
    Sew_As_Wish (sender_psid);
  }else if (payload === 'SP') {
    response ={"text": "share yor pictyre with any feedback."};
    designAttachment = false;
    bdesignAttachment = false;
    sharepicAttachment = true;
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

/*Function for sew*/
async function sewing (sender_psid){
  let response1 = {"text" : "You can send us a design of the cloth that you want to sew."};
  let response2 = {"text" : "It's Ok! if you don't have any idea you can make choice. And you can get idea by looking others pictures."};
  let response3 = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Please, make your choice here.",
            "subtitle": "💁🏽‍♀💁🏽‍♀💁🏽‍♀💁🏽‍♀",
            "buttons": [
              {
                "type": "postback",
                "title": "By sending design.",
                "payload": "send_design",
              },
              {
                "type": "postback",
                "title": "Sew as you wish",
                "payload": "SAW",
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
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2).then(()=>{
        return callSend(sender_psid, response3);
      });
    });
}

/*function for asking for beaded emboidery*/
async function askforbeaded (sender_psid){
  let response1 = {"text" : "If you wish! you can add some beaded embroidery to make other people's eyes blink."};
    let response2 = {"text" : "Like this....."};
    let response3 = {
      "attachment":{
            "type":"image", 
            "payload":{
              "url":"https://i.pinimg.com/originals/9b/82/cd/9b82cdc94464fa39a67444d6a5da0937.jpg", 
              "is_reusable":true
            }
          }
    };
    let response4 = {
      "text" : "If so, do I have to follow the beaded embroidery design from the cloth design you sent?"};
    let response5 ={
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Or is there anothe design that you want to do?",
            "subtitle": "💁🏽‍♀💁🏽‍♀💁🏽‍♀💁🏽‍♀",
            "buttons": [
              {
                "type": "postback",
                "title": "I do have.",
                "payload": "i_do_have",
              },
              {
                "type": "postback",
                "title": "Same as design.",
                "payload": "same_as_design",
              },
              {
                "type": "postback",
                "title": "Nothing added.",
                "payload": "nothing_added",
              }
            ]
          }]
        }
      }
    }
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2).then(()=>{
        return callSend(sender_psid, response3).then(()=>{
          return callSend(sender_psid, response4).then(()=>{
            return callSend(sender_psid, response5);
          });
        });
      });
    });
}

/*function for asking event*/
async function askforevent (sender_psid) {
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
            "subtitle":"👰 The estimated price of wedding dress is range from 300000 to above.",
            "default_action": {
              "type": "web_url",
              "url": "https://i.pinimg.com/236x/e6/77/cc/e677cc25d57a184fc8928a001f5f25c2--traditional-wedding-dresses-traditional-outfits.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"Wedding.",
                "payload":"WEDDING"
              }              
            ]      
          },
          {
            "title":"Occasion?",
            "image_url":"https://i.pinimg.com/236x/a4/93/0d/a4930df067551676be9f50906b62ed56.jpg",
            "subtitle":"💃 The estimated price of occasion dress is range from 15000 to above.",
            "default_action": {
              "type": "web_url",
              "url": "https://i.pinimg.com/236x/a4/93/0d/a4930df067551676be9f50906b62ed56.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"Occasion.",
                "payload":"OCCASION"
              }              
            ]      
          },
          {
            "title":"Casual?",
            "image_url":"https://i.pinimg.com/236x/8e/4f/34/8e4f3428ae5c12d2d91c7847ff087bfb--kebaya-indonesia-thai-dress.jpg",
            "subtitle":"🤷 The estimated price of casual dress is range from 8000 to above.",
            "default_action": {
              "type": "web_url",
              "url": "https://i.pinimg.com/236x/8e/4f/34/8e4f3428ae5c12d2d91c7847ff087bfb--kebaya-indonesia-thai-dress.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"Casual.",
                "payload":"CASUAL"
              }              
            ]      
          },
          {
            "title":"For a Convocation?",
            "image_url":"https://scontent-sea1-1.xx.fbcdn.net/v/t1.0-9/29792720_1006980256115703_3053445385785054787_n.jpg?_nc_cat=108&_nc_sid=110474&_nc_ohc=MvKZ7Bf0e1oAX-_9g54&_nc_ht=scontent-sea1-1.xx&oh=d6203387d93b6ad874ddf661dab28425&oe=5E8106ED",
            "subtitle":"👩‍🎓 The estimated price of graduation dress is range from 30000 to above.",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent-sea1-1.xx.fbcdn.net/v/t1.0-9/29792720_1006980256115703_3053445385785054787_n.jpg?_nc_cat=108&_nc_sid=110474&_nc_ohc=MvKZ7Bf0e1oAX-_9g54&_nc_ht=scontent-sea1-1.xx&oh=d6203387d93b6ad874ddf661dab28425&oe=5E8106ED",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"Convocation.",
                "payload":"ABD"
              }              
            ]      
          }
        ]
      }
    }
  };
  callSend(sender_psid,response1).then(()=>{
    return callSend(sender_psid,response2).then(()=>{
      return callSend(sender_psid,response3);
    });
  });
}

/*function for asking event for sew as wish*/
async function Sew_As_Wish (sender_psid) {
  let response1 = {"text":"Thank you for believing to us. Umm....It will eat my head but I will try my best. Oh....for what kind of event?"};
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
            "subtitle":"👰 The estimated price of wedding dress is range from 300000 to above.",
            "default_action": {
              "type": "web_url",
              "url": "https://i.pinimg.com/236x/e6/77/cc/e677cc25d57a184fc8928a001f5f25c2--traditional-wedding-dresses-traditional-outfits.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"Wedding.",
                "payload":"WEDDING_saw"
              }              
            ]      
          },
          {
            "title":"Occasion?",
            "image_url":"https://i.pinimg.com/236x/a4/93/0d/a4930df067551676be9f50906b62ed56.jpg",
            "subtitle":"💃 The estimated price of occasion dress is range from 15000 to above.",
            "default_action": {
              "type": "web_url",
              "url": "https://i.pinimg.com/236x/a4/93/0d/a4930df067551676be9f50906b62ed56.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"Occasion.",
                "payload":"OCCASION_saw"
              }              
            ]      
          },
          {
            "title":"Casual?",
            "image_url":"https://i.pinimg.com/236x/8e/4f/34/8e4f3428ae5c12d2d91c7847ff087bfb--kebaya-indonesia-thai-dress.jpg",
            "subtitle":"🤷 The estimated price of casual dress is range from 8000 to above.",
            "default_action": {
              "type": "web_url",
              "url": "https://i.pinimg.com/236x/8e/4f/34/8e4f3428ae5c12d2d91c7847ff087bfb--kebaya-indonesia-thai-dress.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"Casual.",
                "payload":"CASUAL_saw"
              }              
            ]      
          },
          {
            "title":"For a Convocation?",
            "image_url":"https://scontent-sea1-1.xx.fbcdn.net/v/t1.0-9/29792720_1006980256115703_3053445385785054787_n.jpg?_nc_cat=108&_nc_sid=110474&_nc_ohc=MvKZ7Bf0e1oAX-_9g54&_nc_ht=scontent-sea1-1.xx&oh=d6203387d93b6ad874ddf661dab28425&oe=5E8106ED",
            "subtitle":"👩‍🎓 The estimated price of graduation dress is range from 30000 to above.",
            "default_action": {
              "type": "web_url",
              "url": "https://scontent-sea1-1.xx.fbcdn.net/v/t1.0-9/29792720_1006980256115703_3053445385785054787_n.jpg?_nc_cat=108&_nc_sid=110474&_nc_ohc=MvKZ7Bf0e1oAX-_9g54&_nc_ht=scontent-sea1-1.xx&oh=d6203387d93b6ad874ddf661dab28425&oe=5E8106ED",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"Convocation.",
                "payload":"ABD_saw"
              }              
            ]      
          }
        ]
      }
    }
  };
  callSend(sender_psid,response1).then(()=>{
    return callSend(sender_psid,response2).then(()=>{
      return callSend(sender_psid,response3);
    });
  });
}

/*Function for asking to upload design*/
async function asking_to_upload_design (sender_psid){
  let response1 = {"text":"Well...."};
  let response2 = {"text":"Please send me the design you want to sew."};
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2);
    });
  designAttachment = true;
    bdesignAttachment = false;
    sharepicAttachment = false;
}

/*function for worry about measurement*/
async function worrymeasurment (sender_psid){
  let response1 = {"text": "Ok, let's take your body measurement."};
    let response2 = {"text": "I'm worrying that you don't know how to measure. So, here are some tips for you."};
    let response3 = {
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
                    "title":"Start",
                    "payload":"S"
                  }]
    };
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2).then(()=>{
        return callSend(sender_psid, response3);
      });
    });
}

/*function for user answer*/
function user_answer(sender_psid){
  let response1 = {"text" : "Htamein Type:" + userEnteredMeasurement.htameintype};
  let response2 = {"text" : "Htamein Fold:" + userEnteredMeasurement.htameinfold};
  let response3 = {"text" : "Khar        :" + userEnteredMeasurement.khar};
  let response4 = {"text" : "Ankle       :" + userEnteredMeasurement.ankle};
  let response5 = {
      "attachment": {
                  "type": "template",
                  "payload": {
                    "template_type": "generic",
                    "elements": [{
                      "title": "Is this right?",
                      "buttons": [
                        {
                          "type": "postback",
                          "title": "Yes",
                          "payload": "yes_right",
                        },
                        {
                          "type": "postback",
                          "title": "No",
                          "payload": "yes_right_measurment",
                        }
                      ],
                    }]
                  }
                }
    };
  callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2).then(()=>{
        return callSend(sender_psid, response3).then(()=>{
          return callSend(sender_psid, response4).then(()=>{
            return callSend(sender_psid, response5);
          });
        });
      });
    });
}

/*function for body measurement record*/
function bodymeasure(sender_psid){
    let response1 = {"text": `Chest: `+ userEnteredMeasurement.chest};
    let response2 = {"text": 'Upper arm: ' + userEnteredMeasurement.upperArm};
    let response3 = {"text": 'Sleeve length: ' + userEnteredMeasurement.sleevelength};
    let response4 = {"text": 'Waist: '+ userEnteredMeasurement.waist};
    let response5 = {"text": 'Hips: '+ userEnteredMeasurement.hips};
    let response6 = {"text": 'Thigh: ' + userEnteredMeasurement.thigh};
    let response7 = {"text": 'Inseam: '+ userEnteredMeasurement.inseam};
    let response8 = {
      "attachment": {
                  "type": "template",
                  "payload": {
                    "template_type": "generic",
                    "elements": [{
                      "title": "Is this the right measurment?",
                      "buttons": [
                        {
                          "type": "postback",
                          "title": "Yes",
                          "payload": "yes_right_measurment",
                        },
                        {
                          "type": "postback",
                          "title": "No",
                          "payload": "measure_again",
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
                    return callSend(sender_psid,response8);
                  });
                });
              });
            });
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
    clothDesign : designAttachment,
    beadedDesign : bdesignAttachment,
  }

  db.collection('user_photo').add(sharepic);
}

// /*function function save photo to firebase*/
// function savePhoto(sender_psid) {
//   const sharepic = {
//     photo : sharepicAttachment,
//   }

//   db.collection('user_information').add(info);
// }

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
