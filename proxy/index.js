const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors()); // Allows your Angular app to talk to this server
app.use(express.json());

// Handle all POST requests under /api without using wildcard patterns
app.use('/', async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  try {
    const subPath = req.path.replace(/^\/+/, '');
    const targetPath = subPath;
    const base = process.env.APIURL || '';
    const externalApiUrl = `${base.replace(/\/+$/,'')}/${targetPath}`.replace(/([^:]\/)\/+/g, '$1');

    console.log(`Forwarding request to: ${externalApiUrl}`);

    console.log(`Request body: ${JSON.stringify(req.body)}`);

    const response = await axios.post(externalApiUrl, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.API_KEY
      }
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy Error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Proxy Error',
      details: error.response?.data || error.message
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Proxy running on http://localhost:${port}`));
