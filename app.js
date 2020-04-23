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

app.set('view engine', 'ejs');
app.set('views', __dirname+'/views');

//firebase initialize
firebase.initializeApp({
  credential: firebase.credential.cert({
    "private_key": process.env.Firebase_privatekey.replace(/\\n/g, '\n'),
    "client_email": process.env.Firebase_clientemail,
    "project_id": process.env.Firebase_projectID,
  }),
  databaseURL: "https://sandarbot.firebaseio.com"
 });

var db = firebase.database();
var addNewTask = false;








var itemsRef = db.ref("restricted_access/secret_document/items");
//var usersRef = db.ref("restricted_access/secret_document/users");



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
     // console.log(webhook_event);

      // Get the sender PSID
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

//webview test
app.get('/webview2/:sender_id',function(req,res){
    const sender_id = req.params.sender_id;
    res.render('webview2.ejs',{sender_id:sender_id});
});

app.get('/webview/:sender_id',function(req,res){
    const sender_id = req.params.sender_id;
    res.render('webview.ejs',{sender_id:sender_id});
});

//Set up Get Started Button. To run one time
app.get('/setgsbutton',function(req,res){
    setupGetStartedButton(res);    
});

//Set up Persistent Menu. To run one time
app.get('/setpersistentmenu',function(req,res){
    setupPersistentMenu(res);    
});

//Remove Get Started and Persistent Menu. To run one time
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
      //console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});

/**********************************************
Function to Handle when user send text message
***********************************************/

function handleMessage(sender_psid, received_message) {
  //let message;
  let response;
  
  
  if(received_message.text && addNewTask){    
    saveTask(sender_psid, received_message);     
  } else if(received_message.attachments){
    let attachment_url = received_message.attachments[0].payload.url;
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is this the right picture?",
            "subtitle": "Tap a button to answer.",
            "image_url": attachment_url,
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes-attachment",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no-attachment",
              }
            ],
          }]
        }
      }
    }
    callSend(sender_psid, response);
  } else {
      let user_message = received_message.text.toLowerCase();
      switch(user_message) {
        case "hello":
        case "hi":
            greetUser(sender_psid);
          break;
        case "webview":
            webviewTest(sender_psid);
          break;
        


        case "who am i":
            whoami(sender_psid);
          break;
        case "add":
        case "new":
            addTask(sender_psid);            
          break;
        case "view":
            viewTasks(sender_psid);
          break;
        case "attachment":
          response = {"text": `You sent the message: "${received_message.text}". Now send me an attachment!`};
          callSend(sender_psid, response);
          break;
        default:
            unknownCommand(sender_psid);
        }
    }

}

/*********************************************
Function to handle when user click button
**********************************************/

function handlePostback(sender_psid, received_postback) {
  
  let response;
  // Get the payload for the postback
  let payload = received_postback.payload;
  let n = payload.indexOf("delete:");
  if(n < 0){
      if (payload === 'yes-attachment') {
        response = { "text": "Thanks!" }
        callSend(sender_psid, response);
      } else if (payload === 'no-attachment') {
        response = { "text": "Oops, try sending another image." }
        callSend(sender_psid, response);
      } else if(payload === "get_started" ){
        whoami(sender_psid);
      } 
      else if(payload === "yes-i-am" ){
        greetUser(sender_psid);   
      }
      else if(payload === "no-i-am-not" ){
        response = { "text": "Oops, You are not you" }
        callSend(sender_psid, response);
      }else if(payload === "view-tasks"){
        viewTasks(sender_psid);
      }else if(payload === "add-task"){
          addTask(sender_psid);
          console.log("new task flag 3 ",addNewTask);
      }else if(payload === "cancel" ){
        addNewTask = false;
        response = { "text": "Your action has been cancelled" }
        callSend(sender_psid, response);
      } 
  }else if(n => 0){
    let taskId = payload.slice(7);
    deleteTask(sender_psid, taskId);
  }
 
}


function webviewTest(sender_psid){
  let response;
  response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Click to open webview?",                       
            "buttons": [
              {
                "type": "web_url",
                "title": "webview 2",
                "url":"https://ayethatarbot.herokuapp.com/webview2/"+sender_psid              
              },
              {
                "type": "web_url",
                "title": "webview",
                "url":"https://ayethatarbot.herokuapp.com/webview/"+sender_psid              
              },
              
            ],
          }]
        }
      }
    }
  callSendAPI(sender_psid, response);

}

function viewTasks(sender_psid){
  let response;
  
    itemsRef.once("value", function(snapshot){           
        
                   
            var arr = [];
            snapshot.forEach(function(data) {
                var obj = {}
                obj._id  = data.key ;
                obj.details = data.val().details;                
                obj.subtitle = data.val().details;

               
                obj.title = data.val().details;
                obj.image_url= "https://store-images.s-microsoft.com/image/apps.49795.13510798887304077.4ce9da47-503d-4e6e-9fb3-2e78a99788db.b6188938-8471-4170-83b8-7fc4d9d8af6a?mode=scale&q=90&h=270&w=270&background=%230078D7";
                obj.buttons = [{"type":"postback", "title":"DELETE", "payload":"delete:"+data.key}];
                
                

                arr.push(obj);
                
            }); 

            
            let tasks  = [];

            if(arr.length > 0){
              for(let i=0; i < arr.length; i++){
                tasks.push(arr[i]);
              } 
            }else{
              response = {
                "text": `You do not have any task.`
              };       
              callSend(sender_psid, response);  
            }

           
                     

            response = {
              "attachment": {
                "type": "template",
                "payload": {
                  "template_type": "generic",
                  "image_aspect_ratio": "square",
                  "elements": arr
                }
              }
            }

            callSend(sender_psid, response);
          
      
  });


  
}


function deleteTask(sender_psid, taskId){          
  let itemRemove = itemsRef.child(taskId);          
  itemRemove.remove();
  notifyDelete(sender_psid);
}

function notifyDelete(sender_psid){
  let response = {
      "text": `Task has been deleted`
    };    
    callSend(sender_psid, response).then(()=>{
      viewTasks(sender_psid);
    });
}

function addTask(sender_psid){
  let response;
  let numTasks;


  let documentRef = db.ref("restricted_access/secret_document");

  documentRef.once("value", function(snapshot){
      if (snapshot.hasChild('items')) {

          itemsRef.once("value", function(snapshot){ 
          numTasks = Object.keys(snapshot.val()).length;
          if (numTasks > 5){
            response = {
              "text": `You already have 6/6 task. Complete them first`
            };
            addNewTask = false; 
            callSend(sender_psid, response);  
          }else{
            response = {
              "text": `Enter new task`
            };
            addNewTask = true;    
            callSend(sender_psid, response);  
          }
        });



      }else{
          response = {
            "text": `Enter new task`
          };
          addNewTask = true;    
        callSend(sender_psid, response);  
      }

  });

  

  
  
  
  
}

function saveTask(sender_psid, received_message){
  addNewTask = false;  
  let task = {"details":received_message.text};           
  let newItemRef = itemsRef.push(task);          
  let taskId = newItemRef.key;
  let response = { "text": `Great! You have added new task` }
  callSend(sender_psid, response).then(()=>{
    viewTasks(sender_psid);
  });
}

function unknownCommand(sender_psid){
  let response1 = {"text": "I do not quite understand your command"};
  let response2 = {"text": "To view tasks, type 'view'"};
  let response3 = {"text": "To add new task, type 'new'"};   
  let response4 = {"text": "If you forget who you are, type 'who am i'"};
    callSend(sender_psid, response1).then(()=>{
      return callSend(sender_psid, response2).then(()=>{
        return callSend(sender_psid, response3).then(()=>{
          return callSend(sender_psid, response4);
        });
      });
  });  
}


function callSendAPI(sender_psid, response) {  
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
  let send = await callSendAPI(sender_psid, response);
  return 1;
}



function getUserProfile(sender_psid) {
  return new Promise(resolve => {
    request({
      "uri": "https://graph.facebook.com/"+sender_psid+"?fields=first_name,last_name,profile_pic&access_token=EAAGmSf4ySjMBACxNfZAdxEzIPZCT6lyZAyXZCKHmM2DnRO87hH3s5rRaofImCtfTLp3198fMrntu0K5kZBa0WGbcYx4RC4CUNRRku1U3GFvsBO5ZCllHGA6FaWMeL5ZALdph3omIDBanwAW27JTM5zFYslhbqVerzPn7lglQ4vO5r26P4gvIzBb",
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

async function whoami(sender_psid){  
  let user = await getUserProfile(sender_psid);   
  let response;
  response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is this you?",
            "subtitle": "Tap a button to answer.",
            "image_url": user.profile_pic,
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes-i-am",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no-i-am-not",
              }
            ],
          }]
        }
      }
    }
  callSend(sender_psid, response);
}

/***********************
FUNCTION TO GREET USER 
************************/
async function greetUser(sender_psid){  
  let user = await getUserProfile(sender_psid);   
  let response;
  response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": "Hello. "+user.first_name+" "+user.last_name+". It's so nice to meet you.What do you want to do next?",
          "buttons": [
              {
                "type": "postback",
                "title": "View Tasks",
                "payload": "view-tasks",
              },
              {
                "type": "postback",
                "title": "Add Task!",
                "payload": "add-task",
              }
            ]
        }
      }
    }
  callSendAPI(sender_psid, response);
}


/*************************************
FUNCTION TO SET UP GET STARTED BUTTON
**************************************/

function setupGetStartedButton(res){
  let messageData = {"get_started":{"payload":"get_started"}};

  request({
      url: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token='+ PAGE_ACCESS_TOKEN,
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      form: messageData
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {        
        res.send(body);
      } else { 
        // TODO: Handle errors
        res.send(body);
      }
  });
} 

/**********************************
FUNCTION TO SET UP PERSISTENT MENU
***********************************/

function setupPersistentMenu(res){
  var messageData = { 
      "persistent_menu":[
          {
            "locale":"default",
            "composer_input_disabled":false,
            "call_to_actions":[
                {
                  "type":"postback",
                  "title":"View My Tasks",
                  "payload":"view-tasks"
                },
                {
                  "type":"postback",
                  "title":"Add New Task",
                  "payload":"add-task"
                },
                {
                  "type":"postback",
                  "title":"Cancel",
                  "payload":"cancel"
                }
          ]
      },
      {
        "locale":"zh_CN",
        "composer_input_disabled":false
      }
    ]          
  };
        
  request({
      url: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token='+ PAGE_ACCESS_TOKEN,
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
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

/***********************
FUNCTION TO REMOVE MENU
************************/

function removePersistentMenu(res){
  var messageData = {
          "fields": [
             "persistent_menu" ,
             "get_started"                 
          ]               
  };  
  request({
      url: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token='+ PAGE_ACCESS_TOKEN,
      method: 'DELETE',
      headers: {'Content-Type': 'application/json'},
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