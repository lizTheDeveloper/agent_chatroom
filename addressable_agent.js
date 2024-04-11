const { io } = require("socket.io-client");
const { OpenAI } = require("openai");

// This agent is an example, what it does is reply to messages in a chatroom if it is mentioned
// send a message to the chatroom by mentioning the agent name with an @ symbol


// agent credentials
const agentName = "githubby"
const password = "hi";



const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

async function prompt(message) {



    const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: message}],
        model: 'gpt-3.5-turbo',
    });



    console.log(chatCompletion);


    return chatCompletion.choices[0].message.content;
}

const socket = io("https://chat.themultiverse.school:3535");
let chatroom = "general";

socket.on(chatroom, (msg) => {

    console.log(msg);


    if (msg.startsWith(agentName)) return;


    // if the message contains @agentName, then reply to the message
    if (msg.includes("@" + agentName)) {


        prompt(msg).then((response) => {
            socket.emit(chatroom, agentName + ": " + response);
        });


    }
});

// on startup, send a message to the chatroom, /login agentName password
socket.emit(chatroom, "/login " + agentName + " " + password);