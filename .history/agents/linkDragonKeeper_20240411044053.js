
const LinkDragonScribe = require('./linkDragonScribe');
const { Pool } = require('pg');


function validateData(data) {
    const requiredProperties = ['title', 'content_summary', 'link_name', 'uploaded_by', 'upload_date', 'tags'];
    for (const property of requiredProperties) {
        if (!(property in data)) {
            throw new Error(`Missing required property: ${property}`);
        }
    }
}
class retrieveLinkFromDatabase {
    async createInsertQueryWithAI(data) {
        validateData(data);
        const query = 'INSERT INTO links (title, content_summary, link_name, uploaded_by, upload_date, tags) VALUES ($1, $2, $3, $4, $5, $6)';
        const values = await generateValuesWithAI(data);
        return { query, values };
    }

    async createQueryWithAI(data) {
        validateData(data);
        const query = 'SELECT * FROM links WHERE title = $1 AND content_summary = $2 AND link_name = $3 AND uploaded_by = $4 AND upload_date = $5 AND tags = $6';
        const values = await generateValuesWithAI(data);
        return { query, values };
    }

    async generateValuesWithAI(data) {
        // Use AI to generate the values for the data object
        // ...
        return generatedValues;
    }
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
            console.error('Error executing query:', err);
            // Handle the error appropriately (e.g., send an error response)
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
            console.error(err);
            throw err;
        }
    }

class vectorDatabaseQuerying {
    async createVectorDatabase() {
        const client = await pool.connect();
        await client.query('CREATE EXTENSION IF NOT EXISTS vector');
        await pgvector.registerType(client);
    }


    async queryVectorDatabase(userQuery) {
    //logic for querying the vector database
    //pass in openai chat completion formatted in nlp
    };
    
        const links = queryResult.data.links; // Assuming the API returns a list of links
        if (links.length > 0) {
            const responseMessage = links.map(link => link.url).join('\n');
            sendMessageToChat(`Here are some links related to "${userQuery}":\n${responseMessage}`);
        } else {
            sendMessageToChat(`Sorry, I couldn't find any links related to "${userQuery}".`);
        }
    }
    
}
module.exports = {
    insertLinkData,
};