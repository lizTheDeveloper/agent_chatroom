
const LinkDragonScribe = require('./linkDragonScribe');
const { Pool } = require('pg');
const pgvector = require('pgvector/pg');

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
        // ai should follow the syntax of the data object according to user request
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
    //the insert function should have use openai chat completion response as variable
    async appendToVDB(data) {
        await client.query('INSERT INTO items (embedding) VALUES ($1)', [pgvector.toSql([1, 2, 3])]);
    }


    async queryVectorDatabase(userQuery) {
    //logic for querying the vector database
        //pass in openai chat completion formatted in 
    //factory example to address select query usage from https://github.com/pgvector/pgvector-node/blob/master/tests/pg/index.test.mjs
    const result = await client.query('SELECT * FROM items ORDER BY embedding <-> $1 LIMIT 5', [pgvector.toSql([1, 2, 3])]);
    await client.query('CREATE INDEX ON items USING hnsw (embedding vector_l2_ops)');
    // or using a different index type
        // await client.query('CREATE INDEX ON items USING ivfflat (embedding vector_l2_ops) WITH (lists = 100)');
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