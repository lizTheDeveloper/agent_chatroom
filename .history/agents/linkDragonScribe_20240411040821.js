
const axios = require('axios');
const cheerio = require('cheerio');
const {encode, decode} = require('gpt-3-encoder')

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

function isItWorthTokenizing(cleanedText) {
    const textToCount = cleanedText
    const encodedCleanedText = enc.encode(cleanedText)
    const tokenCount = encodedCleanedText.length
    if (tokenCount > 4096) {
        const tokenGroups = [];
        const groupSize = 4096;
        for (let i = 0; i < tokenCount; i += groupSize) {
            const group = encodedCleanedText.slice(i, i + groupSize);
            tokenGroups.push(group);
        }
        for (let group of tokenGroups) {
            const decodedGroup = decode(group);
            console.log({ group, decodedGroup });
            // Append the group as a user message and communicate with the OpenAI API
            // ...
        }
    }
    for (let token of encoded) {
        console.log({token, string: decode([token])})
    }
    const decoded = decode(encoded)
    console.log('We can decode it back into:\n', decoded)
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

async function summarizeText(text, maxLength) {
    const systemPrompt = `A user has made a request to summarize the following text: "${cleanedText}". Please summarize the text to a maximum of ${maxLength} characters.`;
    const chatCompletion = await OpenAI.createCompletion({
        model: "text-davinci-003",
        prompt: systemPrompt,
        temperature: 0.5,
        max_tokens: 100,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
    });

    const summarizationResponse = chatCompletion.choices[0].text.trim();
    console.log(`summary: ${summarizationResponse}`);
    return summarizedText;
}

async function extractTags(taggies) {
    // Combine user-defined tags with automatically extracted tags
    const autoTags = this.extractAutoTags(contentText);
    const tags = [...new Set([...userTags, ...autoTags])];
    return tags;
}

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

async function handleReceivedLink(linkData) {
    try {
        const processedData = await processLinkData(linkData);
        await LinkDragonKeeper.insertLinkData(processedData);
    } catch (err) {
        console.error('Error handling received link:', err);
        throw err;
    }
}

module.exports = {
    handleReceivedLink,
};
    
    summarizeText(text, maxLength) {
        const systemPrompt = `A user has made a request to summarize the following text: "${cleanedText}". Please summarize the text to a maximum of ${maxLength} characters.`;
        const chatCompletion = await OpenAI.createCompletion({
            model: "text-davinci-003",
            prompt: systemPrompt,
            temperature: 0.5,
            max_tokens: 100,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
        });
    
        const summarizationResponse = chatCompletion.choices[0].text.trim();
        console.log(`summary: ${summarizationResponse}`);
        return summarizedText;
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

async function extractTags(taggies) {
        // Combine user-defined tags with automatically extracted tags
        const autoTags = this.extractAutoTags(contentText);
        const tags = [...new Set([...userTags, ...autoTags])];
        return tags;
    }

module.exports = {
    handleReceivedLink,
};