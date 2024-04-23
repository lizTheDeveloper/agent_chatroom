const { Agent } = require('./AddressableAgent.js');
const axios = require('axios');
const LinkDragonScribe = require('./linkDragonScribe.js');
const OpenAI = require('openai');

require('dotenv').config();

let agent = new Agent("LinkDragonAgent", "hi");
agent.connect();
agent.login();

function sendMessageToChat(message) {
    console.log(`Message to chat: ${message}`);
    agent.sendMessage("general", message);
}

agent.registerMessageHandler("general", function (msg) {
    // Extract the username and the rest of the message
    console.log(msg);
    const username = msg.split(" ")[0];
    const link = msg.substring(username.length + 1);
    const linkData = {
        link,
        username,
        timestamp: new Date().toISOString(),
    };

    // Check if the message contains a link
    if (isLinkMessage(msg)) {
        // Handle the link message
        handleLinkMessage(linkData);
    }
});

function isLinkMessage(message) {
    // Use a regular expression to check if the message contains a link
    const linkRegex = /(http|https):\/\/[^\s]+/;
    return linkRegex.test(message);
}

async function handleLinkMessage(linkData) {
    try {
        // Check if the link is embeddable
        const isEmbeddable = await isLinkEmbeddable(linkData.link);
        if (isEmbeddable) {
            // Send the link to the scribe
            await sendLinkToScribe(linkData);
        } else {
            console.log('Link is not embeddable');
        }
    } catch (err) {
        console.error('Error handling link message:', err);
        throw err;
    }
}

async function isLinkEmbeddable(url) {
    try {
        const response = await axios.head(url, { timeout: 5000 });
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