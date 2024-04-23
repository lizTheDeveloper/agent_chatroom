const { Agent } = require('./AddressableAgent.js');
const LinkDragonScribe = require('./linkDragonScribe');
const { Pool } = require('pg');

const agentName = 'LinkDragonKeeper';
const password = 'your_password'; // amend with pass from users.json
const chatroom = 'general';
const socketUrl = 'https://chat.themultiverse.school:3535/';

const agent = new LinkDragonScribe(agentName, password, chatroom, socketUrl);
agent.connect();
agent.login();

class LinkDragonKeeper extends Agent {
    constructor(agentName, password, chatroom, socketUrl) {
        super(agentName, password, chatroom, socketUrl);
        // Register the message handler
        this.registerMessageHandler(chatroom, this.handleReceivedLink.bind(this));
    }

new async function loadJsonAndInsert() {
    try {
        const data = JSON.parse(await fs.readFile('linkCastle.json', 'utf8'));
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