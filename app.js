
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
  ejs = require("ejs"),  
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

// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {

  // Parse the request body from the POST
  let body = req.body;
  
  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {
    body.entry.forEach(function (entry) {

      let webhook_event = entry.messaging[0];
      let sender_psid = webhook_event.sender.id;

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

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

app.get('/setgsbutton',function(req,res){
    setupGetStartedButton(res);    
});

app.get('/setpersistentmenu',function(req,res){
    setupPersistentMenu(res);    
});

app.get('/clear',function(req,res){    
    removePersistentMenu(res);
});

//whitelist domains
//eg https://shwesu.herokuapp.com/whitelists
app.get('/whitelists', function (req, res) {
  whitelistDomains(res);
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

app.set('view engine', 'ejs');
app.set('views', __dirname+'/views');

app.get('/webview/:sender_id/',function(req,res){
    const sender_id = req.params.sender_id;

    let data = [];

    db.collection("share_information").limit(20).get()
    .then(  function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            let img = {};
            img.share_design = doc.data().share_design;
            img.customer_caption = doc.data().customer_caption;

            data.push(img);                      

        });
        console.log("DATA", data);
        res.render('webview.ejs',{data:data, sender_id:sender_id}); 

    }
    
    )
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });    
});

app.get('/adchoices/:sender_id/',function(req,res){
  const sender_id = req.params.sender_id;
  let data = [];
    if (wedding == true) {
       db.collection("wedding").limit(20).get()
    .then(  function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            let img = {};
            img.weddingPic = doc.data().weddingPic;

            data.push(img);                      

        });
        console.log("DATA", data);
        res.render('wedding.ejs',{data:data, sender_id:sender_id}); 
        }
      )
    }
   
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });    
});

let userInfo = {
  chest:false,
  upperArm:false,
  sleevelength:false,
  waist:false,
  hips:false,
  htameinlong:false,
  yinphonetype:false,
  sleevetype:false,
  khar:false,
  htameintype:false,
  htameinfold:false,
  ankle:false,
  price : false,
  cuscaption : false,
  appointmentdate : false,
  earlyAPprice :false,

};

let upperchest = false;
let upperupperArm = false;
let uppersleevelength = false;
let upperwaist = false;
let lowerwaist = false;
let lowerhips = false;
let lowerhmlong = false;
let lowerhmtype = false;
let lowerhmfold = false;
let lowerankle = false;
let wedding = false;
let occasion = false;
let convo = false;
let casual = false;
let yinphone = false;
let htamein = false;
let both = false;
let designAttachment = false;
let sharepicAttachment = false;

let userEnteredInfo = {};
let userSendAttachment = [];

function handleMessage(sender_psid, received_message) {
  let response;
  if (received_message.attachments && sharepicAttachment == true) {
    console.log('meta data',received_message);
    sharepicAttachment == false;
    let attachment_url1 = received_message.attachments[0].payload.url;
    userSendAttachment.sharepicAttachment = attachment_url1;
    let response1 = {
                    "attachment":{
                          "type":"image", 
                          "payload":{
                            "url":attachment_url1, 
                            "is_reusable":true
                          }
                        }
                    };
    let response2 = {"text": "Is this picture you want to share? By the way it's look good on you. :)",
                    "quick_replies":[{
                                        "content_type":"text",
                                        "title":"Yes! share it.",
                                        "payload":"shareYes"
                                      },{
                                        "content_type":"text",
                                        "title":"No..",
                                        "payload":"shareNo"
                                      }]
                    };
      callSend(sender_psid, response1).then(()=>{
          return callSend(sender_psid, response2);
        });   
  }else if (received_message.text == "No..") {    
    Reslected (sender_psid);
  }else if (received_message.text == "Yes! share it." || received_message.text == "No.") {    
   response = {"text": "write a caption to share with the picture."}
   userInfo.cuscaption = true;
  }else if (received_message.text && userInfo.cuscaption == true) {  
   userEnteredInfo.cuscaption = received_message.text;  
    response = {"text": "Are you sure? :)",
                    "quick_replies":[
                                      {
                                        "content_type":"text",
                                        "title":"Yes!",
                                        "payload":"captionYes"
                                      },{
                                        "content_type":"text",
                                        "title":"No.",
                                        "payload":"captionNo"
                                      }]
    };
   userInfo.cuscaption = false;
  }else if (received_message.text == "Yes!") {    
    saveData (sender_psid);
    response = {"text": "Thanks for your purchase in our shop. Have a good day. :)"}
  }else if (received_message.text && userInfo.appointmentdate == true) {   
    userEnteredInfo.appointmentdate =  received_message.text;
    response = {"attachment":{
                      "type":"template",
                      "payload":{
                        "template_type":"button",
                        "text":"Will add an extra amount 20000 to the current price.",
                        "buttons":[
                          {
                            "type":"postback",
                            "payload":"ap_priceYes",
                            "title":"Yes"
                          },
                          {
                            "type":"postback",
                            "payload":"ap_priceNo",
                            "title":"No, thanks."
                          }
                        ]
                      }
                    }
                  }
    userInfo.appointmentdate = false;
    userInfo.earlyAPprice = true;
  }else if (received_message.text && upperchest == true) {   
    userEnteredInfo.chest =  received_message.text;
    response = {
      "text": `Now Upper arm.`
    }
    upperchest = false;
    upperupperArm = true;
  }else if (received_message.text && upperupperArm == true) { 
    userEnteredInfo.upperArm = received_message.text; 
    response = {
      "text": `Let's measure Sleeve length.`
    }
    upperupperArm = false;
    uppersleevelength = true;
  }else if (received_message.text && uppersleevelength == true) { 
    userEnteredInfo.sleevelength = received_message.text;   
    response = {
      "text": `Finally measure your Waist.`
    }
    uppersleevelength = false;
    upperwaist = true;
  }else if (received_message.text && upperwaist == true) {
    userEnteredInfo.waist = received_message.text;    
    response = {"attachment":{
                      "type":"template",
                      "payload":{
                        "template_type":"button",
                        "text":"Would you like to customize type of Yinphone? eg. which fold.",
                        "buttons":[
                          {
                            "type":"postback",
                            "payload":"customize_yp",
                            "title":"Yes"
                          },
                          {
                            "type":"postback",
                            "payload":"notcustomize",
                            "title":"No, thanks."
                          }
                        ]
                      }
                    }
                  }
    upperwaist = false;
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
      "text": `Now your Hips..`
    }
    userInfo.waist = false;
    userInfo.hips = true;
  }else if (received_message.text && userInfo.hips == true) { 
    userEnteredInfo.hips = received_message.text;   
    response = {
      "text": `Measure how long htamein you want to sew.`
    }
    userInfo.hips = false;
    userInfo.htameinlong = true;
  }else if (received_message.text && userInfo.htameinlong == true) {   
    userEnteredInfo.htameinlong = received_message.text; 
    response = {"attachment":{
                      "type":"template",
                      "payload":{
                        "template_type":"button",
                        "text":"Would you like to customize type of cloth? eg. which fold.",
                        "buttons":[
                          {
                            "type":"postback",
                            "payload":"customize_wh",
                            "title":"Yes"
                          },
                          {
                            "type":"postback",
                            "payload":"notcustomize",
                            "title":"No, thanks."
                          }
                        ]
                      }
                    }
                  }
    userInfo.htameinlong = false;
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
    let response1 = {"text": `Would you like to cover ankle or not?`};
    let response2 = {"text" : "Upper ankle/cover ankle.",
                      "quick_replies":[
                                      {
                                        "content_type":"text",
                                        "title":"Upper Ankle",
                                        "payload":"ua"
                                      },{
                                        "content_type":"text",
                                        "title":"Cover Ankle",
                                        "payload":"ca"
                                      }]
                    };
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2);
    });
    userInfo.htameinfold = false;
    userInfo.ankle = true;
  }else if (received_message.text && userInfo.ankle == true) { 
    userEnteredInfo.ankle = received_message.text;
    let response1 = {"text" : "which type of yinphone? "};
    let response2 = {
        "attachment":{
            "type":"image", 
            "payload":{
              "url":"https://i.imgur.com/nWjNZpT.jpg", 
              "is_reusable":true
            }
          }
    };
    let response3 = {"text" : "Yin ci/Yinphone/Back zip.",
                      "quick_replies":[
                                      {
                                        "content_type":"text",
                                        "title":"Yin ci",
                                        "payload":"yc"
                                      },{
                                        "content_type":"text",
                                        "title":"Yinphone",
                                        "payload":"yp"
                                      },{
                                        "content_type":"text",
                                        "title":"Back zip",
                                        "payload":"bz"
                                      }]
                    };
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2).then(()=>{
        return callSend(sender_psid, response3);
      });
    });
    userInfo.ankle = false;
    userInfo.yinphonetype = true;
  }else if (received_message.text && userInfo.yinphonetype == true) { 
    userEnteredInfo.yinphonetype = received_message.text;   
    let response1 = {"text": `How much sleeve length you want?`};
    let response2 = {"text" : "Short sleeve/Long sleeve.",
                      "quick_replies":[
                                      {
                                        "content_type":"text",
                                        "title":"Short sleeve",
                                        "payload":"SSL"
                                      },{
                                        "content_type":"text",
                                        "title":"Long sleeve",
                                        "payload":"LSL"
                                      }]
                    };
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2);
    });
    userInfo.yinphonetype = false;
    userInfo.sleevetype = true;
  }else if (received_message.text && userInfo.sleevetype == true) { 
    userEnteredInfo.sleevetype = received_message.text;
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
    userInfo.sleevetype = false;
    userInfo.khar = true;
  }else if (received_message.text && userInfo.khar == true) { 
    userEnteredInfo.khar = received_message.text;  
    askforevent(sender_psid);
    userInfo.khar = false;
  }else if (received_message.text && lowerwaist == true) {
    userEnteredInfo.waist = received_message.text;    
    response = {
      "text": `Now your Hips.`
    }
    lowerwaist = false;
    lowerhips = true;
  }else if (received_message.text && lowerhips == true) { 
    userEnteredInfo.hips = received_message.text;   
    response = {
      "text": `Measure how long htamein you want to sew.`
    }
    lowerhips = false;
    lowerhmlong = true;
  }else if (received_message.text && lowerhmlong == true) {   
    userEnteredInfo.htameinlong = received_message.text; 
    response = {"attachment":{
                      "type":"template",
                      "payload":{
                        "template_type":"button",
                        "text":"Would you like to customize type of Htamein? eg. which fold.",
                        "buttons":[
                          {
                            "type":"postback",
                            "payload":"customize_hm",
                            "title":"Yes"
                          },
                          {
                            "type":"postback",
                            "payload":"notcustomize",
                            "title":"No, thanks."
                          }
                        ]
                      }
                    }
                  }
    lowerhmlong = false;
  }else if (received_message.text && lowerhmtype == true) { 
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
    lowerhmtype = false;
    lowerhmfold = true;
  }else if (received_message.text && lowerhmfold == true) { 
    userEnteredInfo.htameinfold = received_message.text;
    let response1 = {"text": `Would you like to cover ankle or not?`};
    let response2 = {"text" : "Upper ankle/cover ankle.",
                      "quick_replies":[
                                      {
                                        "content_type":"text",
                                        "title":"Upper Ankle",
                                        "payload":"ua"
                                      },{
                                        "content_type":"text",
                                        "title":"Cover Ankle",
                                        "payload":"ca"
                                      }]
                    };
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2);
    });
    lowerhmfold = false;
    lowerankle = true;
  }else if (received_message.text && lowerankle == true) { 
    userEnteredInfo.ankle = received_message.text;
    askforevent(sender_psid);
   lowerankle = false;
  }else if (received_message.attachments && designAttachment == true) {
    console.log('meta data',received_message);
    designAttachment == false;
    let attachment_url = received_message.attachments[0].payload.url;
    userSendAttachment.designAttachment = attachment_url;
    let response1 = {
                    "attachment":{
                          "type":"image", 
                          "payload":{
                            "url":attachment_url, 
                            "is_reusable":true
                          }
                        }
                    };
    let response2 = {"text": "Is this the design you want to sew and look alike?",
                    "quick_replies":[{
                                        "content_type":"text",
                                        "title":"Yes.",
                                        "payload":"designYes"
                                      },{
                                        "content_type":"text",
                                        "title":"No.",
                                        "payload":"designNo"
                                      }]
                    };
      callSend(sender_psid, response1).then(()=>{
          return callSend(sender_psid, response2);
        });   
  }else if (received_message.text == "No.") {    
    response = {"text" : "Please send me again"}
    designAttachment == true;
  }else if (received_message.text == "Yes." && wedding == true) {    
    wedding_event(sender_psid);
    wedding = false;
  }else if (received_message.text == "Yes." && occasion == true) {    
    occasion_event(sender_psid);
    occasion = false;
  }else if (received_message.text == "Yes." && convo == true) {    
    convocation_event(sender_psid);
    convo = false;
  }else if (received_message.text == "Yes." && casual == true) {    
    casual_event(sender_psid);
    casual = false;
  }else if (received_message.text && userInfo.price == true) { 
    userEnteredInfo.price = received_message.text;   
    response = {"text" : "OK"}
    userInfo.price = false;
  }

  else if (received_message.text == "test") {    
    response = {"attachment":{
                          "type":"image", 
                          "payload":{
                            "url":userSendAttachment.designAttachment, 
                            "is_reusable":true
                          }
                        }}
  }
 callSendAPI(sender_psid, response); 
}

const handlePostback = (sender_psid, received_postback) => {
  let payload = received_postback.payload;
  console.log('ok')

    switch (payload) {
      case "get_started":
        greeting(sender_psid);
        break;
      case "order_comfirm":
        orderComfirm(sender_psid);
        break;
      case "share_pic":
        sharePicture(sender_psid);
        break;
      case "leaving":
        leaving(sender_psid);
        break;
      case "SEW":
        askAppointmentdate(sender_psid);
        break;
      case "appointmentdateYes":
        appointmentdateYes(sender_psid);
        break;
      case "ap_priceYes":
        askFabric(sender_psid);
        if (userInfo.earlyAPprice == true) { userEnteredInfo.earlyAPprice = 20000;
          console.log ('priceSave');};
        break;
      case "ap_priceNo":
        Reslected(sender_psid);
        break;
      case "appointmentdateNo":
        askFabric(sender_psid);
        break;
      case "inShop":
        chooesClothPart(sender_psid);
        break;
      case "willDeliver":
        cuswillDeli(sender_psid);
        break;
      case "continue":
        chooesClothPart(sender_psid);
        break;
      case "yinphone":
        yinphoneMeasuring(sender_psid);
        yinphone = true;
        break;
      case "htamein":
        htameinMeasuring(sender_psid);
        htamein = true;
        break;
      case "both_part":
        wholeMeasuring(sender_psid);
        both = true;
        break;
      case "customize_wh":
        customizewhole(sender_psid);
        break;
      case "customize_hm":
        customizeHtamein(sender_psid);
        break;
      case "customize_yp":
        customizeYinhpone(sender_psid);
        break;
      case "notcustomize":
        askforevent(sender_psid);
        break;
      case "WEDDING":
        asking_cus_design(sender_psid);
        wedding = true;
        break;
      case "OCCASION":
        asking_cus_design(sender_psid);
        occasion = true;
        break;
      case "CONVO":
        asking_cus_design(sender_psid);
        convo = true;
        break;
      case "CASUAL":
        asking_cus_design(sender_psid);
        casual = true;
        break;
      case "choose_wedding":
        wedding_price(sender_psid);
        break;
      case "choose_occasion":
        occasion_price(sender_psid);
        break;
      case "choose_convocation":
        convocation_price(sender_psid);
        break;
      case "choose_casual":
        casual_price(sender_psid);
        break;
      default:
        defaultReply(sender_psid);
    }
}

async function greeting (sender_psid){  
  let user = await getUserProfile(sender_psid);
  let response1 = {"text": "Mingalaba..🙋‍♀ Warmly welcome to Shwe Hsu.🙆‍♀"};
  let response2 = {
      "attachment":{
                    "type":"template",
                    "payload":{
                      "template_type":"button",
                      "text":"Chooes what you want to do.",
                      "buttons":[
                                  {
                                    "type": "postback",
                                    "title": "I want to sew 👗",
                                    "payload": "SEW",
                                  },{
                                    "type": "postback",
                                    "title": "Share pictures",
                                    "payload": "share_pic",
                                  },
                                  {
                                    "type": "web_url",
                                    "title": "Pictures of others",
                                    "url": "https://shwesu.herokuapp.com/webview/"+sender_psid,
                                    "webview_height_ratio": "tall",
                                    "messenger_extensions": true,          
                                  }
                               ]
                           }
                    } 
                   }; 
  let response3 = {
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
                "payload": "order_comfirm",
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

const sharePicture = (sender_psid) => {
  let response;
  response = {"text": "Let's take a look at the most beautiful images of you with wearing the cloth sewn by Shwe Hsu."}
    sharepicAttachment = true;
  callSendAPI(sender_psid, response);
}

const askAppointmentdate = (sender_psid) => {
  let response;
  response = {"attachment":{
                      "type":"template",
                      "payload":{
                        "template_type":"button",
                        "text":"It usually takes about a month to complete the cloth. Are you in hurry?",
                        "buttons":[
                          {
                            "type":"postback",
                            "payload":"appointmentdateYes",
                            "title":"Yes"
                          },
                          {
                            "type":"postback",
                            "payload":"appointmentdateNo",
                            "title":"No, thanks."
                          }
                        ]
                      }
                    } 
  }
  callSendAPI(sender_psid, response);
}

const appointmentdateYes = (sender_psid) => {
  let response;
  response = { "text": "well... you can get in 2days/ 4days and 6days. It has to pay more than the existing price.",
                "quick_replies":[
                                  {
                                   "content_type":"text",
                                   "title":"in 2days",
                                   "payload":"2"
                                  },{
                                   "content_type":"text",
                                   "title":"in 4days",
                                   "payload":"4"
                                  },{
                                   "content_type":"text",
                                   "title":"in 6days",
                                   "payload":"6"
                                  }
                                ]
              }
              userInfo.appointmentdate = true;
  callSendAPI(sender_psid, response);
}

const askFabric = (sender_psid) => {
  let response;
  response = {"attachment":{
                      "type":"template",
                      "payload":{
                        "template_type":"button",
                        "text":"Is your piece of fabric in our shop? or delivery?",
                        "buttons":[
                          {
                            "type":"postback",
                            "payload":"inShop",
                            "title":"Is in your shop."
                          },
                          {
                            "type":"postback",
                            "payload":"willDeliver",
                            "title":"Will be delivered"
                          }
                        ]
                      }
                    } 
  }
  callSendAPI(sender_psid, response);
}

const cuswillDeli = (sender_psid) => {
    let response;
        response = {"attachment":{
                            "type":"template",
                            "payload":{
                              "template_type":"button",
                              "text":"OK.., it can be any bus stop from Tatkone. Send with this Contact 0912345678. Click the button to continue/leave.",
                              "buttons":[
                                {
                                  "type": "postback",
                                  "title": "Continue",
                                  "payload": "continue",
                                },{
                                  "type": "postback",
                                  "title": "Sorry, I want to leave",
                                  "payload": "leaving",
                                }
                              ]
                            }
                          } 
                    }
        callSendAPI(sender_psid, response);
}

const chooesClothPart = (sender_psid) => {
  let response;
  response = {"attachment":{
                      "type":"template",
                      "payload":{
                        "template_type":"button",
                        "text":"Which part do you want to sew on? Up part (Yinphone)/ bottom part (Htamein) or both",
                        "buttons":[
                          {
                            "type":"postback",
                            "payload":"yinphone",
                            "title":"Yinphone"
                          },
                          {
                            "type":"postback",
                            "payload":"htamein",
                            "title":"Htamein"
                          },
                          {
                            "type":"postback",
                            "payload":"both_part",
                            "title":"Both"
                          }
                        ]
                      }
                    } 
  }
  callSendAPI(sender_psid, response);
}

const yinphoneMeasuring = (sender_psid) => {
  let response1 = {"text":"OK..Let's get your upper body measurement. Here are ways to measure your body. Hopefully that will be useful. :)"};    
     let response2 = {
      "attachment":{
            "type":"image", 
            "payload":{
              "url":"https://i.imgur.com/Gp8IdLm.jpg", 
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
    upperchest = true;
}

const htameinMeasuring = (sender_psid) => {
  let response1 = {"text":"OK..Let's get your lower body measurement. Here are ways to measure your body. Hopefully that will be useful. :)"};    
     let response2 = {
      "attachment":{
            "type":"image", 
            "payload":{
              "url":"https://i.imgur.com/q9tAoaL.jpg", 
              "is_reusable":true
            }
          }
    };
    let response3 = {"text" : "Well.. let's measure waist first."}
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2).then(()=>{
        return callSend(sender_psid, response3);
      });
    });
    lowerwaist = true;
}

const wholeMeasuring = (sender_psid) => {
  let response1 = {"text":"OK..Let's get your body measurement. Here are ways to measure your body. Hopefully that will be useful. :)"};    
     let response2 = {
      "attachment":{
            "type":"image", 
            "payload":{
              "url":"https://i.imgur.com/OZHccJk.jpg", 
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
}

const customizewhole = (sender_psid) => {   
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
      return callSend(sender_psid, response2).then(()=>{
        return callSend(sender_psid, response3);
      });
    });
    userInfo.htameintype = true;
}

const customizeHtamein = (sender_psid) => {   
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
      return callSend(sender_psid, response2).then(()=>{
        return callSend(sender_psid, response3);
      });
    });
    lowerhmtype = true;
}

const customizeYinhpone = (sender_psid) => {   
   let response1 = {"text" : "which type of yinphone? "};
    let response2 = {
        "attachment":{
            "type":"image", 
            "payload":{
              "url":"https://i.imgur.com/nWjNZpT.jpg", 
              "is_reusable":true
            }
          }
    };
    let response3 = {"text" : "Yin ci/Yinphone/Back zip.",
                      "quick_replies":[
                                      {
                                        "content_type":"text",
                                        "title":"Yin ci",
                                        "payload":"yc"
                                      },{
                                        "content_type":"text",
                                        "title":"Yinphone",
                                        "payload":"yp"
                                      },{
                                        "content_type":"text",
                                        "title":"Back zip",
                                        "payload":"bz"
                                      }]
                    };
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2).then(()=>{
        return callSend(sender_psid, response3);
      });
    });
    userInfo.yinphonetype = true;
}

const asking_cus_design = (sender_psid) => {
  let response1 = {"text":"Well...."};
  let response2 = {"text":"Send me the design you want to sew. If not you can get some idea from viewing admin chocies."};
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
                            "title":"Admin chocies",
                            "url": "https://shwesu.herokuapp.com/adchoices/"+sender_psid,
                            "webview_height_ratio": "tall",
                            "messenger_extensions": true,  
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

const askforevent = (sender_psid) => {
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
            "image_url":"https://i.imgur.com/SjMKwkM.jpg",
            "subtitle":"👰",
            "default_action": {
              "type": "web_url",
              "url": "https://i.imgur.com/SjMKwkM.jpg",
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
            "image_url":"https://i.imgur.com/X5Xfu2Y.jpg",
            "subtitle":"💃",
            "default_action": {
              "type": "web_url",
              "url": "https://i.imgur.com/X5Xfu2Y.jpg",
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
            "image_url":"https://i.imgur.com/YJrUEOQ.jpg",
            "subtitle":"👩‍🎓 ",
            "default_action": {
              "type": "web_url",
              "url": "https://i.imgur.com/YJrUEOQ.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"Convocation.",
                "payload":"CONVO"
              }              
            ]      
          },
          {
            "title":"Casual?",
            "image_url":"https://i.imgur.com/vt8aPXr.jpg",
            "subtitle":"🤷",
            "default_action": {
              "type": "web_url",
              "url": "https://i.imgur.com/vt8aPXr.jpg",
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

const wedding_event = (sender_psid) => {
  let response1 = {"text" : "For a wedding dress there are two prices around 200000 Ks and 300000 Ks. "};
    let response2 = { "attachment":{
                        "type":"template",
                        "payload":{
                          "template_type":"generic",
                          "elements":[
                             {
                              "title":"Wedding dress with htamein saim.",
                              "image_url":"https://i.imgur.com/inWnMz4.jpg",
                              "subtitle":"Will include much beaded embroidery design and that will look like an ancient princess dress.",
                              "default_action": {
                                "type": "web_url",
                                "url": "https://i.imgur.com/inWnMz4.jpg",
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
                              "title":"Simple wedding dress?",
                              "image_url":"https://i.imgur.com/dYyYWvX.jpg",
                              "subtitle":"will not include much beaded embroidery design and longer htamein saim.",
                              "default_action": {
                                "type": "web_url",
                                "url": "https://i.imgur.com/dYyYWvX.jpg",
                                "webview_height_ratio": "tall",
                              },
                              "buttons":[
                               {
                                  "type":"postback",
                                  "title":"I choose 200000 Ks.",
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

const wedding_price = (sender_psid) => {
 let response;
  response = {"text" : "To make sure your decision please send us price.",
                      "quick_replies":[
                                      {
                                        "content_type":"text",
                                        "title":"300000 Ks",
                                        "payload":"wedding_price"
                                      },{
                                        "content_type":"text",
                                        "title":"200000 Ks",
                                        "payload":"wedding_price"
                                      }]
                    };
                    userInfo.price = true;
  callSendAPI(sender_psid, response);
}

const occasion_event = (sender_psid) => {
  let response1 = {"text" : "For a Occasion dress there are two prices around 20000 Ks and 15000 Ks. "};
    let response2 = { "attachment":{
                        "type":"template",
                        "payload":{
                          "template_type":"generic",
                          "elements":[
                             {
                              "title":"Occasion dress with beaded embroidery.",
                              "image_url":"https://i.imgur.com/Tw7b2I0.jpg",
                              "subtitle":"Will include beaded embroidery.",
                              "default_action": {
                                "type": "web_url",
                                "url": "https://i.imgur.com/Tw7b2I0.jpg",
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
                              "image_url":"https://i.imgur.com/eerHAYn.jpg",
                              "subtitle":"will not include beaded embroidery.",
                              "default_action": {
                                "type": "web_url",
                                "url": "https://i.imgur.com/eerHAYn.jpg",
                                "webview_height_ratio": "tall",
                              },
                              "buttons":[
                               {
                                  "type":"postback",
                                  "title":"I choose 15000 Ks.",
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

const occasion_price = (sender_psid) => {
 let response;
  response = {"text" : "To make sure your decision please send us price.",
                      "quick_replies":[
                                      {
                                        "content_type":"text",
                                        "title":"20000 Ks",
                                        "payload":"wedding_price"
                                      },{
                                        "content_type":"text",
                                        "title":"15000 Ks",
                                        "payload":"wedding_price"
                                      }]
                    };
                    userInfo.price = true;
  callSendAPI(sender_psid, response);
}

const convocation_event = (sender_psid) => {
  let response1 = {"text" : "For a Convocation dress there are two prices around 30000 Ks and 20000 Ks. Same as occasion dress but little fancy. :)  "};
    let response2 = { "attachment":{
                        "type":"template",
                        "payload":{
                          "template_type":"generic",
                          "elements":[
                             {
                              "title":"Convocation dress with beaded embroidery.",
                              "image_url":"https://i.imgur.com/jF2f9nZ.jpg",
                              "subtitle":"Will include much beaded embroidery and more fancy.",
                              "default_action": {
                                "type": "web_url",
                                "url": "https://i.imgur.com/jF2f9nZ.jpg",
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
                              "image_url":"https://i.imgur.com/D7Gtsu7.jpg",
                              "subtitle":"will not include much beaded embroidery.",
                              "default_action": {
                                "type": "web_url",
                                "url": "https://i.imgur.com/D7Gtsu7.jpg",
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

const convocation_price = (sender_psid) => {
 let response;
  response = {"text" : "To make sure your decision please send us price.",
                      "quick_replies":[
                                      {
                                        "content_type":"text",
                                        "title":"30000 Ks",
                                        "payload":"wedding_price"
                                      },{
                                        "content_type":"text",
                                        "title":"20000 Ks",
                                        "payload":"wedding_price"
                                      }]
                    };
                    userInfo.price = true;
  callSendAPI(sender_psid, response);
}

const casual_event = (sender_psid) => {
  let response1 = {"text" : "For a Casual dress there are two prices around 10000 Ks and 8000 Ks. Same as occasion dress but little fancy. :)  "};
    let response2 = { "attachment":{
                        "type":"template",
                        "payload":{
                          "template_type":"generic",
                          "elements":[
                             {
                              "title":"Fancy Casual dress.",
                              "image_url":"https://i.imgur.com/SHcBq7h.jpg",
                              "subtitle":"Will be fancy and uptodate design.",
                              "default_action": {
                                "type": "web_url",
                                "url": "https://i.imgur.com/SHcBq7h.jpg",
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
                              "image_url":"https://i.imgur.com/rT7LMi6.jpg",
                              "subtitle":"Just a simple.",
                              "default_action": {
                                "type": "web_url",
                                "url": "https://i.imgur.com/rT7LMi6.jpg",
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

const casual_price = (sender_psid) => {
 let response;
  response = {"text" : "To make sure your decision please send us price.",
                      "quick_replies":[
                                      {
                                        "content_type":"text",
                                        "title":"10000 Ks",
                                        "payload":"wedding_price"
                                      },{
                                        "content_type":"text",
                                        "title":"8000 Ks",
                                        "payload":"wedding_price"
                                      }]
                    };
                    userInfo.price = true;
  callSendAPI(sender_psid, response);
}

const orderComfirm = (sender_psid) => {
  let response;
  response = {
                  "attachment":{
                  "type":"template",
                  "payload":{
                    "template_type":"receipt",
                    "recipient_name":"Stephane Crozatier",
                    "order_number":"12345678902",
                    "currency":"USD",
                    "payment_method":"Visa 2345",        
                    "order_url":"http://petersapparel.parseapp.com/order?order_id=123456",
                    "timestamp":"1428444852",         
                    "address":{
                      "street_1":"1 Hacker Way",
                      "street_2":"",
                      "city":"Menlo Park",
                      "postal_code":"94025",
                      "state":"CA",
                      "country":"US"
                    },
                    "summary":{
                      "subtotal":75.00,
                      "shipping_cost":4.95,
                      "total_tax":6.19,
                      "total_cost":56.14
                    },
                    "adjustments":[
                      {
                        "name":"New Customer Discount",
                        "amount":20
                      },
                      {
                        "name":"$10 Off Coupon",
                        "amount":10
                      }
                    ],
                    "elements":[
                      {
                        "title":"Classic White T-Shirt",
                        "subtitle":"100% Soft and Luxurious Cotton",
                        "quantity":2,
                        "price":50,
                        "currency":"USD",
                        "image_url":"http://petersapparel.parseapp.com/img/whiteshirt.png"
                      },
                      {
                        "title":"Classic Gray T-Shirt",
                        "subtitle":"100% Soft and Luxurious Cotton",
                        "quantity":1,
                        "price":25,
                        "currency":"USD",
                        "image_url":"http://petersapparel.parseapp.com/img/grayshirt.png"
                      }
                    ]
                  }
                }
    }
  callSendAPI(sender_psid, response);
}

const Reslected = (sender_psid) => {
  let response;
  response = {"attachment":{
                      "type":"template",
                      "payload":{
                        "template_type":"button",
                        "text":"Please select below to start again.",
                        "buttons":[
                          {
                            "type": "postback",
                            "title": "I want to sew 👗",
                            "payload": "SEW",
                          },{
                            "type": "postback",
                            "title": "Share pictures",
                            "payload": "share_pic",
                          },
                          {
                            "type": "web_url",
                            "title": "Pictures of others",
                            "url": "https://qph.fs.quoracdn.net/main-qimg-9e8cb835ef77635c3233c1ee716728db.webp",
                            "webview_height_ratio": "tall",
                          }
                        ]
                      }
                    } 
              }
  callSendAPI(sender_psid, response);
}

const leaving = (sender_psid) => {
  let response;
  response = {"text": "Thank you for your times."}
  callSendAPI(sender_psid, response);
}

function saveData(sender_psid) {
  const share_info = {
    id : sender_psid,
    customer_caption : userEnteredInfo.cuscaption,
    share_design : userSendAttachment.sharepicAttachment,
  }
  db.collection('share_information').add(share_info);
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
                              "title":"I want to sew",
                              "type":"postback",
                              "payload":"SEW"
                            },
                            {
                              "title":"Share pictures",
                              "type":"postback",
                              "payload":"SP"
                            },
                            {
                              "title":"View others pictures",
                              "type":"postback",
                              "payload":"POO"
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

const whitelistDomains = (res) => {
  var messageData = {
    "whitelisted_domains": [
      "https://shwesu.herokuapp.com",
      "https://herokuapp.com"
    ]
  };
  request({
      url: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token=' + PAGE_ACCESS_TOKEN,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      form: messageData
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.send(body);
      } else {
        res.send(body);
      }
    });
}