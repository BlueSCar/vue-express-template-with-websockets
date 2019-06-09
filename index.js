const amqp = require('amqplib');
const bluebird = require('bluebird');
const dotenv = require('dotenv');
const express = require('express');
const http = require('http');
const passport = require('passport');
const pgp = require('pg-promise');
const socket = require('socket.io');

const dbConfig = require('./server/database');
const expressConfig = require('./server/express');
const passportConfig = require('./server/passport');
const rabbitConfig = require('./server/rabbit');
const consumerConfig = require('./server/consumers');

(async () => {
    dotenv.config();

    const serverPort = process.env.SERVER_PORT;

    const db = dbConfig(bluebird, pgp);
    const rabbit = await rabbitConfig(amqp);
    passportConfig(passport, db, rabbit);

    const app = express();
    const httpApp = http.Server(app);

    httpApp.listen(serverPort, console.log(`Server running on port ${serverPort}`));

    const io = socket(httpApp);

    await consumerConfig(rabbit.channel, io);

    await expressConfig(express, app, db, rabbit, io, passport);
})().catch(console.error);
