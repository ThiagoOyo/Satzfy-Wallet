const express = require('express');
const { connect, grpc } = require('./lnd.js');
const cors = require('cors');
const lightningRouter = require("./lightning/lightningRouter.js")
const dotenv = require('dotenv');
const fs = require('fs');
const https = require('https');

dotenv.config();
const server = express();

server.use(express.json());

server.use(cors());

connect();

server.get("/", (req, res) => {
    res.status(200).json({message: 'Welcome! Connection Status ' + grpc.state});
});

const apiKeyMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ error: 'API Key missing' });
    }

    if (apiKey !== process.env.API_KEY) { 
        return res.status(403).json({ error: 'Invalid API Key' });
    }

    next();
};

server.use("/lightning", apiKeyMiddleware, lightningRouter);

const options = {
    key: fs.readFileSync(process.env.HTTPS_KEY), 
    cert: fs.readFileSync(process.env.HTTPS_CERT),
    passphrase: process.env.HTTPS_PASSPHRASE
};

https.createServer(options, server).listen(443, () => {
    console.log('Servidor HTTPS rodando na porta 443');
});


module.exports = server;