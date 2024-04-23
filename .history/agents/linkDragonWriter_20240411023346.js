const { Agent } = require('./AddressableAgent.js');
const axios = require('axios');
const LinkDragonScribe = require('./linkDragonScribe.js');
const OpenAI = require('openai');

require('dotenv').config();

//creating new agent
let agent = new Agent("LinkDragonAgent", "hi");
agent.connect();
agent.login();

//used for sending message to users and bots
function sendMessageToChat(message) {
    console.log(`Message to chat: ${message}`);
    agent.sendMessage("general", message);
}

//registering message handler for general chat
agent.registerMessageHandler("general", async function (msg) {
    console.log(msg);
    const username = msg.split(" ")[0];
    const url = msg.substring(username.length + 1);
    // Check if the message contains a link
    if (isLinkMessage(msg)) {
        // Handle the link message
        await handleLinkMessage(linkData);
    }
    elif (isRetrievalMessage(msg)) {
        // Handle the retrieval message
        await handleRetrievalMessage(msg);
    }
    }
});

function isLinkMessage(message) {
    // Check if the message contains a link using a regular expression
    const linkRegex = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
    return linkRegex.test(message);
}

// Check if the message is a retrieval message
function isRetrievalMessage(message) {
    return message.toLowerCase().includes('retrieve');
}

async function handleLinkMessage(link, username) {
    try {
        // Check if the link is embeddable
        const isEmbeddable = await isLinkEmbeddable(linkData.link);
        if (isEmbeddable) {
            const linkData = {
                link,
                username,
                timestamp: new Date().toISOString(),
            };
            // Send the link to the scribe
            await sendLinkToScribe(linkData);
        } else {
            console.log('Link is not embeddable');
            sendMessageToChat('Sorry, I can only handle embeddable links at the moment :(');
        }
    } catch (err) {
        console.error('Error handling link message:', err);
        throw err;
    }
}

async function sendLinkToScribe(linkData) {
    try {
        await LinkDragonScribe.handleReceivedLink(linkData);
        console.log('Link sent to scribe');
        sendMessageToChat('Link received and being processed. Thanks for sharing!');
    } catch (err) {
        console.error('Error sending link to scribe:', err);
        throw err;
    }
}
