const { Agent } = require('./AddressableAgent.js');
const axios = require('axios');
const cheerio = require('cheerio');

// Create an instance of LinkDragonScribe and start listening for messages
const agentName = 'LinkDragonScribe';
const password = 'your_password'; //amend with password from users.json
const chatroom = 'general';
const socketUrl = 'https://chat.themultiverse.school:3535/';

const agent = new LinkDragonScribe(agentName, password, chatroom, socketUrl);
agent.connect();
agent.login();
class LinkDragonScribe extends Agent {
    constructor(agentName, password, chatroom, socketUrl) {
        super(agentName, password, chatroom, socketUrl);
        // Register the message handler
        this.registerMessageHandler('linkdragonscribe', this.handleReceivedLink.bind(this));
    }

    async handleReceivedLink(linkData) {
        try {
            // Parse the received JSON data
            const { link, username, timestamp } = JSON.parse(linkData);

            // Fetch the link's content using axios
            const response = await axios.get(link);
            const html = response.data;

            // Parse the HTML using cheerio
            const $ = cheerio.load(html);

            // Extract the relevant metadata
            const title = $('title').text();
            const contentSummary = this.generateContentSummary($);
            const tags = this.extractTags($);

            // Prepare the link data for storage
            const linkDataToStore = {
                title,
                content_summary: contentSummary,
                link_name: link,
                uploaded_by: username,
                upload_date: timestamp,
                tags,
            };

            // Store the link data in the database
            await this.storeLink(linkDataToStore);
            this.sendLinkToKeeper(linkDataToStore);
        } catch (error) {
            console.error('Error handling received link:', error);
        }
    }

    generateContentSummary($) {
        // Extract the main content text from the parsed HTML
        const contentText = $('article, main, .content').text();
    
        // Perform basic text processing
        const cleanedText = contentText.replace(/\s+/g, ' ').trim();
    
        // Truncate the summary to a desired length
        const summaryLength = 200;
        const summary = cleanedText.length > summaryLength ? cleanedText.slice(0, summaryLength) + '...' : cleanedText;
    
        return summary;
    }

    extractTags(contentText, userTags) {
        // Combine user-defined tags with automatically extracted tags
        const autoTags = this.extractAutoTags(contentText);
        const tags = [...new Set([...userTags, ...autoTags])];
    
        return tags;
    }
    
    extractAutoTags(contentText) {
        // Perform text analysis and tag extraction
        const words = contentText.toLowerCase().split(/\s+/);
        const frequencyThreshold = 3;
        const tagRegex = /^[a-zA-Z]+$/;
    
        const frequencyMap = {};
        for (const word of words) {
            if (tagRegex.test(word)) {
                frequencyMap[word] = (frequencyMap[word] || 0) + 1;
            }
        }
    
        const autoTags = Object.entries(frequencyMap)
            .filter(([_, frequency]) => frequency >= frequencyThreshold)
            .map(([tag]) => tag);
    
        return autoTags;
    }
}
sendLinkToKeeper(processedLinkData) {
    // Send the processed link data to the LinkDragonKeeper agent
    this.sendMessage('linkDragonKeeper', JSON.stringify(processedLinkData));
};

