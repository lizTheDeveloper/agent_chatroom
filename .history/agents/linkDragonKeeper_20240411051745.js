
const LinkDragonScribe = require('./linkDragonScribe');
const { Pool } = require('pg');
const pg = require('pg');
const pgvector = require('pgvector');
const OpenAI = require('openai');

function validateData(data) {
    const { title, content_summary, link_name, uploaded_by, upload_date, tags } = data;
    await LinkDragonScribe.processLinkData(data);
    const requiredProperties = ['title', 'content_summary', 'link_name', 'uploaded_by', 'upload_date', 'tags'];
    for (const property of requiredProperties) {
        if (!(property in data)) {
            throw new Error(`Missing required property: ${property}`);
        }
    }
}
class retrieveLinkFromDatabase {
    async createInsertQuery(data) {
        validateData(data);
        const query = 'INSERT INTO links (title, content_summary, link_name, uploaded_by, upload_date, tags) VALUES ($1, $2, $3, $4, $5, $6)';
        const values = [title, content_summary, link_name, uploaded_by, upload_date, tags];
        return { query, values };
    }

    async createQueryWithAI(data) {
        validateData(data);
        const query = 'SELECT * FROM links WHERE title = $1 AND content_summary = $2 AND link_name = $3 AND uploaded_by = $4 AND upload_date = $5 AND tags = $6';
        const values = await generateValuesWithAI(data);
        return { query, values };
    }

    async function generateValuesWithAI(data) {
        const systemPrompt = `A user has made a request to generate values for the following data object: "${JSON.stringify(data)}". Please provide the values for each property based on the user request.`;
        const chatCompletion = await OpenAI.createCompletion({
            model: "text-davinci-003",
            prompt: systemPrompt,
            temperature: 0.5,
            max_tokens: 100,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
        });
    
        const generatedValues = JSON.parse(chatCompletion.choices[0].text.trim());
        console.log(`Generated values: ${JSON.stringify(generatedValues)}`);
        return generatedValues;
    }
    async function queryLinkData(data) {
        try {
            console.log('Creating query...');
            const { query, values } = await createQuery(data);
            console.log('Executing query...');
            const result = await query(query, values);
            console.log('Query executed successfully');
            return result.rows;
        } catch (err) {
            sendMessageToChat('Sorry, I could not process the query. Please try again.');
            console.error('Error executing query:', err);
            throw err;
        }
    }
    async function query (q, values=[]) {
        try {
            const client = await Pool.connect();
            let res;
            try {
                // Begin transaction
                await client.query('BEGIN');
                try {
                    res = await client.query(q,values);
                    await client.query('COMMIT');
                } catch (err) {
                    await client.query('ROLLBACK');
                    throw err;
                }
            } finally {
                client.release();
            }
            return res;
        } catch (err) {
            sendMessageToChat('Sorry, I could not process the query. Please try again.');
            console.error(err);
            throw err;
        }
    }

class vectorDatabaseQuerying {
    async appendToVDB(data) {
        const embedding = await generateEmbeddingWithAI(data);
        await client.query('INSERT INTO items (embedding) VALUES ($1)', [pgvector.toSql(embedding)]);
    }
    
    async generateEmbeddingWithAI(data) {
        const systemPrompt = `A user has made a request to generate an embedding for the following data: "${JSON.stringify(data)}". Please provide the embedding as a list of floating-point numbers.`;
        const chatCompletion = await OpenAI.createCompletion({
            model: "text-davinci-003",
            prompt: systemPrompt,
            temperature: 0.5,
            max_tokens: 100,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
        });
    
        const embedding = JSON.parse(chatCompletion.choices[0].text.trim());
        return embedding;
    }

    async queryVectorDatabase(userQuery) {
    //logic for querying the vector database
        const queryEmbedding = await generateEmbeddingWithAI(userQuery);
        const result = await client.query('SELECT * FROM items ORDER BY embedding <-> $1 LIMIT 5', [pgvector.toSql(queryEmbedding)]);
        const links = result.rows.map(row => row.link);
        return links;
    };
    async queryResultHandler(links) {
        const linksDelivered = await queryVectorDatabase(userQuery);
        if (links.length > 0) {
            const responseMessage = links.join('\n');
            sendMessageToChat(`Here are some links related to "${userQuery}":\n${responseMessage}`);
        } else {
            sendMessageToChat(`Sorry, I couldn't find any links related to "${userQuery}".`);
        }
    
}
module.exports = {
    insertLinkData,
};