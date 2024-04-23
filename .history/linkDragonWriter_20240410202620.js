const { Agent } = require('./AddressableAgent.js');
const axios = require('axios');

// Creating instance of LinkDragonWriter and starting to listen for messages

const password = 'hi'; //amend to password from users.json
const chatroom = 'general'; //is there a more general chatroom? can we listen to all chatrooms?
const socketUrl = 'https://chat.themultiverse.school:3535/';

const agent = new LinkDragonWriter(agentName, password, chatroom, socketUrl);
    agentName = 'LinkDragonAgent';
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
    
        if (links) {
            for (const link of links) {
                // Check if the link is embeddable
                const isEmbeddable = await this.isLinkEmbeddable(link);
    
                if (isEmbeddable) {
                    // Send the link and tags to LinkDragonScribe for scraping, parsing, and storing
                    this.sendLinkToScribe(link, username, timestamp);
                }
            }
        }
    }
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

