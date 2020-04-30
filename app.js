
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
        if (webhook_event.message.quick_reply) {
          handleQuickReply(sender_psid, webhook_event.message.quick_reply.payload);
        } else {
          handleMessage(sender_psid, webhook_event.message);
        }
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
//eg https://newhope-grocery-store.herokuapp.com/whitelists
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
let sharepicAttachment = false;

let userEnteredInfo = {};
let userSendAttachment = {};

function handleMessage(sender_psid, received_message) {
  let response;
  if (received_message.text == "hi" || received_message.text == "Hi") {    
   greeting (sender_psid);
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
            "title": "Is tis one? very nice.",
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
      case "SEW":
        askFabric(sender_psid);
        break;
        case "share_pic":
        sharePicture(sender_psid);
        break;
      default:
        defaultReply(sender_psid);
    }
}

/*function to greet user*/
async function greeting (sender_psid){  
  let user = await getUserProfile(sender_psid);
  let response1 = {"text": "🙋‍♀ Hi. "+user.first_name+" "+user.last_name+". Warmly welcome to Shwe Hsu.🙆‍♀"};
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
                      "payload": "share_pic",
                    },
                    {
                      "type": "web_url",
                      "title": "Pictures of others",
                      "url": "https://qph.fs.quoracdn.net/main-qimg-9e8cb835ef77635c3233c1ee716728db.webp",
                      "webview_height_ratio": "tall",
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

const askFabric = (sender_psid) => {
  let response;
  response = {"attachment":{
                      "type":"template",
                      "payload":{
                        "template_type":"button",
                        "text":"Is your piece of fabric in our shop? or buy some fabric from us? or delivery?",
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
                          },
                          {
                            "type":"postback",
                            "payload":"showingFabric",
                            "title":"Show me some fabric. "
                          },
                        ]
                      }
                    } 
  }
  callSendAPI(sender_psid, response);
}

const sharePicture = (sender_psid) => {
  let response;
  response = {"text": "Let's take a look at the most beautiful images of you with wearing the cloth sewn by Shwe Hsu."}
    sharepicAttachment = true;
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

    const order_info = {
    id : sender_psid,
    name : userEnteredInfo.name,
    price : userEnteredInfo.price,
    cloth_design : userSendAttachment.designAttachment,
  }
  db.collection('order_information').add(order_info);
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