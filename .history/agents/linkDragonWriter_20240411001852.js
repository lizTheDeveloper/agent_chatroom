const { Agent } = require('./AddressableAgent.js');
const axios = require('axios');
const LinkDragonScribe = require('./linkDragonScribe.js');
const OpenAI = require('openai');

require('dotenv').config();

let agent = new Agent("LinkDragonAgent", "hi");
agent.connect();
agent.login();

const linkData = {
    link,
    username,
    timestamp: new Date().toISOString(),
};

function sendMessageToChat(message) {
    console.log(`Message to chat: ${message}`);
    agent.sendMessage("general", message);
}

agent.registerMessageHandler("general", function (msg) {
    // Extract the username and the rest of the message
    console.log(msg);
    const username = msg.split(" ")[0];
    const url = msg.substring(username.length + 1);
    // Check if the message contains a link
    if (isLinkMessage(msg)) {
        // Handle the link message
        handleLinkMessage(linkData);
    }
});
async function handleLinkMessage(linkData) {
    try {
        // Check if the link is embeddable
        const isEmbeddable = await isLinkEmbeddable(linkData.link);
        if (isEmbeddable = True) {
            // Send the link to the scribe
            sendLinkToScribe(linkData);
        } else {
            console.log('Link is not embeddable');
            sendMessageToChat('Sorry, I can only handle embeddable links at the moment :(');
        }
    } catch (err) {
        console.error('Error handling link message:', err);
        throw err;
    }
}

async function isLinkEmbeddable(url) {
    try {
        const response = await axios.head(link, { timeout: 5000 });
        const contentType = response.headers['content-type'];
        return contentType && contentType.includes('text/html');
    } catch (error) {
        console.error(error);
        throw err;
    }
}

async function sendLinkToScribe(linkData) {
    try {
        await LinkDragonScribe.handleReceivedLink(linkData);
    } catch (err) {
        console.error('Error sending link to scribe:', err);
        throw err;
    }
}