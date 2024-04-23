
const axios = require('axios');
const cheerio = require('cheerio');

const LinkDragonKeeper = require('./linkDragonKeeper');

async function handleReceivedLink(linkData) {
    try {
        const processedData = await processLinkData(linkData);
        await LinkDragonKeeper.insertLinkData(processedData);
    } catch (err) {
        console.error('Error handling received link:', err);
        throw err;
    }
}

//if link is received from linkDragonWriter, link metadata is scraped, preprocessed, and parsed into json
async function processLinkData(linkData) {
    try {
        // Parse the received JSON data
        const { link, username, timestamp } = linkData;

        // Fetch the link's content using axios
        const response = await axios.get(link);
        const html = response.data;

        // Parse the HTML using cheerio
        const $ = cheerio.load(html);

        // Extract the relevant metadata
        const title = $('title').text();
        const contentSummary = await generateContentSummary($);
        const tags = await extractTags($);

        // Prepare the link data for storage
        const processedData = {
            title,
            content_summary: contentSummary,
            link_name: link,
            uploaded_by: username,
            upload_date: timestamp,
            tags,
        };
        return processedData;
    } catch (error) {
        console.error('Error processing link data:', error);
        throw error;
    }
}

async function generateContentSummary($) {
        // Extract the main content text from the parsed HTML
        const contentText = $('article, main, .content').text();
    
        // Perform basic text processing
        const cleanedText = contentText.replace(/\s+/g, ' ').trim();
    
        // Use a true summarization algorithm to generate the summary
        const summaryLength = 200;
        const summary = this.summarizeText(cleanedText, summaryLength);
        return summary;
    }
    
    // summarizeText(text, maxLength) {
        // return summarizedText;
    // }

    // extractAutoTags(contentText) {
    //     // Perform text analysis and tag extraction
    //     const words = contentText.toLowerCase().split(/\s+/);
    //     const frequencyThreshold = 3;
    //     const tagRegex = /^[a-zA-Z]+$/;
    
    //     const frequencyMap = {};
    //     for (const word of words) {
    //         if (tagRegex.test(word)) {
    //             frequencyMap[word] = (frequencyMap[word] || 0) + 1;
    //         }
    //     }
    
    //     const autoTags = Object.entries(frequencyMap)
    //         .filter(([_, frequency]) => frequency >= frequencyThreshold)
    //         .map(([tag]) => tag);
    
    //     return autoTags;
    // }

async function extractTags(taggies) {
        // // Combine user-defined tags with automatically extracted tags
        // const autoTags = this.extractAutoTags(contentText);
        // const tags = [...new Set([...userTags, ...autoTags])];
        let tags = "ToDo";
        return tags;
    }

module.exports = {
    handleReceivedLink,
};