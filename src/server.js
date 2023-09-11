import { PORT, MONGO_URL, TEMP } from './config.js';
import express from 'express';
import { connect } from 'mongoose';
import fileUpload from 'express-fileupload';
import fs from 'fs';
import cors from 'cors';
import https from 'https';

const app = express();
connect(MONGO_URL);

app.use(cors());

const fileRouter = require('./routes/fileRoutes');

app.use(express.json());

app.use(fileUpload({
    createParentPath: true
}));

app.use('/', fileRouter);

app.get('*', (req, res) => {
    res.send({
        error: 'PAGE NOT FOUND'
    });
});

// const options = {
//     key: fs.readFileSync('D:/WebEducationalCourse/cert/certs_with_client/server-key.pem'),
//     cert: fs.readFileSync('D:/WebEducationalCourse/cert/certs_with_client/server-crt.pem'),
//     requestCert: true,
//     rejectUnauthorized: false,
//     ca: fs.readFileSync('D:/WebEducationalCourse/cert/certs_with_client/ca-crt.pem')
// };

const options = {
    key: fs.readFileSync('D:/WebEducationalCourse/cert/cert_test/server-key.pem'),
    cert: fs.readFileSync('D:/WebEducationalCourse/cert/cert_test/server-crt.pem'),
    requestCert: true,
    rejectUnauthorized: false,
    ca: fs.readFileSync('D:/WebEducationalCourse/cert/cert_test/ca-crt.pem')
};

const server = https.createServer(options, app);

server.listen(PORT, () => {
    fs.access(TEMP, fs.constants.F_OK, err => {
        if (err) {
            console.log(`Access to ${TEMP} is denied\n ${err}`);
        }

        console.log(`Access to ${TEMP} is allowed`);
    });
    console.log(`Example app listening on the port ${PORT}`);
});