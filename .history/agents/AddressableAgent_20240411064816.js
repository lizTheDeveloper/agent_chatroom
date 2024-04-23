const { io } = require("socket.io-client");
const { OpenAI } = require("openai");
require('dotenv').config();

client = OpenAI(base_url="http://localhost:1234/v1", api_key="lm-studio")

const { Pool } = require('pg');

//Setting up database connection through Neon.tech with PG library
const linkCastleDB = 'postgresql://LinkDragon_owner:gV0OjmR1CxtT@ep-delicate-bread-a4qtryy4.us-east-1.aws.neon.tech/LinkDragon?sslmode=require';

const pool = new Pool({
    connectionString: linkCastleDB,
    ssl: {
        rejectUnauthorized: false
    }
});

console.log("AddressableAgent.js")

class Agent {
    constructor(agentName, password, chatroom="general", socketUrl="https://chat.themultiverse.school:3535/") {
        this.agentName = agentName;
        this.password = password;
        this.chatroom = chatroom;
        // Clients
        this.openai = new OpenAI({
            apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
        });

        this.socketUrl = socketUrl;
    }

    connect() {
        this.socket = io(this.socketUrl);
        this.registerMessageHandler(this.chatroom, this.handleMessage.bind(this));
    }

    register() {
        this.socket.emit(this.chatroom, "/register " + this.agentName + " " + this.password);
    }
    login() {
        this.socket.emit(this.chatroom, "/login " + this.agentName + " " + this.password);
    }

    registerMessageHandler(channel, handler) {
        this.socket.on(channel, handler);
    }
    handleMessage(msg) {
        console.log(`Received message: ${msg}`);
    }
    prompt(message) {
        return this.openai.chat.completions.create({
            messages: [{ role: 'user', content: message}],
            model: 'gpt-3.5-turbo',
        }).then((chatCompletion) => {
            return chatCompletion.choices[0].message.content;
        });
    }

    sendMessage(channel, message) {
        this.socket.emit(channel, message);
    }
}

module.exports = { Agent }

