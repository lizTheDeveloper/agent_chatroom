
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
class SQLdatabaseQuerying {
    async createInsertQuery(data) {
        validateData(data);
        const query = 'INSERT INTO links (title, content_summary, link_name, uploaded_by, upload_date, tags) VALUES ($1, $2, $3, $4, $5, $6)';
        const values = [data.title, data.content_summary, data.link_name, data.uploaded_by, data.upload_date, data.tags];
        return { query, values };
    }

    async createQuery(data) {
        validateData(data);
        const query = 'SELECT * FROM links WHERE title = $1 AND content_summary = $2 AND link_name = $3 AND uploaded_by = $4 AND upload_date = $5 AND tags = $6';
        const values = [data.title, data.content_summary, data.link_name, data.uploaded_by, data.upload_date, data.tags];
        return { query, values };
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
    async function autocompleteFields(data) {
        try {
            console.log('Autocompleting fields...');
            // Use AI to autocomplete the relevant fields in the data object
            // ...
            console.log('Fields autocompleted successfully');
            return data;
        } catch (err) {
            console.error('Error autocompleting fields:', err);
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
            console.error(err);
            throw err;
        }
    }

class vector
module.exports = {
    insertLinkData,
};