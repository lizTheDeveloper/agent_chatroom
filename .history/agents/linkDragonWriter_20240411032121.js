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

let intro_message = "hey, you just sent me a link for the first time! i'm Link Dragon, a bot to help you keep track of your links and even query web content. just mention me with @LinkDragon and let me know how i can help you. you can also send @LinkDragonHelp for a list of available features, or to ask me about what i can do!"

//registering message handler for general chat, checking for message type. defines action flows depending on user request
agent.registerMessageHandler("general", async function (msg) {
    console.log(msg);
    const username = msg.split(" ")[0];
    const user_message = msg.substring(username.length + 1);
    if (isLinkMessage(user_message)) {
        // Handle the link message
        await handleLinkMessage(link, username);
    }
    else if (msg.includes("@LinkDragon".toLowerCase)) {
        console.log("LINK DRAGON MENTIONED");
        //add ascii art of link dragon mentioned, later
        try {
            sendMessageToChat("hey, thanks for summoning me. can i help you find something? ");
            await linkDragonMentioned(user_message);
        }
        catch (err) {
            console.error('Error handling link dragon mention:', err);
            throw err;
        }
    }
});

async function isLinkMessage(message) {
    // Check if the message contains a link using a regular expression
    const linkRegex = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
    return linkRegex.test(message);
}

// see what the fucjing user wants
async function linkDragonMentioned(message) {
    let msg = message;
    const prompt = `Define this user's request: "${msg.replace("@LinkDragon", "").trim()}"`;
    const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{"role": "system", "content": prompt},
            {"role": "user", "content": msg}],
    });

    const fullResponse = chatCompletion.choices[0].message.content.trim();
    console.log(`result: ${fullResponse}`);
}

async function handleLinkMessage(link, username) {
    try {
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
        console.log('link sent to scribe');
        sendMessageToChat('link received and being processed. thx for sharing!');
    } catch (err) {
        console.error('Error sending link to scribe:', err);
        throw err;
    }
}
