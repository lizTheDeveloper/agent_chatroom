const { io } = require("socket.io-client");
const { OpenAI } = require("openai");

const {google} = require('googleapis');
const fs = require('fs');
const readline = require('readline');

const SCOPES = ['https://www.googleapis.com/auth/tasks'];
const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = './credentials.json'; // Path to your downloaded credentials file


// This agent will create a task in your Google Tasks list when it is mentioned in a chatroom
// send a message to the chatroom by mentioning the agent name with an @ symbol



const agentName = "taskbot"
const password = "supersecret";

const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

async function prompt(message) {
    const chatCompletion = await openai.chat.completions.create({
        messages: [
            { role: 'system', content: 'You are a taskbot, you can create tasks by responding to create a task with a title and notes. Respond in the following format, as your responses will be parsed by a script:\n{"taskTitle":"the title of the task", "notes": "description of the task"}'},
            { role: 'user', content: message}
        ],
        model: 'gpt-3.5-turbo',
    });
    console.log(chatCompletion);
    return chatCompletion.choices[0].message.content;
}

const socket = io("https://2d16-2601-1c2-100-ded-ec92-1715-35a0-a586.ngrok-free.app/");
let chatroom = "general";

socket.on(chatroom, (msg) => {
    console.log(msg);

    // Check if the message is intended to create a task
    if (msg.includes("@" + agentName)) {
        // Use the OpenAI API to generate a response (optional)
        prompt(msg).then((response) => {

            socket.emit(chatroom, agentName + ": " + response); // Send a confirmation message back to the chatroom
            const { taskTitle, notes } = JSON.parse(response); // Parse the task details from the message

            // Authenticate and create the task
            fs.readFile(CREDENTIALS_PATH, (err, content) => {
                if (err) return console.log('Error loading client secret file:', err);
                authorize(JSON.parse(content), (auth) => {
                    createTask(auth, taskTitle, notes || ""); // Call createTask with the extracted title and optional notes
                });
            });
        });
    }
    
});

// on startup, send a message to the chatroom, /login agentName password
socket.emit(chatroom, "/login " + agentName + " " + password);


// Load client secrets from a local file.
fs.readFile(CREDENTIALS_PATH, (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    authorize(JSON.parse(content), (auth) => {
        console.log('Authorized');
    });
  });
  
  function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getAccessToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }
// this will run on first setup. You will need to visit the URL, then save the code that you get back, then paste it in the terminal  
function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
  }
  
function createTask(auth, title, notes) {
    let taskList = 'SV91Nlh4VnNGa21BRXp2Yw';
    const service = google.tasks({version: 'v1', auth});
    try {
        response = service.tasklists.list({
        'maxResults': 10,
        }).then(response => {
            taskList = response.data.items[0].id;
            const task = { title, notes };
            console.log(task)
            service.tasks.insert({
                tasklist: taskList,
                resource: task,
            }, (err, res) => {
                console.log(res)
                if (err) return console.error('The API returned an error: ' + err);
                console.log('Task created:', res.data);
            });
        });
    } catch (err) {
        console.error('The API returned an error: ' + err);
        return;
    }
    
}