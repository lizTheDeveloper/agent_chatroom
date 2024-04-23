const { Pool } = require('pg');
const pg = require('pg');
const pgvector = require('pgvector');
const OpenAI = require('openai');
// const OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
// const client = OpenAI(api_key=OPENAI_API_KEY)
const { processedData } = require('./linkDragonScribe.js');
const client = new OpenAI(base_url="http://localhost:1234/v1", model = "NousResearch/Hermes-2-Pro-Mistral-7B-GGUF/Hermes-2-Pro-Mistral-7B.Q4_0.gguf",api_key="sk-111111111111111111111111111111111111111111111111")
const linkCastleDB = 'postgresql://LinkDragon_owner:gV0OjmR1CxtT@ep-delicate-bread-a4qtryy4.us-east-1.aws.neon.tech/LinkDragon?sslmode=require';

const pool = new Pool({
    connectionString: linkCastleDB,
    ssl: {
        rejectUnauthorized: false
    }
});

function sendMessageToChat(message) {
    console.log(`Message to chat: ${message}`);
    agent.sendMessage("general", message);
}

function validateData(data) {
    const { title, content_summary, link_name, uploaded_by, upload_date, tags } = processedData;
    const requiredProperties = ['title', 'content_summary', 'link_name', 'uploaded_by', 'upload_date', 'tags'];
    for (const property of requiredProperties) {
        if (!(property in data)) {
            throw new Error(`Missing required property: ${property}`);
        }
    }
}

class LinkInsertion {
    async createInsertQuery(data) {
        validateData(data);
        const { title, content_summary, link_name, uploaded_by, upload_date, tags } = data;
        const query = 'INSERT INTO links (title, content_summary, link_name, uploaded_by, upload_date, tags) VALUES ($1, $2, $3, $4, $5, $6)';
        const values = [title, content_summary, link_name, uploaded_by, upload_date, tags];
        return { query, values };
    }
    async insertLinkData(data) {
        try {
            const { query, values } = await this.createInsertQuery(data);
            // Use the pool or client instance to run the query
            const result = await pool.query(query, values);
            console.log('Link data inserted successfully:', result);
        } catch (err) {
            console.error('Error inserting link data:', err);
            throw err;
        }
    }
}


class VectorInsertion {
    async appendToVDB(data) {
        const embedding = await this.generateEmbeddingWithAI(data);
        await client.query('INSERT INTO items (embedding) VALUES ($1)', [pgvector.toSql(embedding)]);
    }

    async generateEmbeddingWithAI(data) {
        const { content_summary } = data;
        const systemPrompt = `A user has made a request to generate a 128-dimensional embedding for the following content summary: "${content_summary}". Please provide the embedding as a list of 128 floating-point numbers.`;
        const chatCompletion = await client.chat.completions.create(
            model = "NousResearch/Hermes-2-Pro-Mistral-7B-GGUF/Hermes-2-Pro-Mistral-7B.Q4_0.gguf",
            messages=[{ role: 'user', content: systemPrompt}],
            // temperature: 0.5,
            // max_tokens: 256,
            // top_p: 1.0,
            // frequency_penalty: 0.0,
            // presence_penalty: 0.0,
        );
    
        const embeddingString = chatCompletion.choices[0].text.trim();
        const embeddingArray = embeddingString.split(',').map(Number);
        const embeddingVector = pgvector.toSql(embeddingArray);
        return embeddingVector;
    }
}

class LinkRetrieval {
    async createQueryWithAI(data) {
        validateData(data);
        const query = 'SELECT * FROM links WHERE title = $1 AND content_summary = $2 AND link_name = $3 AND uploaded_by = $4 AND upload_date = $5 AND tags = $6';
        const values = await this.generateValuesWithAI(data);
        return { query, values };
    }

    async generateValuesWithAI(data) {
        const systemPrompt = `A user has made a request to retrieve data related to the following criteria: "${userQuery}". Please generate provide the values for each property using the following format "${JSON.stringify(data)}" and generate values where applicable to fit an SQL query based on the user request. If certain values are not available from user request, only provide values for the available properties.`;
        const chatCompletion = await client.chat.completions.create(
            model = "NousResearch/Hermes-2-Pro-Mistral-7B-GGUF/Hermes-2-Pro-Mistral-7B.Q4_0.gguf",
            messages=[{ role: 'user', content: systemPrompt}],
            // temperature: 0.5,
            // max_tokens: 100,
            // top_p: 1.0,
            // frequency_penalty: 0.0,
            // presence_penalty: 0.0,
        );

        const generatedValues = JSON.parse(chatCompletion.choices[0].text.trim());
        console.log(`Generated values: ${JSON.stringify(generatedValues)}`);
        return generatedValues;
    }

    async queryLinkData(data) {
        try {
            console.log('Creating query...');
            const { query, values } = await this.createQueryWithAI(data);
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
}

class VectorRetrieval {
    async queryVectorDatabase(userQuery) {
        const query = await this.generateQueryWithAI(userQuery);
        const result = await client.query(query);
        const links = result.rows.map(row => row.link);
        return links;
    }

    async generateQueryWithAI(userQuery) {
        const systemPrompt = `A user has made a request to retrieve data related to the following query: "${userQuery}". Please provide an SQL query that retrieves the relevant data from the vector column, ordered by their similarity to the query, along with all other fields associated with the target entry/entries.`;
        const chatCompletion = await client.chat.completions.create(
            model = "NousResearch/Hermes-2-Pro-Mistral-7B-GGUF/Hermes-2-Pro-Mistral-7B.Q4_0.gguf",
            messages=[{ role: 'user', content: systemPrompt}],
            // temperature: 0.5,
            // max_tokens: 100,
            // top_p: 1.0,
            // frequency_penalty: 0.0,
            // presence_penalty: 0.0,
        );

        const generatedQuery = chatCompletion.choices[0].text.trim();
        console.log(`Generated query: ${generatedQuery}`);
        return generatedQuery;
    }

    async queryResultHandler(userQuery) {
        const links = await this.queryVectorDatabase(userQuery);
        if (links.length > 0) {
            const responseMessage = links.join('\n');
            sendMessageToChat(`Here are some links related to "${userQuery}":\n${responseMessage}`);
        } else {
            sendMessageToChat(`Sorry, I couldn't find any links related to "${userQuery}".`);
        }
    }
}

module.exports = {
    LinkInsertion,
    VectorInsertion,
    LinkRetrieval,
    VectorRetrieval,
};