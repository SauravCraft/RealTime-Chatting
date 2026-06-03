// netlify/functions/ably-auth.js
// Issues Ably token requests for authenticated clients
const Ably = require('ably');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const apiKey = process.env.ABLY_API_KEY;

  console.log("ABLY KEY FOUND:", !!apiKey);
  console.log("ABLY KEY LENGTH:", apiKey ? apiKey.length : 0);

  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'ABLY_API_KEY not configured' })
    };
  }

  try {
    const client = new Ably.Rest(apiKey);
    const clientId = event.queryStringParameters?.clientId || 'anonymous';

    const tokenRequest = await new Promise((resolve, reject) => {
  client.auth.createTokenRequest(
    {
      clientId,
      capability: {
        'keychat:public': ['publish', 'subscribe', 'presence'],
        'keychat:rooms:*': ['publish', 'subscribe', 'presence'],
        'keychat:control': ['publish', 'subscribe']
      }
    },
    (err, tokenRequest) => {
      if (err) reject(err);
      else resolve(tokenRequest);
    }
  );
});

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(tokenRequest)
    };
  } catch (err) {
  console.error("ABLY ERROR:", err);

  return {
    statusCode: 500,
    headers,
    body: JSON.stringify({
      error: err.message,
      stack: err.stack
    })
  };
}
};
