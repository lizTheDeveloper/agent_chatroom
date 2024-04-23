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

async function create
async function loadJsonAndInsert() {
    try {
        const data = LinkDragonScribe.handleReceivedLink(linkDataToStore);
        const client = await Pool.connect();
        let res
        try {
            // Begin transaction
            await client.query('BEGIN');
            try {
                res = await client.query(q,values)
                await client.query('COMMIT');
            } catch (err) {
                await client.query('ROLLBACK');
                throw err
                }
            } finally {
                client.release()
            }
            return res
        }

            for (const item of data) {
                await client.query(
                    'INSERT INTO links (title, content_summary, link_name, uploaded_by, upload_date, tags) VALUES ($1, $2, $3, $4, $5, $6)'
                );
            }

        }
    } catch (err) {
        console.error('Failed to load JSON data and insert into the database:', err);
    }
}
