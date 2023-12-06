const express = require('express');
const { connect, grpc } = require('./lnd.js');
const cors = require('cors');
const lightningRouter = require("./lightning/lightningRouter.js")

const server = express();

server.use(express.json());

server.use(cors());

connect();

server.get("/", (req, res) => {
    res.status(200).json({message: 'Welcome! Connection Status ' + grpc.state});
});

server.use("/lightning", lightningRouter);

module.exports = server;