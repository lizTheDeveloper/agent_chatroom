const fs = require('fs');
const { io } = require("socket.io-client");

class Agent {
    constructor(agentName, password, chatroom) {
        // Assuming these are necessary for AddressableAgent's functionality
        this.agentName = agentName;
        this.password = password;
        this.chatroom = chatroom;
        this.socket = io("http://your_chatroom_server_address"); // Adjust this to your server
    }

    connect() {
        // Placeholder for any connection logic needed
    }
}

class LinkDragonAgent extends Agent {
    constructor(agentName, password, chatroom) {
        super(agentName, password, chatroom);
    }

    listenForLink() {
        this.socket.on(this.chatroom, (message) => {
            if (message.startsWith("/link")) {
                const link = message.split(" ")[1];
                this.sortLink(link);
            }
        });
    }

    readLinkFile() {
        try {
            return JSON.parse(fs.readFileSync('linkCastle.json', 'utf8'));
        } catch (error) {
            console.error("Error reading the link file:", error);
            return {};
        }
    }

    writeLinkFile(data) {
        try {
            fs.writeFileSync('linkCastle.json', JSON.stringify(data, null, 2), 'utf8');
        } catch (error) {
            console.error("Error writing to the link file:", error);
        }
    }

    sortLink(link) {
        const data = this.readLinkFile();
        // Assuming a structure where data is an object with topics as keys and arrays of links as values
        // Example: { "technology": ["http://link1.com"], "health": ["http://link2.com"] }
        // For simplicity, let's just store all links under a generic topic for now
        const topic = 'general'; // Here you could extend this to allow users to specify or select a topic
        if (!data[topic]) {
            data[topic] = [];
        }
        data[topic].push(link);
        this.writeLinkFile(data);
        this.socket.emit(this.chatroom, `Link added under ${topic}: ${link}`);
    }

    // Additional methods to retrieve and interact with links can be added here
}

// Usage example (outside of this class definition file)
const linkDragonAgent = new LinkDragonAgent("LinkDragonAgent", "password", "general");
linkDragonAgent.connect();
linkDragonAgent.listenForLink();
