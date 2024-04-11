/* 
    File Author: Sarah Cohen - scohen40 
    Description: This agent replies to messages in a chatroom if it is mentioned with an @ symbol and sends a self-care reminder at a set interval
*/ 
require("dotenv").config();

const { io } = require("socket.io-client");
const { OpenAI } = require("openai");

// agent credentials
const agentName = "watahboi"
const password = "watahboi";

const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

async function prompt(message) {

    const chatCompletion = await openai.chat.completions.create({
        messages: [
            { role: 'system', content: 'You are a self-care  reminder chatbot agent. At scheduled times you remind the chaos monsters of the multiverse to stretch, drink water, take their meds, and eat food. You can also respond to messages that mention you, but only with puns or jokes about the specific message and self-care.'},
            { role: 'user', content: message}
        ],
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
        // Use the OpenAI API to generate a response (optional)
        prompt(msg).then((response) => {
            socket.emit(chatroom, ": " + response);
        });
    }
});

// on startup, send a message to the chatroom, /login agentName password
socket.emit(chatroom, "/login " + agentName + " " + password);

// Schedule the reminder to be sent every hour
setInterval(() => {
    // Use the OpenAI API to generate a self-care reminder message
    prompt('Generate a self-care reminder to remind the chaos monsters of the multiverse to stretch, drink water, eat and take their meds. Formulate the reminder with content relevant to the general time of day. Include a joke and/or pun relating to the message, watahboi and chaos monsters.').then((response) => {
        socket.emit(chatroom, ": " + response);
    });
}, 300000); // 30000ms = 30 seconds, 60000ms = 1 minute, 300000ms = 5 minutes,  3600000ms = 1 hour,