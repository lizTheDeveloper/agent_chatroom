const { io } = require("socket.io-client");
const { OpenAI } = require("openai");
const fs = require('fs');

// This agent is an example, what it does is reply to messages in a chatroom if it is mentioned
// send a message to the chatroom by mentioning the agent name with an @ symbol


// generate a random agent name
const agentName = "summaryagent"
const password = "summary";

const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

async function prompt(message) {
    let config = {
        messages: [
            { role: 'system', content: 'You are a summary agent, tasked with summarizing all the links from the chat room, and any notable conversations, so users can stay up to date with their favorite noisy channels without feeling like they\'re missing out. Please return all links, and a summary of what the links contain as best as you can infer from the chat, and also a summary of any cool discussions.'},
            { role: 'user', content: JSON.stringify(message)}
        ],
        model: 'gpt-3.5-turbo',
    }
    console.log(config);
    const chatCompletion = await openai.chat.completions.create(config);
    console.log(chatCompletion);
    return chatCompletion.choices[0].message.content;
}

const socket = io("https://2d16-2601-1c2-100-ded-ec92-1715-35a0-a586.ngrok-free.app/");
let chatroom = "general";


function handleMessage(msg) {

        console.log(msg);
        if (msg.startsWith(agentName)) return;
        // if the message contains @agentName, then reply to the message
        if (msg.includes("@" + agentName)) {
            // if the user is asking the agent to join a room, then join the room, should be @summaryagent join <roomname>
            if (msg.includes(" join ")) {
                const room = msg.split(" join ")[1];
                joinRoom(room);
                console.log("joining room: " + room);
                return;
            }
            // open rooms.json and read the history of the room you are in
            fs.readFile('rooms.json', 'utf8', (err, data) => {
                if (err) {
                    console.error(err)
                    return
                }
                const rooms = JSON.parse(data)
                const room = rooms[chatroom]
                // send the history to the prompt function
                prompt(room.messages).then((response) => {
                    // send the response to the chatroom
                    socket.emit(chatroom, agentName + ": " + response);
                });
            });
        }
    
}

socket.on(chatroom, handleMessage);

// on startup, send a message to the chatroom, /login agentName password
socket.emit(chatroom, "/login " + agentName + " " + password);

function joinRoom(room) {
    chatroom = room;
    // command is /join <roomname>
    socket.emit(chatroom, "/join " + room);
    socket.on(chatroom, handleMessage);
}