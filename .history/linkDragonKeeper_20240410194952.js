const { Agent } = require('./AddressableAgent.js');
const LinkDragonScribe = require('./linkDragonScribe');
const { Pool } = require('pg');


async loadJsonAndInsert() {
    try {
        // Assuming you receive the JSON data from the socket chat channel
        const jsonDataFromChat = ...; // Replace ... with the actual JSON data received

        const data = JSON.parse(jsonDataFromChat);
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

loadJsonAndInsert().then(() => console.log('Data loaded and inserted successfully.'));

//Sending status to terminal and chatroom
async function sendMessage(channel, message) {
    try {
        await agent.sendMessage(channel, message);
        console.log('Link uploaded to the database.');
    } catch (err) {
        console.error('Failed to save link.', err);
    }
}

// Call the sendMessage function
sendMessage(chatroom, 'Link saved!');