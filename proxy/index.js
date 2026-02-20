const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const mongoUri=`mongodb://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASSWORD)}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
const mongoDbName = process.env.DB_NAME || '';

let mongoClient;
let mongoDb;

async function getDb() {
  if (mongoDb) {
    return mongoDb;
  }
  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in .env');
  }
  mongoClient = await MongoClient.connect(mongoUri);
  mongoDb = mongoClient.db(mongoDbName);
  return mongoDb;
}

app.use('/', async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const subPath = req.path.replace(/^\/+/, '');
    const targetPath = subPath || 'default';
    const base = process.env.APIURL || '';
    var externalApiUrl = `${base.replace(/\/+$/,'')}/${targetPath}`.replace(/([^:]\/)\/+/g, '$1');

    externalApiUrl = externalApiUrl.replace("/api","");

    const db = await getDb();
    const collection = db.collection(targetPath.replace("api/",""));
    const insertResult = await collection.insertOne({
      ...req.body,
      _createdAt: new Date()
    }).then((result) => {
      console.log(`(MongoDB) Inserted document with ID: ${result.insertedId}`);
      return result;
    }).catch((error) => {
      console.error('Error inserting document:', error);
      throw error;
    }).finally(() => {
      mongoClient.close();
      console.log('Conexión cerrada');
    });

    console.log(`Forwarding request to: ${externalApiUrl}`);

    const response = await axios.post(externalApiUrl, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.API_KEY
      }
    });

    res.status(response.status).json({
      proxyResponse: response.data
    });

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
