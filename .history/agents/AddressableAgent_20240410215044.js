const { io } = require("socket.io-client");
const { OpenAI } = require("openai");
require('dotenv').config();

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
        gene@genes-MBP agents % node linkDragonWriter.js
AddressableAgent.js
/Users/gene/agent_chatroom/agents/linkDragonWriter.js:63
this.registerMessageHandler(this.chatroom, this.handleMessage.bind(this));
                                                              ^

TypeError: Cannot read properties of undefined (reading 'bind')
    at Object.<anonymous> (/Users/gene/agent_chatroom/agents/linkDragonWriter.js:63:63)
    at Module._compile (node:internal/modules/cjs/loader:1368:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1426:10)
    at Module.load (node:internal/modules/cjs/loader:1205:32)
    at Module._load (node:internal/modules/cjs/loader:1021:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:142:12)
    at node:internal/main/run_main_module:28:49

    }

    register() {
        this.socket.emit(this.chatroom, "/register " + this.agentName + " " + this.password);
    }
    login() {
        this.socket.emit(this.chatroom, "/login " + this.agentName + " " + this.password);
    }

    registerMessageHandler(channel, handler) {
        this.socket.on(channel, handler.bind(this));
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

