let { Agent } = require('./agents/AddressableAgent.js');

let agent = new Agent("agentchatbot", "hi");
agent.connect();


agent.registerMessageHandler("general", (msg) => {
    console.log(msg, msg.includes("@" + this.agentName));
    if (msg.startsWith("agentchatbot")) return;
    if (msg.includes("@" + this.agentName)) {
        console.log(msg)
        agent.prompt(msg).then((response) => {
            agent.sendMessage("general", response);
        });
    }
});
