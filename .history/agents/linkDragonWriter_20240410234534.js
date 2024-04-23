const { Agent } = require('./AddressableAgent.js');
const axios = require('axios');
const LinkDragonScribe = require('./linkDragonScribe.js');
const OpenAI = require('openai');
require('dotenv').config();

let agent = new Agent("LinkDragonAgent", "hi");
agent.connect();
agent.login();


    async handleMessage(msg) {
        // Extract the username and the rest of the message
        const username = msg.split(" ")[0];
        const link = msg.substring(username.length + 1);

        const linkRegex = /(https?:\/\/[^\s]+)/g;
        const links = link.match(linkRegex);

        const linkData = {
            link,
            username,
            timestamp: new Date().toISOString(),
        };
    }

    // async isLinkEmbeddable(url) {
    //     try {
    //         const response = await axios.head(url, { timeout: 5000 });
    //         const contentType = response.headers['content-type'];
    //         return contentType && contentType.includes('text/html');
    //     } catch (error) {
    //         console.error(error);
    //         return false;
    //     }
    // }

    async sendLinkToScribe(linkData) {
        try {
            await LinkDragonScribe.handleReceivedLink(linkData);
        } catch (err) {
            console.error('Error sending link to scribe:', err);
            throw err;
        }
    }
}