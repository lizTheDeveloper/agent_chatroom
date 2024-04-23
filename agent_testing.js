let { Agent } = require('./agents/AddressableAgent.js');

let agent = new Agent("LinkDragonAgent", "hi");
agent.connect();
agent.login();

message=message

agent.registerMessageHandler("general", function (msg) {
    console.log(msg);
    //just http and https links for now
    if (msg.includes("http")) {
        console.log("link detected")
        // send the output to the chatroom
        agent.sendMessage("general", stdout);
        sendMessage(channel, message) {
            this.socket.emit(channel, message)};
}



// // every hour, remind everyone to strech, drink water, and take a break
// setInterval(() => {
//     agent.sendMessage("general", "Remember to take a break, drink water, and stretch!");
// }, 1000 * 60);
// agent.sendMessage("general", "Hello everyone! I am a chatbot, and I am here to help you with anything you need. Just mention me with @agentchatbot and I will do my best to help you. Remember to strech, drink water, and take a break every hour!");