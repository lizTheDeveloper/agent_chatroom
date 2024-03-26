let { Agent } = require('./agents/AddressableAgent.js');

const subprocess = require('child_process');

let agent = new Agent("githubby", "hi");
agent.connect();
agent.login();

let allowedUsers = ['liz', 'r', 'gene']

agent.registerMessageHandler("general", function (msg) {
    // if the message comes from an allowed user
    console.log(msg);
    if (allowedUsers.includes(msg.split(" ")[0])) {
        console.log("message from allowed user")
        // parse the message for the github projects command
        if (msg.includes("github projects")) {
            console.log("logging projects")
            // use subprocess to run the command using the gh projects cli
            subprocess.exec('gh project list', (err, stdout, stderr) => {
                if (err) {
                    console.error(err);
                    return;
                }
                // send the output to the chatroom
                agent.sendMessage("general", stdout);
                agent.prompt(stdout + " " + msg).then((response) => {
                    agent.sendMessage("general", response);
                });
            });
        }
        if (msg.includes("github repos")) {
            const parts = msg.split(" "); // Assuming the format "username github repos"
            if (parts.length >= 3) {
                const owner = parts[3]; // The third part should be the username/organization
                console.log(`Listing repositories for ${owner}`);
                subprocess.exec(`gh repo list ${owner} --limit 30`, (err, stdout, stderr) => {
                    if (err) {
                        console.error(`Error: ${err}`);
                        return;
                    }
                    agent.sendMessage("general", stdout);
                    agent.prompt(stdout + " " + msg).then((response) => {
                        agent.sendMessage("general", response);
                    });
                });
            } else {
                agent.sendMessage("general", "Please specify a GitHub username or organization after 'github repos'.");
            }
        }

        // Add an if statement for viewing issues
        if (msg.includes("github issues")) {
            console.log("Viewing issues");
            subprocess.exec('gh issue list', (err, stdout, stderr) => {
                if (err) {
                    console.error(`Error: ${err}`);
                    return;
                }
                agent.sendMessage("general", stdout);
                agent.prompt(stdout + " " + msg).then((response) => {
                    agent.sendMessage("general", response);
                });
            });
        }

        // Add an if statement for checking pull requests
        if (msg.includes("github prs")) {
            console.log("Checking pull requests");
            subprocess.exec('gh pr list', (err, stdout, stderr) => {
                if (err) {
                    console.error(`Error: ${err}`);
                    return;
                }
                agent.sendMessage("general", stdout);
                agent.prompt(stdout + " " + msg).then((response) => {
                    agent.sendMessage("general", response);
                });
            });
        }


        // if the message contains the command, then send the github projects
        // use subprocess to run the command using the gh projects cli
        // send the output to the chatroom
    } else {
    //    console.log("message from unallowed user")
        if (msg.startsWith(agent.agentName)) return;
        agent.prompt(msg).then((response) => {
            agent.sendMessage("general", response);
        });

    }
});



// every hour, remind everyone to strech, drink water, and take a break
//setInterval(() => {
//    agent.sendMessage("general", "Remember to take a break, drink water, and stretch!");
//}, 1000 * 60);
//agent.sendMessage("general", "Hello everyone! I am a chatbot, and I am here to help you with anything you need. Just mention me with @agentchatbot and I will do my best to help you. Remember to strech, drink water, and take a break every hour!");