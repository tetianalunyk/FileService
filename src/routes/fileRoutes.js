import signed from 'signed';
import express from 'express';
import FileController from '../controllers/FileController';
import { SECRET } from '../config';
import clientCertificateAuth from 'client-certificate-auth';

const fileController = new FileController();
const fileRouter = express.Router();
const signature = signed({
    secret: SECRET
});

fileRouter.route('/get-signed-url').post(
    clientCertificateAuth((cert) => {
        return cert.issuer.O == 'AMC Bridge';
    }), (req, res) => {
        const url = req.body.url;
        const signedUrl = signature.sign(url, {
            ttl: 30
        });
        res.send(signedUrl);
    }
);

fileRouter
    .route('/files/')
    .get(fileController.getAllFiles)
    .post(signature.verifier(), fileController.createFile);

fileRouter
    .route('/files/:id')
    .get(fileController.getFile)
    .put(signature.verifier(), fileController.updateFile)
    .delete(signature.verifier(), fileController.deleteFile);

module.exports = fileRouter;
