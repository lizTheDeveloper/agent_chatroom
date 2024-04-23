const { Agent } = require('./AddressableAgent.js');
const LinkDragonScribe = require('./linkDragonScribe');
const { Pool } = require('pg');
const pool = new pg.Pool(config);

var config = {
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    port: 5432,
    ssl: {
        require: true,
    },
}

function validateData(data) {
    const requiredProperties = ['title', 'content_summary', 'link_name', 'uploaded_by', 'upload_date', 'tags'];
    for (const property of requiredProperties) {
        if (!(property in data)) {
            throw new Error(`Missing required property: ${property}`);
        }
    }
}
validateData(data);

async function createInsertQuery(data) {
    await LinkDragonScribe.handleReceivedLink(data);
    const query = 'INSERT INTO links (title, content_summary, link_name, uploaded_by, upload_date, tags) VALUES ($1, $2, $3, $4, $5, $6)';
    const values = [data.title, data.content_summary, data.link_name, data.uploaded_by, data.upload_date, data.tags];
    return { query, values };
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
        // Handle error here
        console.error(err);
    }
}

createInsertQuery(data)
query(createInsertQuery(data))