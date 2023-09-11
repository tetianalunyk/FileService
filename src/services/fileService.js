import mongoose from 'mongoose';
import File from '../models/File';
import { TEMP } from '../config';

export default class FileService {

    constructor() {
        this.path = TEMP;
    }

    getAllFiles() {
        return File.find();
    }

    getFileById(id) {
        return File.findById(id);
    }

    createFile(file) {
        const id = mongoose.Types.ObjectId();
        const pathToFile = this.path + id + '\\' + file.name;

        return File.create({
            _id: id,
            path: pathToFile,
            metadata: file
        });
    }

    updateFile(id, file) {
        const pathToFile = this.path + id + '\\' + file.name;

        return File.findByIdAndUpdate(id, {
            path: pathToFile,
            metadata: file
        }, { new: true });
    }

    deleteFile(id) {
        return File.findByIdAndDelete(id);
    }

    checkIfFileExist(id) {
        return File.exists({ _id: id});
    }
}