
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

let userInfo = {
  name : false,
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
  price : false,
};

let changing = {
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

let userEnteredInfo = {};
let userSendAttachment = {};


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

  if (webhook_event.message) {
if(webhook_event.message.quick_reply){
handleQuickReply(sender_psid, webhook_event.message.quick_reply.payload);
}else{
handleMessage(sender_psid, webhook_event.message);
}
} else if (webhook_event.postback) {
handlePostback(sender_psid, webhook_event.postback);
}

});

function handleQuickReply (sender_psid, received_message) {
  console.log('ok')
   let response;
  let payload = received_message.quick_reply.payload;
  if (received_message.quick_reply.payload  == "change_sure") {    
    let response1 = {"text": "Ok... is there anything you want to change then type the key word that you want to change. :) "};
    let response2 = {"text" : " If there is nothing to change write 'Done' to view update record. :)"}
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2);
    });
  }
}

function handleMessage(sender_psid, received_message) {
  let response;
  if (received_message.text == "hi" || received_message.text == "Hi") {    
   greetUser (sender_psid);
  }else if (received_message.text == "confirm" || received_message.text == "Confirm") {    
   saveData (sender_psid);
   response = { "text" : "OK :)"}
  }else if (received_message.text == "change" || received_message.text == "Change") {
   response = {
    "attachment":{
                      "type":"template",
                      "payload":{
                        "template_type":"button",
                        "text":"Choose what you wnat to change.",
                        "buttons":[
                          {
                            "type":"postback",
                            "payload":"change_bdmeasurement",
                            "title":"Body measurement"
                          },
                          {
                            "type":"postback",
                            "payload":"change_htamein",
                            "title":"Type fo htamein"
                          },
                          {
                            "type":"postback",
                            "payload":"change_design",
                            "title":"Cloth design"
                          }
                        ]
                      }
                    } 
   }
  }else if (received_message.text && userInfo.name == true) {   
    userEnteredInfo.name =  received_message.text;
     let response1 = {"text": "Let's get your body measurement. Here are ways to measure your body. Hopefully that will be useful. :)"};    
     let response2 = {
      "attachment":{
            "type":"image", 
            "payload":{
              "url":"https://www.dummies.com/wp-content/uploads/how-to-get-your-body-measurements.jpg", 
              "is_reusable":true
            }
          }
    };
    let response3 = {"text" : "Well.. let's measure Chest first."}
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2).then(()=>{
        return callSend(sender_psid, response3);
      });
    });
    userInfo.chest = true;
    userInfo.name = false;
  }else if (received_message.text && userInfo.chest == true) {   
    userEnteredInfo.chest =  received_message.text;
    response = {
      "text": `Now Upper arm.`
    }
    userInfo.chest = false;
    userInfo.upperArm = true;
  }else if (received_message.text && userInfo.upperArm == true) { 
    userEnteredInfo.upperArm = received_message.text; 
    response = {
      "text": `Let's measure Sleeve length.`
    }
    userInfo.upperArm = false;
    userInfo.sleevelength = true;
  }else if (received_message.text && userInfo.sleevelength == true) { 
    userEnteredInfo.sleevelength = received_message.text;   
    response = {
      "text": `And measure your Waist.`
    }
    userInfo.sleevelength = false;
    userInfo.waist = true;
  }else if (received_message.text && userInfo.waist == true) {
    userEnteredInfo.waist = received_message.text;    
    response = {
      "text": `Now your Hips.`
    }
    userInfo.waist = false;
    userInfo.hips = true;
  }else if (received_message.text && userInfo.hips == true) { 
    userEnteredInfo.hips = received_message.text;   
    response = {
      "text": `Measure your Thigh.`
    }
    userInfo.hips = false;
    userInfo.thigh = true;
  }else if (received_message.text && userInfo.thigh == true) {   
    userEnteredInfo.thigh = received_message.text; 
    response = {
      "text": `Finally! your Inseam.`
    }
    userInfo.thigh = false;
    userInfo.inseam = true;
  }else if (received_message.text && userInfo.inseam == true) {   
    userEnteredInfo.inseam = received_message.text; 
    bodymeasure(sender_psid);
    userInfo.inseam = false;
  }else if (received_message.text && userInfo.htameintype == true) { 
    userEnteredInfo.htameintype = received_message.text;   
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
    userInfo.htameintype = false;
    userInfo.htameinfold = true;
  }else if (received_message.text && userInfo.htameinfold == true) { 
    userEnteredInfo.htameinfold = received_message.text;
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
    userInfo.htameinfold = false;
    userInfo.khar = true;
  }else if (received_message.text && userInfo.khar == true) { 
    userEnteredInfo.khar = received_message.text;   
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
    userInfo.khar = false;
    userInfo.ankle = true;
  }else if (received_message.text && userInfo.ankle == true) { 
    userEnteredInfo.ankle = received_message.text;   
    user_answer (sender_psid);
    userInfo.ankle = false;
  }else if (received_message.text && userInfo.price == true) { 
    userEnteredInfo.price = received_message.text;   
    asking_cus_design (sender_psid);
    userInfo.price = false;
  }else if (received_message.attachments && designAttachment == true) {
    console.log('meta data',received_message);
    designAttachment == false;
    let attachment_url = received_message.attachments[0].payload.url;
    userSendAttachment.designAttachment = attachment_url;
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is this design?",
            "subtitle": "Wow! this one will totally suits you.I can't wait to sew it.",
            "image_url": attachment_url,
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
  }else if (received_message.attachments && sharepicAttachment == true) {
    console.log('meta data',received_message);
    sharepicAttachment == false;
    let attachment_url = received_message.attachments[0].payload.url;
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
  }else if (received_message.text == "Chest" || received_message.text == "chest" ) {
   response = { "text" : "Send me update measurement. :)"}
   changing.chest = true;
  }else if (received_message.text && changing.chest == true) {   
    userEnteredInfo.chest =  received_message.text;
    response = {
      "text": `Are you sure?`,
      "quick_replies":[
                        {
                        "content_type":"text",
                        "title":"Sure",
                        "payload":"change_sure"
                        },{
                        "content_type":"text",
                        "title":"No",
                        "payload":"change_chestno"
                        }]
    }
    changing.chest = false;
  }
  callSendAPI(sender_psid, response);    
}

function handlePostback(sender_psid, received_postback) {
  console.log('ok')
   let response;
  let payload = received_postback.payload;
  if (payload === 'yes_right') {
    askforevent (sender_psid);
  }else if (payload === 'WEDDING') {
    wedding_event (sender_psid);
  }else if (payload === 'OCCASION') {
    occasion_event (sender_psid);
  }else if (payload === 'ABD') {
    convocation_event (sender_psid);
  }else if (payload === 'CASUAL') {
    casual_event (sender_psid);
  }else if (payload === 'yes') {
    showAllDataToCus (sender_psid);
  }else if (payload === 'no') {
    response = { "text": "What's wrong! it's ok, send me again." }
  }else if (payload === 'Inshop') {
    response = {"text": "Please tell me your name. :) "}
    userInfo.name = true;
  }else if (payload === 'delivered') {
    response = {"text": "OK! It can be any bus stop from Tatkone. Contact 0912345678. Well.. tell me your name. :) "}
    userInfo.name = true;
  }else if (payload === 'change_design') {
    response = { "text": "What's wrong! it's ok, send me again." }
  }else if (payload === 'change_bdmeasurement') {
    let response1 = { "text" : "Type what you want to change. Please write the same as key word which you want to change. The key words are"};
    let response2 = { "text" : "Chest/ Arm/ Sleeve/ Waist/ Hips/ Thigh/ Inseam."};
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2);
    });
  }else if (payload === 'change_htamein') {
    let response1 = { "text" : "Type what you want to change. Please write the same as key word which you want to change. The key words are"};
    let response2 = { "text" : "Type/ Fold/ Khar/ Ankle."};
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2);
    });
  }else if (payload === 'SEW') {
    response = {"attachment":{
                      "type":"template",
                      "payload":{
                        "template_type":"button",
                        "text":"Is your cloth closuer in our shop? Or delivery?",
                        "buttons":[
                          {
                            "type":"postback",
                            "payload":"delivered",
                            "title":"Will be delivered "
                          },
                          {
                            "type":"postback",
                            "payload":"Inshop",
                            "title":"Is in your shop"
                          }
                        ]
                      }
                    } 
                 }
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
    userInfo.htameintype = true;
  }else if (payload === 'choose_wedding') {
    response = {"text" : "To make sure your decision please send us price.",
                      "quick_replies":[
                                      {
                                        "content_type":"text",
                                        "title":"300000 Ks",
                                        "payload":"wedding_price"
                                      },{
                                        "content_type":"text",
                                        "title":"150000 Ks",
                                        "payload":"wedding_price"
                                      }]
                    };
                    userInfo.price = true;
  }else if (payload === 'choose_occasion') {
    response = {"text" : "To make sure your decision please send us price.",
                      "quick_replies":[
                                      {
                                        "content_type":"text",
                                        "title":"20000 Ks",
                                        "payload":"occasion_price"
                                      },{
                                        "content_type":"text",
                                        "title":"10000 Ks",
                                        "payload":"occasion_price"
                                      }]
                    };
                    userInfo.price = true;
  }else if (payload === 'choose_convocation') {
    response = {"text" : "To make sure your decision please send us price.",
                      "quick_replies":[
                                      {
                                        "content_type":"text",
                                        "title":"30000 Ks",
                                        "payload":"convocation_price"
                                      },{
                                        "content_type":"text",
                                        "title":"20000 Ks",
                                        "payload":"convocation_price"
                                      }]
                    };
                    userInfo.price = true;
  }else if (payload === 'choose_casual') {
    response = {"text" : "To make sure your decision please send us price.",
                      "quick_replies":[
                                      {
                                        "content_type":"text",
                                        "title":"10000 Ks",
                                        "payload":"casual_price"
                                      },{
                                        "content_type":"text",
                                        "title":"8000 Ks",
                                        "payload":"casual_price"
                                      }]
                    };
                    userInfo.price = true;
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

/*function for body infomation record*/
function bodymeasure(sender_psid){
    let response1 = {"text": `Chest: `+ userEnteredInfo.chest};
    let response2 = {"text": 'Upper arm: ' + userEnteredInfo.upperArm};
    let response3 = {"text": 'Sleeve length: ' + userEnteredInfo.sleevelength};
    let response4 = {"text": 'Waist: '+ userEnteredInfo.waist};
    let response5 = {"text": 'Hips: '+ userEnteredInfo.hips};
    let response6 = {"text": 'Thigh: ' + userEnteredInfo.thigh};
    let response7 = {"text": 'Inseam: '+ userEnteredInfo.inseam};
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

/*function for user answer*/
function user_answer(sender_psid){
  let response1 = {"text" : "Htamein Type:" + userEnteredInfo.htameintype};
  let response2 = {"text" : "Htamein Fold:" + userEnteredInfo.htameinfold};
  let response3 = {"text" : "Khar        :" + userEnteredInfo.khar};
  let response4 = {"text" : "Ankle       :" + userEnteredInfo.ankle};
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
            "title":"Wedding?",
            "image_url":"https://www.gomyanmartours.com/wp-content/uploads/2014/11/Rituals-in-Myanmar-Wedding-Ceremony.jpg",
            "subtitle":"👰",
            "default_action": {
              "type": "web_url",
              "url": "https://www.gomyanmartours.com/wp-content/uploads/2014/11/Rituals-in-Myanmar-Wedding-Ceremony.jpg",
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
            "image_url":"https://www.exoticvoyages.com/uploads/images/userfiles/2015/09/Unidentify-Myanmar-women-in-Festival-Procession-near-Heritage-Site-in-BaganMyanmar.jpg",
            "subtitle":"💃",
            "default_action": {
              "type": "web_url",
              "url": "https://www.exoticvoyages.com/uploads/images/userfiles/2015/09/Unidentify-Myanmar-women-in-Festival-Procession-near-Heritage-Site-in-BaganMyanmar.jpg",
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
            "title":"For a Convocation?",
            "image_url":"https://www.tic.edu.mm/wp-content/uploads/2018/05/31311065_776695719183162_6949008994670709342_o-1024x680.jpg",
            "subtitle":"👩‍🎓 ",
            "default_action": {
              "type": "web_url",
              "url": "https://www.tic.edu.mm/wp-content/uploads/2018/05/31311065_776695719183162_6949008994670709342_o-1024x680.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"Convocation.",
                "payload":"ABD"
              }              
            ]      
          },
          {
            "title":"Casual?",
            "image_url":"https://www.mmtimes.com/sites/mmtimes.com/files/styles/mmtimes_ratio_d_feature_detail/public/images/mte/2017/educentre/jan-2017/7-failed-system.jpg?itok=PPR9BjOg",
            "subtitle":"🤷",
            "default_action": {
              "type": "web_url",
              "url": "https://www.mmtimes.com/sites/mmtimes.com/files/styles/mmtimes_ratio_d_feature_detail/public/images/mte/2017/educentre/jan-2017/7-failed-system.jpg?itok=PPR9BjOg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"Casual.",
                "payload":"CASUAL"
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

/*function for Wedding event*/
async function wedding_event (sender_psid) {
  let response1 = {"text" : "For a wedding dress there are two prices at 150000 Ks and 300000 Ks. "};
    let response2 = { "attachment":{
                        "type":"template",
                        "payload":{
                          "template_type":"generic",
                          "elements":[
                             {
                              "title":"Wedding dress with htamein saim.",
                              "image_url":"https://i.pinimg.com/originals/30/5b/7e/305b7e837297d439044f8f5519f505f0.jpg",
                              "subtitle":"Will include much beaded embroidery design and that will look like an ancient princess dress.",
                              "default_action": {
                                "type": "web_url",
                                "url": "https://i.pinimg.com/originals/30/5b/7e/305b7e837297d439044f8f5519f505f0.jpg",
                                "webview_height_ratio": "tall",
                              },
                              "buttons":[
                               {
                                  "type":"postback",
                                  "title":"I choose 300000 Ks.",
                                  "payload":"choose_wedding"
                                }              
                              ]      
                            },
                            {
                              "title":"Simple wedding dress. ?",
                              "image_url":"https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTLpF_QJWgoY4cHy1pZsxDfQc3Q8YuvTXIjC3oc7Jpbqv3KoX63&usqp=CAU",
                              "subtitle":"will not include much beaded embroidery design and longer htamein saim.",
                              "default_action": {
                                "type": "web_url",
                                "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTLpF_QJWgoY4cHy1pZsxDfQc3Q8YuvTXIjC3oc7Jpbqv3KoX63&usqp=CAU",
                                "webview_height_ratio": "tall",
                              },
                              "buttons":[
                               {
                                  "type":"postback",
                                  "title":"I choose 150000 Ks.",
                                  "payload":"choose_wedding"
                                }              
                              ]      
                            }
                          ]
                        }
                      }
                    };
    
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2);
    });
}

/*function for Occasion event*/
async function occasion_event (sender_psid) {
  let response1 = {"text" : "For a Occasion dress there are two prices at 20000 Ks and 10000 Ks. "};
    let response2 = { "attachment":{
                        "type":"template",
                        "payload":{
                          "template_type":"generic",
                          "elements":[
                             {
                              "title":"Occasion dress with beaded embroidery.",
                              "image_url":"https://i.pinimg.com/originals/19/e5/92/19e59201981b2ec2b0e74535507411d4.jpg",
                              "subtitle":"Will include beaded embroidery.",
                              "default_action": {
                                "type": "web_url",
                                "url": "https://i.pinimg.com/originals/19/e5/92/19e59201981b2ec2b0e74535507411d4.jpg",
                                "webview_height_ratio": "tall",
                              },
                              "buttons":[
                               {
                                  "type":"postback",
                                  "title":"I choose 20000 Ks.",
                                  "payload":"choose_occasion"
                                }              
                              ]      
                            },
                            {
                              "title":"Simple occasion dress.",
                              "image_url":"https://i.pinimg.com/originals/b4/ba/d8/b4bad8617c6ef7f2e1dba80a8a21e70a.jpg",
                              "subtitle":"will not include beaded embroidery.",
                              "default_action": {
                                "type": "web_url",
                                "url": "https://i.pinimg.com/originals/b4/ba/d8/b4bad8617c6ef7f2e1dba80a8a21e70a.jpg",
                                "webview_height_ratio": "tall",
                              },
                              "buttons":[
                               {
                                  "type":"postback",
                                  "title":"I choose 10000 Ks.",
                                  "payload":"choose_occasion"
                                }              
                              ]      
                            }
                          ]
                        }
                      }
                    };
    
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2);
    });
}

/*function for Convocation event*/
async function convocation_event (sender_psid) {
  let response1 = {"text" : "For a Convocation dress there are two prices at 30000 Ks and 20000 Ks. Same as occasion dress but little fancy. :)  "};
    let response2 = { "attachment":{
                        "type":"template",
                        "payload":{
                          "template_type":"generic",
                          "elements":[
                             {
                              "title":"Convocation dress with beaded embroidery.",
                              "image_url":"https://www.textiledirectory.com.mm/images/hsuyeehtet/8.1/3.jpg",
                              "subtitle":"Will include much beaded embroidery and more fancy.",
                              "default_action": {
                                "type": "web_url",
                                "url": "https://www.textiledirectory.com.mm/images/hsuyeehtet/8.1/3.jpg",
                                "webview_height_ratio": "tall",
                              },
                              "buttons":[
                               {
                                  "type":"postback",
                                  "title":"I choose 30000 Ks.",
                                  "payload":"choose_convocation"
                                }              
                              ]      
                            },
                            {
                              "title":"Simple Convocation dress.",
                              "image_url":"https://qph.fs.quoracdn.net/main-qimg-9e8cb835ef77635c3233c1ee716728db.webp",
                              "subtitle":"will not much beaded embroidery.",
                              "default_action": {
                                "type": "web_url",
                                "url": "https://qph.fs.quoracdn.net/main-qimg-9e8cb835ef77635c3233c1ee716728db.webp",
                                "webview_height_ratio": "tall",
                              },
                              "buttons":[
                               {
                                  "type":"postback",
                                  "title":"I choose 20000 Ks.",
                                  "payload":"choose_convocation"
                                }              
                              ]      
                            }
                          ]
                        }
                      }
                    };
    
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2);
    });
}

/*function for Casual event*/
async function casual_event (sender_psid) {
  let response1 = {"text" : "For a Casual dress there are two prices at 10000 Ks and 80000 Ks. Same as occasion dress but little fancy. :)  "};
    let response2 = { "attachment":{
                        "type":"template",
                        "payload":{
                          "template_type":"generic",
                          "elements":[
                             {
                              "title":"Fancy Casual dress.",
                              "image_url":"https://i.pinimg.com/736x/1d/cd/88/1dcd88d9fb72287be584e4ab12168d1f.jpg",
                              "subtitle":"Will be fancy and uptodate design.",
                              "default_action": {
                                "type": "web_url",
                                "url": "https://i.pinimg.com/736x/1d/cd/88/1dcd88d9fb72287be584e4ab12168d1f.jpg",
                                "webview_height_ratio": "tall",
                              },
                              "buttons":[
                               {
                                  "type":"postback",
                                  "title":"I choose 10000 Ks.",
                                  "payload":"choose_casual"
                                }              
                              ]      
                            },
                            {
                              "title":"Simple Casual dress.",
                              "image_url":"https://scontent-yyz1-1.cdninstagram.com/v/t51.2885-15/sh0.08/e35/c0.179.1440.1440a/s640x640/62401071_2331144570297641_8473543770910940542_n.jpg?_nc_ht=scontent-yyz1-1.cdninstagram.com&_nc_cat=105&_nc_ohc=GRfCBd9gmBMAX8hvJMG&oh=9a51ee59ed6a84cb822fa59c6a4abf71&oe=5ECE844A",
                              "subtitle":"Just a simple.",
                              "default_action": {
                                "type": "web_url",
                                "url": "https://scontent-yyz1-1.cdninstagram.com/v/t51.2885-15/sh0.08/e35/c0.179.1440.1440a/s640x640/62401071_2331144570297641_8473543770910940542_n.jpg?_nc_ht=scontent-yyz1-1.cdninstagram.com&_nc_cat=105&_nc_ohc=GRfCBd9gmBMAX8hvJMG&oh=9a51ee59ed6a84cb822fa59c6a4abf71&oe=5ECE844A",
                                "webview_height_ratio": "tall",
                              },
                              "buttons":[
                               {
                                  "type":"postback",
                                  "title":"I choose 8000 Ks.",
                                  "payload":"choose_casual"
                                }              
                              ]      
                            }
                          ]
                        }
                      }
                    };
    
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2);
    });
}

/*Function for asking the customer design*/
async function asking_cus_design (sender_psid){
  let response1 = {"text":"Well...."};
  let response2 = {"text":"Send me the design you want to sew. If not you can get some idea from viewing others pictures."};
  let response3 = {
                    "attachment":{
                      "type":"template",
                      "payload":{
                        "template_type":"button",
                        "text":"Send if you have one. :)",
                        "buttons":[
                          {
                            "type":"web_url",
                            "url":"https://www.messenger.com",
                            "title":"Viewing pictures"
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
    designAttachment = true;
}

/*function function save data to firebase*/
async function showAllDataToCus(sender_psid) {
  let response1 = {"text": userEnteredInfo.name +` here are your body measurement, types and cloth design.`};
  let response2 = {"text": `Chest        : `+ userEnteredInfo.chest};
  let response3 = {"text": 'Upper arm    : ' + userEnteredInfo.upperArm};
  let response4 = {"text": 'Sleeve length: ' + userEnteredInfo.sleevelength};
  let response5 = {"text": 'Waist        : '+ userEnteredInfo.waist};
  let response6 = {"text": 'Hips         : '+ userEnteredInfo.hips};
  let response7 = {"text": 'Thigh        : ' + userEnteredInfo.thigh};
  let response8 = {"text": 'Inseam       : '+ userEnteredInfo.inseam};
  let response9 = {"text": "Htamein Type:" + userEnteredInfo.htameintype};
  let response10= {"text": "Htamein Fold:" + userEnteredInfo.htameinfold};
  let response11= {"text": "Khar        :" + userEnteredInfo.khar};
  let response12= {"text": "Ankle       :" + userEnteredInfo.ankle};
  let response13= {
    "attachment":{
            "type":"image", 
            "payload":{
              "url":userSendAttachment.designAttachment, 
              "is_reusable":true
            }
          }
  };
  let response14= {"text" : "Confirm or change",
                    "quick_replies":[
                                      {
                                        "content_type":"text",
                                        "title":"Confirm",
                                        "payload":"confirm"
                                      },{
                                        "content_type":"text",
                                        "title":"Change",
                                        "payload":"change"
                                      }]
  };

  callSend(sender_psid,response1).then(()=>{
        return callSend(sender_psid,response2).then(()=>{
          return callSend(sender_psid,response3).then(()=>{
            return callSend(sender_psid,response4).then(()=>{
              return callSend(sender_psid,response5).then(()=>{
                return callSend(sender_psid,response6).then(()=>{
                  return callSend(sender_psid,response7).then(()=>{
                    return callSend(sender_psid,response8).then(()=>{
                      return callSend(sender_psid,response9).then(()=>{
                        return callSend(sender_psid,response10).then(()=>{
                          return callSend(sender_psid,response11).then(()=>{
                            return callSend(sender_psid,response12).then(()=>{
                              return callSend(sender_psid,response13).then(()=>{
                                return callSend(sender_psid,response14);
                              });
                            });
                          });
                        });
                      });
                    });
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
    name : userEnteredInfo.name,
    chest : userEnteredInfo.chest,
    upperArm : userEnteredInfo.upperArm,
    sleevelength : userEnteredInfo.sleevelength,
    waist : userEnteredInfo.waist,
    hips : userEnteredInfo.hips,
    thigh : userEnteredInfo.thigh,
    inseam : userEnteredInfo.inseam,
    htameintype : userEnteredInfo.htameintype,
    htameinfold : userEnteredInfo.htameinfold,
    khar : userEnteredInfo.khar,
    ankle : userEnteredInfo.ankle,
    price : userEnteredInfo.price,
    cloth_design : userSendAttachment.designAttachment,
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
