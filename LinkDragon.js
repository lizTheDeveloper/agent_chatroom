let { Agent } = require('./agents/AddressableAgent.js');

const subprocess = require('child_process');

let agent = new Agent("LinkDragonAgent", "hi");
agent.connect();
agent.login();

//Link for Neon Database
const linkCastleFile = 'postgresql://LinkDragon_owner:gV0OjmR1CxtT@ep-delicate-bread-a4qtryy4.us-east-1.aws.neon.tech/LinkDragon?sslmode=require';

function readLinkFile() {
    try {
        return JSON.parse(fs.readFileSync(linkCastleFile, 'utf8'));
    } catch (error) {
        console.error("Error reading the link file:", error);
        return {};
    }
}

function writeLinkFile(data) {
    try {
        fs.writeFileSync(linkCastleFile, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error("Error writing to the link file:", error);
    }
}

function storeLink(link, user) {
    const data = readLinkFile();
    if (!data[user]) data[user] = [];
    data[user].push(link);
    writeLinkFile(data);
    // Send message to "LinkDragonData" channel
    agent.sendMessage("LinkDragonData", `Link stored from ${user}: ${link}`);
}
}

agent.registerMessageHandler("general", function (msg) {
    const username = msg.split(" ")[0];
    const restOfMessage = msg.substring(username.length + 1);

    if (allowedUsers.includes(username)) {
        if (restOfMessage.includes("http")) {
            // Assuming the first space-separated part is the username and the rest is the message
            const links = restOfMessage.match(/\bhttps?:\/\/\S+/gi);
            if (links) {
                links.forEach(link => {
                    storeLink(link, username);
                    agent.sendMessage("general", `Link detected and stored from ${username}: ${link}`);
                });
            }
        }
        if (restOfMessage.includes("get links")) {
            console.log("getting links");
            subprocess.exec('tail linkCastle.json', (err, stdout, stderr) => {
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
    }
}
)
