const subprocess = require('child_process');
const { Agent } = require('./agents/AddressableAgent.js');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

let agent = new Agent("githubby", "hi");
agent.connect();
agent.login();

let allowedUsers = ['liz', 'r', 'gene'];

// Modified to use agent.sendMessage method for sending message back to the chatroom
function sendMessageToChat(message) {
    console.log(`Message to chat: ${message}`);
    agent.sendMessage("general", message); // Assuming "general" is the chatroom name
}

agent.registerMessageHandler("general", async function (msg) {
    console.log(msg);
    // Check if the message mentions @githubby
    if (!msg.includes("@githubby")) {
        console.log("Message does not mention @githubby, ignoring.");
        return; // Ignore messages not addressing @githubby
    }

    // Extract username from the message
    const username = msg.split(" ")[0];
    
    if (allowedUsers.includes(username)) {
        console.log("Message from allowed user mentioning @githubby");

        try {
            // Adjust the prompt as necessary
            const prompt = `Translate this user request into a GitHub CLI command: "${msg.replace("@githubby", "").trim()}"`;
            const chatCompletion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [{"role": "system", "content": prompt},
                           {"role": "user", "content": msg}],
            });

            const fullResponse = chatCompletion.choices[0].message.content.trim();
            console.log(`Full AI Response: ${fullResponse}`);

            const ghCommandMatch = fullResponse.match(/^gh .+$/m); 

            if (ghCommandMatch) {
                const ghCommand = ghCommandMatch[0];
                console.log(`Extracted GH Command: ${ghCommand}`);
                
                subprocess.exec(ghCommand, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`exec error: ${error}`);
                        sendMessageToChat(`Error executing command: ${error.message}`);
                        return;
                    }
                    console.log(`stdout: ${stdout}`);
                    console.error(`stderr: ${stderr}`);

                    // Assuming stdout has the command output you want to share
                    sendMessageToChat(`@${username}, here's the output:\n${stdout}`);
                    if (stderr) sendMessageToChat(`Command Errors:\n${stderr}`);
                });
            } else {
                console.log("No GH command found in AI response.");
                sendMessageToChat(`@${username}, I couldn't interpret that request.`);
            }
        } catch (error) {
            console.error("Error calling OpenAI:", error);
            sendMessageToChat(`@${username}, I encountered an error processing your request.`);
        }
    } else {
        console.log("Message from unauthorized user.");
        sendMessageToChat(`@${username}, you're not authorized to use this command.`);
    }
});
