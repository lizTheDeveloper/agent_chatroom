const { Agent } = require('./AddressableAgent.js');
const axios = require('axios');
const cheerio = require('cheerio');

class LinkDragonScribe extends Agent {
    constructor(agentName, password, chatroom, socketUrl) {
        super(agentName, password, chatroom, socketUrl);
        // Register the message handler
        this.registerMessageHandler('linkdragonscribe', this.handleReceivedLink.bind(this));
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
