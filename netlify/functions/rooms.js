// netlify/functions/rooms.js
// Serverless room management: create, join validation
// Uses Ably's presence + channel metadata for room state
// Room keys stored server-side in Ably channel metadata via publish

const { v4: uuidv4 } = require('uuid');
const Ably = require('ably');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

function generateRoomId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function generateRoomKey() {
  const seg = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KEY-${seg()}-${seg()}`;
}

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server not configured' }) };
  }

  const client = new Ably.Rest(apiKey);
  const body = JSON.parse(event.body || '{}');
  const action = body.action || event.queryStringParameters?.action;

  try {
    if (action === 'create') {
      const roomId = generateRoomId();
      const key = generateRoomKey();
      const name = body.name || `Room ${roomId}`;
      const ownerId = body.ownerId;

      // Publish room metadata to a control channel
      const controlChannel = client.channels.get('keychat:control');
      await controlChannel.publish('room:created', {
        id: roomId, name, key, ownerId, locked: false, createdAt: Date.now()
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ id: roomId, name, key, ownerId })
      };
    }

    if (action === 'validate') {
      // Validate room key by checking history on control channel
      const { roomId, key } = body;
      if (!roomId || !key) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing roomId or key' }) };
      }

      const controlChannel = client.channels.get('keychat:control');
      const history = await controlChannel.history({ limit: 200 });
      
      let roomData = null;
      for (const msg of history.items) {
        if (msg.name === 'room:created' && msg.data.id === roomId) {
          roomData = msg.data;
          break;
        }
        // Check for key regens
        if (msg.name === 'room:key_regen' && msg.data.roomId === roomId) {
          if (!roomData || roomData.id === roomId) {
            roomData = { ...roomData, key: msg.data.key };
          }
        }
      }

      if (!roomData) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Room not found' }) };
      }
      if (roomData.locked && body.userId !== roomData.ownerId) {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Room is locked' }) };
      }
      if (roomData.key !== key) {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Invalid Room Key. Access Denied.' }) };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ valid: true, name: roomData.name, ownerId: roomData.ownerId, locked: roomData.locked })
      };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action' }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
