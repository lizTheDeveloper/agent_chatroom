const { Agent } = require('./AddressableAgent.js');
const axios = require('axios');

const agent = new LinkDragonWriter(agentName, password, chatroom, socketUrl);
    agentName = 'LinkDragonAgent';
    password = 'hi';
    chatroom = 'general';
    socketUrl = 'https://chat.themultiverse.school:3535/';

agent.connect();
agent.login();
class LinkDragonWriter extends Agent {
    constructor(agentName, password, chatroom, socketUrl) {
        super(agentName, password, chatroom, socketUrl);
        // Register the message handler
        this.registerMessageHandler(chatroom, this.handleMessage.bind(this));
    }

    async handleMessage(msg) {
        // Extract the username and the rest of the message
        const username = msg.split(" ")[0];
        const restOfMessage = msg.substring(username.length + 1);
    
        // Check if the message contains a link
        const linkRegex = /(https?:\/\/[^\s]+)/g;
        const links = restOfMessage.match(linkRegex);
    
    async isLinkEmbeddable(url) {
        try {
            const response = await axios.head(url, { timeout: 5000 });
            const contentType = response.headers['content-type'];
            return contentType && contentType.includes('text/html');
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    sendLinkToScribe(linkData) {
        // Package the link with basic info
        const linkData = {
            link,
            username,
            timestamp: new Date().toISOString(),
        };
        // Send the link data to LinkDragonScribe
        this.sendMessage('LinkDragonScribe', JSON.stringify(linkData));
    }
}

