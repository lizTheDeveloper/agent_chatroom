
const axios = require('axios');
const LinkDragonScribe = require('./linkDragonScribe');

const agentName = 'LinkDragonAgent';
const password = 'hi';
const chatroom = 'general';
const socketUrl = 'https://chat.themultiverse.school:3535/';
const agent = new LinkDragonAgent(agentName, password, chatroom, socketUrl);
OpenAI({ apiKey })

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
                const isEmbeddable = await isLinkEmbeddable(link);

                if (isEmbeddable) {
                    const linkData = {
                        link,
                        username,
                        timestamp: new Date().toISOString(),
                    };
                    await sendLinkToScribe(linkData);
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

    async  sendLinkToScribe(linkData) {
        try {
            await LinkDragonScribe.handleReceivedLink(linkData);
        } catch (err) {
            console.error('Error sending link to scribe:', err);
            throw err;
        }
    }