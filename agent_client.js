const { io } = require("socket.io-client");
const { OpenAI } = require("openai");

// generate a random agent name
const agentName = "Agent" + Math.floor(Math.random() * 1000);

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

const socket = io("https://dcad-2601-1c2-100-ded-698b-f12-9dc3-69a0.ngrok-free.app/");
let chatroom = "general";

socket.on(chatroom, (msg) => {
    console.log(msg);
    if (msg.startsWith(agentName)) return;
    prompt(msg).then((response) => {
        socket.emit(chatroom, agentName + ": " + response);
    });
});