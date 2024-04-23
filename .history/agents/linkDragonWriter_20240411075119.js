const { Agent } = require('./AddressableAgent.js');
const LinkDragonScribe = require('./linkDragonScribe.js');
const LinkDragonKeeper = require('./linkDragonKeeper.js');
const tiktoken = require('tiktoken');
const axios = require('axios');
const OpenAI = require('openai');
const os = require('os');
path = os.path;
const users = require(path.join(__dirname, '../users.json'));
const client = new OpenAI(base_url="http://localhost:1234/v1", api_key="sk-111111111111111111111111111111111111111111111111")


require('dotenv').config();

let allowedUsers = users;
//creating new agent
let agent = new Agent("LinkDragonAgent", "hi");
agent.connect();
agent.login();

let intro_message = "hey, you just sent me a link for the first time! i'm Link Dragon, a bot to help you keep track of your links and even query web content. just mention me with @LinkDragon and let me know how i can help you. you can also send @LinkDragonHelp for a list of available features, or to ask me about what i can do!"

//registering message handler for general chat, checking for message type. defines action flows depending on user request
agent.registerMessageHandler("general", async function (message) {
    console.log(message);
    const username = message.split(" ")[0];
    const user_message = message.substring(username.length + 1);
    const linkRegex = /^http:\/\/\S+$/i;
    if (allowedUsers.includes(username) && (user_message.includes("http") || user_message.includes("https"))) {
        await handleLinkMessage(user_message, username);
    } else if (message.includes("@LinkDragon".toLowerCase())) {
        console.log("LINK DRAGON MENTIONED");
        //add ascii art of link dragon mentioned, later
        try {
            sendMessageToChat("hey, thanks for summoning me. can i help you find something? ");
            await linkDragonMentioned(user_message);
        } catch (err) {
            console.error('Error handling link dragon mention:', err);
            throw err;
        }
};
});
// see what the fucjing user wants
async function linkDragonMentioned(message) {
    const userQuery = message;
    const systemPrompt = `A user has made a request: "${userQuery}". Classify the intent of the request into one of the following categories: 1) Retrieve a specific link from the database, 2) Query the vector database for content related links, 3) Ask for help with LinkDragon's features. Then, provide a response based on the category.`;
    const chatCompletion = await client.chat.completions.create(
        model = "NousResearch/Hermes-2-Pro-Mistral-7B-GGUF/Hermes-2-Pro-Mistral-7B.Q4_0.gguf",
        messages=[{ role: 'user', content: systemPrompt}],
        // temperature: 0.5,
        // max_tokens: 100,
        // top_p: 1.0,
        // frequency_penalty: 0.0,
        // presence_penalty: 0.0,
    );

    const fullResponse = chatCompletion.choices[0].text.trim();
    console.log(`OpenAI response: ${fullResponse}`);
    // Now you classify the response and act accordingly
    if (fullResponse.includes("1)")) {
        // Logic for retrieving a specific link
        await LinkDragonKeeper.createQueryWithAI(data);
    } else if (fullResponse.includes("2)")) {
        // Logic for querying the vector database
        await LinkDragonKeeper.queryVectorDatabase(data);
    } else if (fullResponse.includes("3)")) {
        // Logic for providing help
        sendMessageToChat(`Here are the available features of LinkDragon:\n1. Retrieve a specific link from the database\n2. Query the vector database for content related links\n3. Ask for help with LinkDragon's features`);
        //wait this just might be circular logic
    } else {
        sendMessageToChat('Sorry, I could not understand your request. Please try again.');
        console.log('No valid response category found');
    }
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
        sendMessageToChat('Sorry, I could not process the link. Please try again.');
        throw err;
    }
}