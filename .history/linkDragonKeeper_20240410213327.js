
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
validateData(data);

async function createInsertQuery(data) {
    const query = 'INSERT INTO links (title, content_summary, link_name, uploaded_by, upload_date, tags) VALUES ($1, $2, $3, $4, $5, $6)';
    const values = [data.title, data.content_summary, data.link_name, data.uploaded_by, data.upload_date, data.tags];
    return { query, values };
}
async function insertLinkData(data) {
    try {
        console.log('Creating insert query...');
        const { query, values } = await createInsertQuery(data);
        console.log('Executing query...');
        await query(query, values);
        console.log('Link data inserted successfully');
    } catch (err) {
        console.error('Error inserting link data:', err);
        // Handle the error appropriately (e.g., send an error response)
    }
}

module.exports = {
    insertLinkData,
};
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

createInsertQuery(data)
query(createInsertQuery(data))
insertLinkData(data);