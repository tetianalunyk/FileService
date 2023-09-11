import { default as FileController } from '../FileController';
import mongoose from 'mongoose';
import fs from 'fs';

const httpMocks = require('node-mocks-http');
let req, res, fakeFileService, fileController;

beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    fakeFileService = {
        getFileById: jest.fn(),
        getAllFiles: jest.fn(),
        createFile: jest.fn(),
        updateFile: jest.fn(),
        deleteFile: jest.fn()
    };
    fileController = new FileController(fakeFileService);
});

describe('fileController.getFile', () => {
    it('should have a getFile function', () => {
        expect(typeof fileController.getFile).toBe('function');
    });

    it('should return error 400 when ID is not correct', async () => {
        // Arrange
        req.params.id = 'incorrectID';
        
        // Act
        await fileController.getFile(req, res);

        // Assert
        expect(res.statusCode).toBe(400);
        expect(fakeFileService.getFileById).toBeCalledTimes(0);
    });
    
    it('should return error 400 when file does not exist', async () => {
        // Arrange
        fakeFileService.getFileById.mockReturnValue(null);
        req.params.id = mongoose.Types.ObjectId();
        
        // Act
        await fileController.getFile(req, res);

        // Assert
        expect(res.statusCode).toBe(400);
        expect(fakeFileService.getFileById).toBeCalledTimes(1);
    });

    it('should return status 200 when ID is correct and file exists', async () => {
        // Arrange
        const fakeFile = {
            path: 'path',
            metadata: 'metadata'
        };
        fakeFileService.getFileById.mockReturnValue(fakeFile);
        req.params.id = mongoose.Types.ObjectId();
        res.sendFile = jest.fn();
        
        // Act
        await fileController.getFile(req, res);

        // Assert
        expect(res.statusCode).toBe(200);
        expect(fakeFileService.getFileById).toBeCalledTimes(1);
        expect(res.sendFile).toBeCalledWith('path', {metadata: 'metadata'});
    });
});

describe('fileController.getAllFiles', () => {
    it('should have a getAllFiles function', () => {
        expect(typeof fileController.getFile).toBe('function');
    });

    it('should return error 400 when there are no files', async () => {
        // Arrange
        fakeFileService.getAllFiles.mockReturnValue(null);
        
        // Act
        await fileController.getAllFiles(req, res);

        // Assert
        expect(res.statusCode).toBe(400);
        expect(fakeFileService.getAllFiles).toBeCalledTimes(1);
    });

    it('should return status 200 and all files when files exist', async () => {
        // Arrange
        const fakeFiles = ['file', 'file', 'file'];

        fakeFileService.getAllFiles.mockReturnValue(fakeFiles);
        
        // Act
        await fileController.getAllFiles(req, res);

        // Assert
        expect(res.statusCode).toBe(200);
        expect(fakeFileService.getAllFiles).toBeCalledTimes(1);
        expect(res._getJSONData()).toStrictEqual({
            files: fakeFiles
        });
    });
});

describe('fileController.createFile', () => {
    it('should have a createFile function', () => {
        expect(typeof fileController.createFile).toBe('function');
    });

    it('should return error 400 when there is no file passed', async () => {
        // Arrange
        fakeFileService.createFile.mockReturnValue(null);
        req.files.file = null;

        // Act
        await fileController.createFile(req, res);

        // Assert
        expect(res.statusCode).toBe(400);
        expect(fakeFileService.createFile).toBeCalledTimes(0);
    });

    it('should return status 200 and file when file created sucessfully', async () => {
        // Arrange
        const fakeFile = {
            path: 'path',
            metadata: 'metadata',
            mv: jest.fn()
        };
        req.files.file = fakeFile;
        res.sendFile = jest.fn();

        fakeFileService.createFile.mockReturnValue(fakeFile);
        
        // Act
        await fileController.createFile(req, res);

        // Assert
        expect(res.statusCode).toBe(201);
        expect(fakeFileService.createFile).toBeCalledTimes(1);
        expect(fakeFile.mv).toBeCalledWith(fakeFile.path);
        expect(fakeFile.mv).toBeCalledTimes(1);

    });

    it('should return status 400 when file not created', async () => {
        // Arrange
        const fakeFile = {
            path: 'path',
            metadata: 'metadata',
            mv: jest.fn()
        };
        req.files.file = fakeFile;
        res.sendFile = jest.fn();

        fakeFileService.createFile.mockReturnValue(null);
        
        // Act
        await fileController.createFile(req, res);

        // Assert
        expect(res.statusCode).toBe(400);
        expect(fakeFileService.createFile).toBeCalledTimes(1);
        expect(fakeFile.mv).toBeCalledTimes(0);
        expect(res.sendFile).toBeCalledTimes(0);

    });
});

describe('fileController.updateFile', () => {
    it('should have a updateFile function', () => {
        expect(typeof fileController.updateFile).toBe('function');
    });

    it('should return error 400 when ID is not correct', async () => {
        // Arrange
        req.params.id = 'incorrectID';
        
        // Act
        await fileController.getFile(req, res);

        // Assert
        expect(res.statusCode).toBe(400);
        expect(fakeFileService.updateFile).toBeCalledTimes(0);
    });

    it('should return error 400 when there is no file passed', async () => {
        // Arrange
        fakeFileService.updateFile.mockReturnValue(null);
        req.files.file = null;

        // Act
        await fileController.updateFile(req, res);

        // Assert
        expect(res.statusCode).toBe(400);
        expect(fakeFileService.updateFile).toBeCalledTimes(0);
    });

    it('should return status 200 and file when file updated sucessfully', async () => {
        // Arrange
        const fakeFile = {
            path: 'path',
            metadata: 'metadata',
            mv: jest.fn()
        };
        req.files.file = fakeFile;
        req.params.id = mongoose.Types.ObjectId();
        res.sendFile = jest.fn();
        fs.rmSync = jest.fn();

        fakeFileService.updateFile.mockReturnValue(fakeFile);
        
        // Act
        await fileController.updateFile(req, res);

        // Assert
        expect(res.statusCode).toBe(200);
        expect(fakeFileService.updateFile).toBeCalledTimes(1);
        expect(fakeFile.mv).toBeCalledWith(fakeFile.path);
        expect(fakeFile.mv).toBeCalledTimes(1);
        expect(res.sendFile).toBeCalledTimes(1);

    });

    it('should return status 400 when file not updated', async () => {
        // Arrange
        const fakeFile = {
            path: 'path',
            metadata: 'metadata',
            mv: jest.fn()
        };
        req.files.file = fakeFile;
        req.params.id = mongoose.Types.ObjectId();
        res.sendFile = jest.fn();

        fakeFileService.updateFile.mockReturnValue(null);
        
        // Act
        await fileController.updateFile(req, res);

        // Assert
        expect(res.statusCode).toBe(400);
        expect(fakeFileService.updateFile).toBeCalledTimes(1);
        expect(fakeFile.mv).toBeCalledTimes(0);
        expect(res.sendFile).toBeCalledTimes(0);

    });
});

describe('fileController.deleteFile', () => {
    it('should have a getFile function', () => {
        expect(typeof fileController.deleteFile).toBe('function');
    });

    it('should return error 400 when ID is not correct', async () => {
        // Arrange
        req.params.id = 'incorrectID';
        
        // Act
        await fileController.deleteFile(req, res);

        // Assert
        expect(res.statusCode).toBe(400);
        expect(fakeFileService.deleteFile).toBeCalledTimes(0);
    });
    
    it('should return error 400 when file does not exist', async () => {
        // Arrange
        fakeFileService.deleteFile.mockReturnValue(null);
        req.params.id = mongoose.Types.ObjectId();
        
        // Act
        await fileController.deleteFile(req, res);

        // Assert
        expect(res.statusCode).toBe(400);
        expect(fakeFileService.deleteFile).toBeCalledTimes(1);
    });

    it('should return status 200 when ID is correct and file exists', async () => {
        // Arrange
        const fakeFile = {
            path: 'path',
            metadata: 'metadata'
        };
        fakeFileService.deleteFile.mockReturnValue(fakeFile);
        req.params.id = mongoose.Types.ObjectId();
        res.sendFile = jest.fn();
        fs.rmSync = jest.fn();
        
        // Act
        await fileController.deleteFile(req, res);

        // Assert
        expect(res.statusCode).toBe(200);
        expect(fakeFileService.deleteFile).toBeCalledTimes(1);
    });
});
