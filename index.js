const server = require('./server.js');
const { connect, grpc } = require('./server.js');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.HTTP_PORT || 5000;

server.listen(PORT, () => {
    console.log('HTTP Server listening on port ', PORT);
})