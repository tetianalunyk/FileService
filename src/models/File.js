import mongoose, { Schema } from 'mongoose';

const fileSchema = new Schema({
    path: { type: String,
        required: true
    },
    metadata: {
        size: Number,
        name: { type: String,
            required: true
        },
        mimetype: { type: String,
            required: true
        },
        encoding: { type: String,
            required: true
        },
    }
}, { timestamps: true });

const File = mongoose.model('File', fileSchema);

export default File;