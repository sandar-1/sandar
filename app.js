
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
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });    
});

app.post('/imagepick',function(req,res){
      
  const sender_id = req.body.sender_id;
  const doc_id = req.body.doc_id;

  console.log('DOC ID:', doc_id); 

  db.collection('wedding').doc(doc_id).get()
  .then(doc => {
    if (!doc.exists) {
      console.log('No such document!');
    } else {
      const image_url = doc.data().weddingPic;

      console.log('IMG URL:', image_url);

      let response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is this the image you like?",
            "image_url":image_url,                       
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
  callSendAPI(sender_psid, response);
    }
  })
  .catch(err => {
    console.log('Error getting document', err);
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

let changing = {
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
};

let upperchest = false;
let upperupperArm = false;
let uppersleevelength = false;
let upperwaist = false;
let upperyptype = false;
let uppersltype = false;
let upperkhar = false;
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
let yinphoneprice = false;
let htameinprice = false;
let htameinRC = false;
let yinphoneRC = false;
let bothRC = false;
let bothallRC = false;

let designAttachment = false;
let sharepicAttachment = false;
let cuspaidAttachment = false;

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
    saveData_SP (sender_psid);
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
    upperwaist = false;
    upperyptype = true;
  }else if (received_message.text && upperyptype == true) { 
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
    upperyptype = false;
    uppersltype = true;
  }else if (received_message.text && uppersltype == true) { 
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
    uppersltype = false;
    upperkhar = true;
  }else if (received_message.text && upperkhar == true) { 
    userEnteredInfo.khar = received_message.text;  
    askforeventYP(sender_psid);
    upperkhar = false;
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
    showBOTHallrecord(sender_psid);
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
    lowerhmlong = false;
    lowerhmtype = true;
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
    askforeventHM(sender_psid);
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
                                        "title":"No!",
                                        "payload":"designNo"
                                      }]
                    };
      callSend(sender_psid, response1).then(()=>{
          return callSend(sender_psid, response2);
        });   
  }else if (received_message.text == "No!") {    
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
  }else if (received_message.text == "Yes.") {    
    showYPrecord(sender_psid);
  }else if (received_message.text && userInfo.price == true) { 
    userEnteredInfo.price = received_message.text;   
    response = {"attachment":{
                            "type":"template",
                            "payload":{
                              "template_type":"button",
                              "text":"It would take about a month to sew. And you must to pay a third of the price. Is it okay?",
                              "buttons":[
                                {
                                  "type": "postback",
                                  "title": "Yes",
                                  "payload": "yesorder",
                                },{
                                  "type": "postback",
                                  "title": "Sorry, I'm not insterested.",
                                  "payload": "leaving",
                                }
                              ]
                            }
                          } 
                    }
    userInfo.price = false;
  }
/*changing*/
  else if (received_message.text == "Chest" || received_message.text == "chest") {
   response = { "text" : "Send me chest update measurement. :)"}
   changing.chest = true;
  }else if (received_message.text && changing.chest == true) {   
    userEnteredInfo.chest =  received_message.text;
    response = {
      "text": `Are you sure? If not click on key word to measure again.`,
      "quick_replies":[
                        {
                        "content_type":"text",
                        "title":"Sure",
                        "payload":"change_sure"
                        },{
                        "content_type":"text",
                        "title":"Chest",
                        "payload":"change_measurement"
                        }]
    }
    changing.chest = false;
  }else if (received_message.text == "Arm" || received_message.text == "arm") {
   response = { "text" : "Send me upper arm update measurement. :)"}
   changing.upperArm = true;
  }else if (received_message.text && changing.upperArm == true) {   
    userEnteredInfo.upperArm =  received_message.text;
    response = {
      "text": `Are you sure? If not click on key word to measure again.`,
      "quick_replies":[
                        {
                        "content_type":"text",
                        "title":"Sure",
                        "payload":"change_sure"
                        },{
                        "content_type":"text",
                        "title":"Arm",
                        "payload":"change_measurement"
                        }]
    }
    changing.upperArm = false;
  }else if (received_message.text == "Sleeve" || received_message.text == "sleeve") {
   response = { "text" : "Send me update sleevelength measurement. :)"}
   changing.sleevelength = true;
  }else if (received_message.text && changing.sleevelength == true) {   
    userEnteredInfo.sleevelength =  received_message.text;
    response = {
      "text": `Are you sure? If not click on key word to measure again.`,
      "quick_replies":[
                        {
                        "content_type":"text",
                        "title":"Sure",
                        "payload":"change_sure"
                        },{
                        "content_type":"text",
                        "title":"Sleeve",
                        "payload":"change_measurement"
                        }]
    }
    changing.sleevelength = false;
  }else if (received_message.text == "waist" || received_message.text == "Waist") {
   response = { "text" : "Send me update waist measurement. :)"}
   changing.waist = true;
  }else if (received_message.text && changing.waist == true) {   
    userEnteredInfo.waist =  received_message.text;
    response = {
      "text": `Are you sure? If not click on key word to measure again.`,
      "quick_replies":[
                        {
                        "content_type":"text",
                        "title":"Sure",
                        "payload":"change_sure"
                        },{
                        "content_type":"text",
                        "title":"Waist",
                        "payload":"change_measurement"
                        }]
    }
    changing.waist = false;
  }else if (received_message.text == "hips" || received_message.text == "Hips") {
   response = { "text" : "Send me update hips measurement. :)"}
   changing.hips = true;
  }else if (received_message.text && changing.hips == true) {   
    userEnteredInfo.hips =  received_message.text;
    response = {
      "text": `Are you sure? If not click on key word to measure again.`,
      "quick_replies":[
                        {
                        "content_type":"text",
                        "title":"Sure",
                        "payload":"change_sure"
                        },{
                        "content_type":"text",
                        "title":"Hips",
                        "payload":"change_measurement"
                        }]
    }
    changing.hips = false;
  }else if (received_message.text == "hmlong" || received_message.text == "Hmlong") {
   response = { "text" : "Send me update Htamein long measurement. :)"}
   changing.htameinlong = true;
  }else if (received_message.text && changing.htameinlong == true) {   
    userEnteredInfo.htameinlong =  received_message.text;
    response = {
      "text": `Are you sure? If not click on key word to measure again.`,
      "quick_replies":[
                        {
                        "content_type":"text",
                        "title":"Sure",
                        "payload":"change_sure"
                        },{
                        "content_type":"text",
                        "title":"Hmlong",
                        "payload":"change_measurement"
                        }]
    }
    changing.htameinlong = false;
  }else if (received_message.text == "hmtype" || received_message.text == "Hmtype") {
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
   changing.htameintype = true;
  }else if (received_message.text && changing.htameintype == true) {   
    userEnteredInfo.htameintype =  received_message.text;
    response = {
      "text": `Are you sure? If not click on key word to measure again.`,
      "quick_replies":[
                        {
                        "content_type":"text",
                        "title":"Sure",
                        "payload":"change_sure"
                        },{
                        "content_type":"text",
                        "title":"Hmtype",
                        "payload":"change_measurement"
                        }]
    }
    changing.htameintype = false;
  }else if (received_message.text == "hmfold" || received_message.text == "Hmfold") {
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
   changing.fold = true;
  }else if (received_message.text && changing.fold == true) {   
    userEnteredInfo.fold =  received_message.text;
    response = {
      "text": `Are you sure? If not click on key word to measure again.`,
      "quick_replies":[
                        {
                        "content_type":"text",
                        "title":"Sure",
                        "payload":"change_sure"
                        },{
                        "content_type":"text",
                        "title":"Hmfold",
                        "payload":"change_measurement"
                        }]
    }
    changing.fold = false;
  }else if (received_message.text == "Ankle" || received_message.text == "ankle") {
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
   changing.ankle = true;
  }else if (received_message.text && changing.ankle == true) {   
    userEnteredInfo.ankle =  received_message.text;
    response = {
      "text": `Are you sure? If not click on key word to measure again.`,
      "quick_replies":[
                        {
                        "content_type":"text",
                        "title":"Sure",
                        "payload":"change_sure"
                        },{
                        "content_type":"text",
                        "title":"Ankle",
                        "payload":"change_measurement"
                        }]
    }
    changing.ankle = false;
  }else if (received_message.text == "yptype" || received_message.text == "Yptype") {
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
   changing.yinphonetype = true;
  }else if (received_message.text && changing.yinphonetype == true) {   
    userEnteredInfo.yinphonetype =  received_message.text;
    response = {
      "text": `Are you sure? If not click on key word to measure again.`,
      "quick_replies":[
                        {
                        "content_type":"text",
                        "title":"Sure",
                        "payload":"change_sure"
                        },{
                        "content_type":"text",
                        "title":"Yptype",
                        "payload":"change_measurement"
                        }]
    }
    changing.yinphonetype = false;
  }else if (received_message.text == "sleevetype" || received_message.text == "Sleevetype") {
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
   changing.sleevetype = true;
  }else if (received_message.text && changing.sleevetype == true) {   
    userEnteredInfo.yinphonetype =  received_message.text;
    response = {
      "text": `Are you sure? If not click on key word to measure again.`,
      "quick_replies":[
                        {
                        "content_type":"text",
                        "title":"Sure",
                        "payload":"change_sure"
                        },{
                        "content_type":"text",
                        "title":"Sleevetype",
                        "payload":"change_measurement"
                        }]
    }
    changing.Sleevetype = false;
  }else if (received_message.text == "khar" || received_message.text == "Khar") {
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
   changing.khar = true;
  }else if (received_message.text && changing.khar == true) {   
    userEnteredInfo.khar =  received_message.text;
    response = {
      "text": `Are you sure? If not click on key word to measure again.`,
      "quick_replies":[
                        {
                        "content_type":"text",
                        "title":"Sure",
                        "payload":"change_sure"
                        },{
                        "content_type":"text",
                        "title":"Khar",
                        "payload":"change_measurement"
                        }]
    }
    changing.khar = false;
  }else if (received_message.text == "Sure") {    
    let response1 = {"text": "Ok... is there anything you want to change then type the key word that you want to change. :) "};
    let response2 = {"text" : " If there is nothing to change write 'Done' to view update record. :)"}
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2);
    });
  }else if (received_message.text == "done" || received_message.text == "Done" && htameinRC == true) {
    showHMrecord (sender_psid);
    htameinRC = false;
  }else if (received_message.text == "done" || received_message.text == "Done" && yinphoneRC == true) {
    showYPrecord (sender_psid);
    yinphoneRC = false;
  }else if (received_message.text == "done" || received_message.text == "Done" && bothRC == true) {
    showBOTHrecord (sender_psid);
    bothRC = false;
  }else if (received_message.text == "done" || received_message.text == "Done" && bothallRC == true) {
    showBOTHallrecord (sender_psid);
    bothallRC = false;
  }
/********************************************/
  else if (received_message.text == "Done") {    
    response = {"text": "kddddkkd"}
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
        break;
      case "htamein":
        htameinMeasuring(sender_psid);
        break;
      case "both_part":
        wholeMeasuring(sender_psid);
        break;
      case "customize_wh":
        customizewhole(sender_psid);
        break;
      case "notcustomize":
        showBOTHrecord(sender_psid);
        break;
        case "bothallRecord_no":
        bothallRecord_no(sender_psid);
        break;
        case "bothRecord_no":
        bothRecord_no(sender_psid);
        break;
        case "bothRecord_right":
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
      case "OCCASION_YP":
        asking_cus_design_YP(sender_psid);
        if (yinphoneprice == true) { userEnteredInfo.price = 10000;
          console.log ('priceSave');};
        break;
      case "CASUAL_YP":
        asking_cus_design_YP(sender_psid);
        if (yinphoneprice == true) { userEnteredInfo.price = 5000;
          console.log ('priceSave');};
        break;
      case "OCCASION_HM":
        showHMrecord(sender_psid);
        if (htameinprice == true) { userEnteredInfo.price = 10000;
          console.log ('priceSave');};
        break;
      case "CASUAL_HM":
        showHMrecord(sender_psid);
        if (htameinprice == true) { userEnteredInfo.price = 5000;
          console.log ('priceSave');};
        break;
      case "hmRecord_right":
        orderComfirmHM(sender_psid);
        break;
      case "hmRecord_no":
        hmRecord_no(sender_psid);
        break;
      case "order_comfirm_HM":
        saveData_HM(sender_psid);
        break;
        case "ypRecord_no":
        ypRecord_no(sender_psid);
        break;
      case "ypRecord_right":
        orderComfirmYP(sender_psid);
        break;
      case "order_comfirm_YP":
        saveData_YP(sender_psid);
        break;
      case "cancel_order":
        leaving(sender_psid);
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
     callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2).then(()=>{
        return callSend(sender_psid, response3);
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

const askforeventYP = (sender_psid) => {
  let response1 = {"text":"For what kind of event?"};
  let response2 = {"text":"These are the kinds of sewing we do in our shop for Yinphone."};
  let response3 = {
       "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"Occasion?",
            "image_url":"https://i.imgur.com/X5Xfu2Y.jpg",
            "subtitle":"💃 the price is around 10000",
            "default_action": {
              "type": "web_url",
              "url": "https://i.imgur.com/X5Xfu2Y.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"Occasion.",
                "payload":"OCCASION_YP"
              }              
            ]      
          },
          {
            "title":"Casual?",
            "image_url":"https://i.imgur.com/vt8aPXr.jpg",
            "subtitle":"🤷 The price is around 5000 ",
            "default_action": {
              "type": "web_url",
              "url": "https://i.imgur.com/vt8aPXr.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"Casual.",
                "payload":"CASUAL_YP"
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
  yinphoneprice = true;
}

const askforeventHM = (sender_psid) => {
  let response1 = {"text":"For what kind of event?"};
  let response2 = {"text":"These are the kinds of sewing we do in our shop for Htamein."};
  let response3 = {
       "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"Occasion?",
            "image_url":"https://i.imgur.com/X5Xfu2Y.jpg",
            "subtitle":"💃 the price is around 10000",
            "default_action": {
              "type": "web_url",
              "url": "https://i.imgur.com/X5Xfu2Y.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"Occasion.",
                "payload":"OCCASION_HM"
              }              
            ]      
          },
          {
            "title":"Casual?",
            "image_url":"https://i.imgur.com/vt8aPXr.jpg",
            "subtitle":"🤷 the price is around 5000",
            "default_action": {
              "type": "web_url",
              "url": "https://i.imgur.com/vt8aPXr.jpg",
              "webview_height_ratio": "tall",
            },
            "buttons":[
             {
                "type":"postback",
                "title":"Casual.",
                "payload":"CASUAL_HM"
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
  htameinprice = true;
}

const asking_cus_design_YP = (sender_psid) => {
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
                            "title":"Admin chocies"
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

const showHMrecord = (sender_psid) => {
  let response1 = {"text" : "Waist       :" + userEnteredInfo.waist};
  let response2 = {"text" : "Hips        :" + userEnteredInfo.hips};
  let response3 = {"text" : "Htamein long:" + userEnteredInfo.htameinlong};
  let response4 = {"text" : "Htamein Type:" + userEnteredInfo.htameintype};
  let response5 = {"text" : "Htamein Fold:" + userEnteredInfo.htameinfold};
  let response6 = {"text" : "Ankle       :" + userEnteredInfo.ankle};
  let response7 = {
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
                          "payload": "hmRecord_right",
                        },
                        {
                          "type": "postback",
                          "title": "No",
                          "payload": "hmRecord_no",
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
            return callSend(sender_psid, response5).then(()=>{
              return callSend(sender_psid, response6).then(()=>{
                return callSend(sender_psid, response7);
              });
            });
          });
        });
      });
    });
}

const hmRecord_no = (sender_psid) => {
  let response1 = {"text" : "Please type the key word that you want to change."};
    let response2 = { 
       "attachment":{
            "type":"image", 
            "payload":{
              "url":"https://i.imgur.com/XY0ktpT.png", 
              "is_reusable":true
            }
          }
         };
    
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2);
    });
    htameinRC = true;
}

const orderComfirmHM = (sender_psid) => {
 let response;
  response = {"attachment":{
                      "type":"template",
                      "payload":{
                        "template_type":"button",
                        "text":"If you don't want to order anymore you can cancel.",
                        "buttons":[
                          {
                            "type": "postback",
                            "title": "Order Comfirm",
                            "payload": "order_comfirm_HM",
                          },
                          {
                            "type": "postback",
                            "title": "Cancel.",
                            "payload": "cancel_order",
                          }
                        ]
                      }
                    } 
  }
  callSendAPI(sender_psid, response);
}

const showYPrecord = (sender_psid) => {
  let response1 = {"text" : "Chest        : " + userEnteredInfo.chest};
  let response2 = {"text" : "Upper arm    : " + userEnteredInfo.upperArm};
  let response3 = {"text" : "Sleeve length: " + userEnteredInfo.sleevelength};
  let response4 = {"text" : "Waist        : " + userEnteredInfo.waist};
  let response5 = {"text" : "Yinphone type: " + userEnteredInfo.yinphonetype};
  let response6 = {"text" : "Sleeve type  : " + userEnteredInfo.sleevetype};
  let response7 = {"text" : "Khar         : " + userEnteredInfo.khar};
  let response8 = {
                    "attachment":{
                            "type":"image", 
                            "payload":{
                              "url":userSendAttachment.designAttachment, 
                              "is_reusable":true
                            }
                          }
                  };
  let response9 = {
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
                          "payload": "ypRecord_right",
                        },
                        {
                          "type": "postback",
                          "title": "No",
                          "payload": "ypRecord_no",
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
            return callSend(sender_psid, response5).then(()=>{
              return callSend(sender_psid, response6).then(()=>{
                return callSend(sender_psid, response7).then(()=>{
                  return callSend(sender_psid, response8).then(()=>{
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

const ypRecord_no = (sender_psid) => {
  let response1 = {"text" : "Please type the key word that you want to change."};
    let response2 = { 
       "attachment":{
            "type":"image", 
            "payload":{
              "url":"https://i.imgur.com/u8RmemC.png", 
              "is_reusable":true
            }
          }
         };
    
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2);
    });
    yinphoneRC = true;
}

const orderComfirmYP = (sender_psid) => {
 let response;
  response = {"attachment":{
                      "type":"template",
                      "payload":{
                        "template_type":"button",
                        "text":"If you don't want to order anymore you can cancel.",
                        "buttons":[
                          {
                            "type": "postback",
                            "title": "Order Comfirm",
                            "payload": "order_comfirm_YP",
                          },
                          {
                            "type": "postback",
                            "title": "cancel.",
                            "payload": "cancel_order",
                          }
                        ]
                      }
                    } 
  }
  callSendAPI(sender_psid, response);
}

const showBOTHrecord = (sender_psid) => {
  let response1 = {"text" : "Chest        : " + userEnteredInfo.chest};
  let response2 = {"text" : "Upper arm    : " + userEnteredInfo.upperArm};
  let response3 = {"text" : "Sleeve length: " + userEnteredInfo.sleevelength};
  let response4 = {"text" : "Waist        : " + userEnteredInfo.waist};
  let response5 = {"text" : "Waist       :" + userEnteredInfo.waist};
  let response6 = {"text" : "Hips        :" + userEnteredInfo.hips};
  let response7 = {"text" : "Htamein long:" + userEnteredInfo.htameinlong};
  let response8 = {
                    "attachment":{
                            "type":"image", 
                            "payload":{
                              "url":userSendAttachment.designAttachment, 
                              "is_reusable":true
                            }
                          }
                  };
  let response9 = {
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
                          "payload": "bothRecord_right",
                        },
                        {
                          "type": "postback",
                          "title": "No",
                          "payload": "bothRecord_no",
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
            return callSend(sender_psid, response5).then(()=>{
              return callSend(sender_psid, response6).then(()=>{
                return callSend(sender_psid, response7).then(()=>{
                  return callSend(sender_psid, response8).then(()=>{
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

const bothRecord_no = (sender_psid) => {
  let response1 = {"text" : "Please type the key word that you want to change."};
    let response2 = { 
       "attachment":{
            "type":"image", 
            "payload":{
              "url":"https://i.imgur.com/tvGYR4M.png", 
              "is_reusable":true
            }
          }
         };
    
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2);
    });
    bothRC = true;
}

const showBOTHallrecord = (sender_psid) => {
  let response1 = {"text" : "Chest        : " + userEnteredInfo.chest};
  let response2 = {"text" : "Upper arm    : " + userEnteredInfo.upperArm};
  let response3 = {"text" : "Sleeve length: " + userEnteredInfo.sleevelength};
  let response4 = {"text" : "Waist        : " + userEnteredInfo.waist};
  let response5 = {"text" : "Waist       :" + userEnteredInfo.waist};
  let response6 = {"text" : "Hips        :" + userEnteredInfo.hips};
  let response7 = {"text" : "Htamein long:" + userEnteredInfo.htameinlong};
  let response8 = {"text" : "Htamein Type:" + userEnteredInfo.htameintype};
  let response9 = {"text" : "Htamein Fold:" + userEnteredInfo.htameinfold};
  let response10 = {"text" : "Ankle       :" + userEnteredInfo.ankle};
  let response11= {"text" : "Yinphone type: " + userEnteredInfo.yinphonetype};
  let response12= {"text" : "Sleeve type  : " + userEnteredInfo.sleevetype};
  let response13= {"text" : "Khar         : " + userEnteredInfo.khar};
  let response14= {
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
                          "payload": "bothRecord_right",
                        },
                        {
                          "type": "postback",
                          "title": "No",
                          "payload": "bothallRecord_no",
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
            return callSend(sender_psid, response5).then(()=>{
              return callSend(sender_psid, response6).then(()=>{
                return callSend(sender_psid, response7).then(()=>{
                  return callSend(sender_psid, response8).then(()=>{
                    return callSend(sender_psid, response9).then(()=>{
                      return callSend(sender_psid, response10).then(()=>{
                        return callSend(sender_psid, response11).then(()=>{
                          return callSend(sender_psid, response12).then(()=>{
                            return callSend(sender_psid, response13).then(()=>{
                              return callSend(sender_psid, response14);
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

const bothallRecord_no = (sender_psid) => {
  let response1 = {"text" : "Please type the key word that you want to change."};
    let response2 = { 
       "attachment":{
            "type":"image", 
            "payload":{
              "url":"https://i.imgur.com/tvGYR4M.png", 
              "is_reusable":true
            }
          }
         };
         let response3 = { 
           "attachment":{
                "type":"image", 
                "payload":{
                  "url":"https://i.imgur.com/A2ReVY6.png", 
                  "is_reusable":true
                }
              }
             };
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2).then(()=>{
        return callSend(sender_psid, response3);
      });
    });
    bothallRC = true;
}

const yesorder = (sender_psid) => {   
   let response1 = {"text" : "You can transfer money from this..."};
    let response2 = {"text" : "Cb bank acc : 1623 1237 5464 423"};
     let response3 = {"text" : "Transfer to this ph no 0912345678 via Wave"}
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2).then(()=>{
        return callSend(sender_psid, response3);
      });
    });
    userInfo.htameintype = true;
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

const saveData_SP = (sender_psid) => {
  const share_info = {
    id : sender_psid,
    customer_caption : userEnteredInfo.cuscaption,
    share_design : userSendAttachment.sharepicAttachment,
  }
  db.collection('share_information').add(share_info);
}

const saveData_HM = (sender_psid) => {
  const hm_info = {
    id : sender_psid,
    Waist : userEnteredInfo.waist,
    Hips : userEnteredInfo.hips,
    Htamein_long : userEnteredInfo.htameinlong,
    Htamein_type : userEnteredInfo.htameintype,
    Htamein_fold : userEnteredInfo.htameinfold,
    Ankle : userEnteredInfo.ankle,
    Price : userEnteredInfo.price,
  }
  db.collection('Htamein_order').add(hm_info);
}

const saveData_YP = (sender_psid) => {
  const yp_info = {
    id : sender_psid,
    Chest : userEnteredInfo.chest,
    upperArm : userEnteredInfo.upperArm,
    sleevelength : userEnteredInfo.sleevelength,
    Waist : userEnteredInfo.waist,
    Yinphone_type : userEnteredInfo.yinphonetype,
    sleevetype : userEnteredInfo.sleevetype,
    khar : userEnteredInfo.khar,
    Design : userSendAttachment. designAttachment,
    Price : userEnteredInfo.price,
  }
  db.collection('Yinphone_order').add(yp_info);
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