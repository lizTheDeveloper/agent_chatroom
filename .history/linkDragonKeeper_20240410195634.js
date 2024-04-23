const { Agent } = require('./AddressableAgent.js');
const LinkDragonScribe = require('./linkDragonScribe');
const { Pool } = require('pg');

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

const pool = new pg.Pool(config);

loadJsonAndInsert() {
    try {
        const data = LinkDragonScribe.getJsonDataFromChat();
        const client = await Pool.connect();
        try {
            // Begin transaction
            await client.query('BEGIN');
            for (const item of data) {
                await client.query(
                    'INSERT INTO links (title, content_summary, link_name, uploaded_by, upload_date, tags) VALUES ($1, $2, $3, $4, $5, $6)'
                );
            }
            // Commit transaction
            await client.query('COMMIT');
        } catch (err) {
            // Rollback in case of error
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Failed to load JSON data and insert into the database:', err);
    }
}
