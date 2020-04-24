
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


let designAttachment = false;
let bdesignAttachment = false;
let sharepicAttachment = false;

let userEnteredInfo = {};


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
    user_answer(sender_psid);
    userInfo.ankle = false;
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
            "title": "Is tis one?",
            "subtitle": "You exactly know how to blink others people eyes.",
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
  }
  callSendAPI(sender_psid, response);    
}

function handlePostback(sender_psid, received_postback) {
  console.log('ok')
   let response;
  let payload = received_postback.payload;
  if (payload === 'SEW') {
    response = { "text": "Please tell me your name. :) " }
    userInfo.name = true;
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
  }else if (payload === 'yes_right') {
    askforevent (sender_psid);
  }else if (payload === 'WEDDING') {
    wedding_event (sender_psid);
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
                "title":"Wedding.",
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
                "title":"Occasion.",
                "payload":"OCCASION"
              }              
            ]      
          },
          {
            "title":"For a Convocation?",
            "image_url":"https://www.textiledirectory.com.mm/images/YadanarWin/1.6.2019/dress/3.jpg",
            "subtitle":"👩‍🎓 ",
            "default_action": {
              "type": "web_url",
              "url": "https://www.textiledirectory.com.mm/images/YadanarWin/1.6.2019/dress/3.jpg",
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
