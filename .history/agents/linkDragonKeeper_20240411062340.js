const { Pool } = require('pg');
const pg = require('pg');
const pgvector = require('pgvector');
const OpenAI = require('openai');

function validateData(data) {
    const { title, content_summary, link_name, uploaded_by, upload_date, tags } = data;
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
            await query(query, values);
            console.log('Link data inserted successfully');
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
        const systemPrompt = `A user has made a request to generate a 128-dimensional embedding for the following data: "${JSON.stringify(data)}". Please provide the embedding as a list of 128 floating-point numbers.`;
        const chatCompletion = await OpenAI.createCompletion({
            model: "text-davinci-003",
            prompt: systemPrompt,
            temperature: 0.5,
            max_tokens: 256,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
        });
    
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
        const queryEmbedding = await this.generateEmbeddingWithAI(userQuery);
        const result = await client.query('SELECT * FROM items ORDER BY embedding <-> $1 LIMIT 5', [pgvector.toSql(queryEmbedding)]);
        const links = result.rows.map(row => row.link);
        return links;
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