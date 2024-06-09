const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Read token from file
const tokenPath = path.join(__dirname, 'token');
let token = fs.readFileSync(tokenPath, 'utf8').trim();

// Remove "TOKEN=" prefix if it exists
if (token.startsWith('TOKEN=')) {
  token = token.slice(6);
}

console.log('Token:', token); // Log the token

// Create a new client instance
const client = new Client();

// When the client is ready, run this code
client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const results = [];

  // Fetch invites for all guilds
  const inviteLinks = [];
  for (const guild of client.guilds.cache.values()) {
    try {
      const channel = guild.channels.cache.find(ch => ch.type === 'GUILD_TEXT' && ch.permissionsFor(guild.me).has('CREATE_INSTANT_INVITE'));
      if (channel) {
        const invite = await channel.createInvite({ maxAge: 0, maxUses: 0 });
        inviteLinks.push(invite.url);
      } else {
        console.error(`No permission to create invite in guild ${guild.name}`);
      }
    } catch (error) {
      console.error(`Error creating invite for guild ${guild.name}:`, error);
    }
  }

  // Add the invite links to the results
  results.push('Invite Links:', ...inviteLinks, '');

  // Fetch friends list using unofficial API endpoint
  try {
    const friendsResponse = await axios.get('https://discord.com/api/v9/users/@me/relationships', {
      headers: {
        Authorization: token
      }
    });
    const friends = friendsResponse.data.map(friend => `${friend.user.username}#${friend.user.discriminator}`);
    results.push('Friends List:', ...friends);
  } catch (error) {
    console.error('Error fetching friends list:', error);
  }

  // Write results to a file
  const resultFilePath = path.join(__dirname, 'results.txt');
  fs.writeFileSync(resultFilePath, results.join('\n'), 'utf8');

  console.log(`Results saved to ${resultFilePath}`);
});

// Login to Discord with your user token
client.login(token);
