const { io } = require("socket.io-client");
const { OpenAI } = require("openai");


console.log("AddressableAgent.js")

class Agent {
    constructor(agentName, password, chatroom="general", socketUrl="https://chat.themultiverse.school:3535") {
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
        this.socket.emit(channel, this.agentName + ": " + message);
    }
}

module.exports = { Agent }

