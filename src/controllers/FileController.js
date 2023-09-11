import fs from 'fs';
import mongoose from 'mongoose';
import FileService from '../services/fileService';
import { TEMP } from '../config';

const httpStatus = require('http-status');

export default class FileController {

    constructor(fileService = new FileService()) {
        this.path = TEMP;
        this.getAllFiles = this.getAllFiles.bind(this);
        this.getFile = this.getFile.bind(this);
        this.createFile = this.createFile.bind(this);
        this.updateFile = this.updateFile.bind(this);
        this.deleteFile = this.deleteFile.bind(this);
        this.fileService = fileService;
    }

    async getAllFiles(req, res) {
        const files = await this.fileService.getAllFiles(); 
        if (files) {
            res.json(httpStatus.OK, {
                files
            });
        } else {
            return res.json(httpStatus.BAD_REQUEST, {
                error: 'Error during getting file'
            });
        }

    }

    async getFile(req, res) {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.json(httpStatus.BAD_REQUEST, {
                error: `Invalid id: ${id}`
            });
        }

        const file = await this.fileService.getFileById(id);
        if (file) {
            return res.sendFile(file.path, {
                metadata: file.metadata
            });
        } else {
            return res.json(httpStatus.BAD_REQUEST, {
                error: 'Error during getting file'
            });
        }
    }

    async createFile(req, res) {
        if(!req.files || !req.files.file) {
            return res.json(httpStatus.BAD_REQUEST, {
                error: 'Invalid file'
            });
        }

        const file = req.files.file;
        const savedFile = await this.fileService.createFile(file);

        if (savedFile) {
            await file.mv(savedFile.path);

            return res.status(httpStatus.CREATED).json(savedFile);
        }
        
        return res.json(httpStatus.BAD_REQUEST, {
            error: 'Error during file saving'
        });
    }

    async updateFile(req, res) {
        if(!req.files || !req.files.file) {
            return res.json(httpStatus.BAD_REQUEST, {
                error: 'Invalid file'
            });
        }

        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.json(httpStatus.BAD_REQUEST, {
                error:  `Invalid id: ${id}`
            });
        }

        const file = req.files.file;
        const updatedFile = await this.fileService.updateFile(id, file);

        if (updatedFile) {
            fs.rmSync(this.path + id, { recursive: true });
            await file.mv(updatedFile.path);

            return res.sendFile(updatedFile.path, {
                metadata: file.metadata
            });
        }
        
        return res.json(httpStatus.BAD_REQUEST, {
            error: 'Error during file updating'
        });
    }

    async deleteFile(req, res) {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.json(httpStatus.BAD_REQUEST, {
                error: `Invalid id: ${id}`
            });
        }

        const file = await this.fileService.deleteFile(id);
        if (file) {
            fs.rmSync(this.path + id, { recursive: true });

            res.json(httpStatus.OK, {
                metadata: null
            });
        } else {
            return res.json(httpStatus.BAD_REQUEST, {
                error: 'Error during file deleting'
            });
        }
    }
}