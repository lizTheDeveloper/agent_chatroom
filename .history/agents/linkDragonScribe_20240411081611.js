
const axios = require('axios');
const cheerio = require('cheerio');
const { encode, decode } = require('gpt-3-encoder');
const OpenAI = require('openai');
const LinkDragonKeeper = require('./linkDragonKeeper.js');
const { insertLinkData } = require('./linkDragonKeeper.js');
// const tiktoken = require('tiktoken');
// let OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
const client = new OpenAI(base_url="http://localhost:1234/v1", api_key="sk-111111111111111111111111111111111111111111111111")

async function handleReceivedLink(linkData) {
    try {
        const processedData = await processLinkData(linkData);
        const linkInserter = new LinkDragonKeeper.LinkInsertion();
        await insertLinkData(processedData);
    } catch (err) {
        console.error('Error handling received link:', err);
        throw err;
    }
}

async function processLinkData(linkData) {
    try {
        const { link, username, timestamp } = linkData;
        const validUrl = new URL(link);
        const response = await axios.get(validUrl.href);
        const html = response.data;
        const $ = cheerio.load(html);
        const title = $('title').text();
        const contentSummary = await generateContentSummary($);
        const tags = await extractTags($);

        const processedData = {
            title: title,
            content_summary: contentSummary,
            link_name: link,
            uploaded_by: username,
            upload_date: timestamp,
            tags: tags,
        };
        return processedData;
    } catch (error) {
        console.error('Error processing link data:', error);
        throw error;
    }
}

async function generateContentSummary($) {
    const contentText = $('article, main, .content').text();
    const cleanedText = contentText.replace(/\s+/g, ' ').trim();
    // const tokenGroups = tokenizeText(cleanedText);
    // const summaries = await processTokenGroups(tokenGroups);
    const fullSummary = cleanedText
    return fullSummary;
}

// function tokenizeText(text) {
//     const encodedText = enc.encode(text);
//     const tokenCount = encodedText.length;

//     if (tokenCount <= 4096) {
//         return [encodedText];
//     }

//     const tokenGroups = [];
//     const groupSize = 4096;
//     for (let i = 0; i < tokenCount; i += groupSize) {
//         const group = encodedText.slice(i, i + groupSize);
//         tokenGroups.push(group);
//     }
//     return tokenGroups;
// }

// async function processTokenGroups(tokenGroups) {
//     const summaries = [];
//     for (let group of tokenGroups) {
//         const decodedGroup = decode(group);
//         const summary = await summarizeText(decodedGroup, 4096);
//         summaries.push(summary);
//     }
//     return summaries;
// }

async function summarizeText(text, maxLength) {
    const systemPrompt = `A user has made a request to summarize the following text: "${text}". Please summarize the text to a maximum of ${maxLength} characters.`;
    const chatCompletion = await client.chat.completions.create(
        model = "NousResearch/Hermes-2-Pro-Mistral-7B-GGUF/Hermes-2-Pro-Mistral-7B.Q4_0.gguf",
        messages=[{ role: 'user', content: systemPrompt}],
        // temperature: 0.5,
        // max_tokens: 100,
        // top_p: 1.0,
        // frequency_penalty: 0.0,
        // presence_penalty: 0.0,
    );

    const summarizationResponse = chatCompletion.choices[0].text.trim();
    console.log(`Summary: ${summarizationResponse}`);
    return summarizationResponse;
}

async function extractTags($) {
    const contentText = $('article, main, .content').text();
    const autoTags = await extractAutoTags(contentText);
    const tags = [...new Set(autoTags)]; // Combine tags and remove duplicates
    return tags;
}

async function extractAutoTags(contentText) {
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

module.exports = {
    handleReceivedLink,
};