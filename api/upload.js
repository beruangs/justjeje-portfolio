import { put } from '@vercel/blob';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

export const config = {
    api: {
        bodyParser: false,
    },
};

function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Run multer middleware
        await runMiddleware(req, res, upload.single('file'));

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const blob = await put(req.file.originalname, req.file.buffer, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        return res.status(200).json({ url: blob.url });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: error.message });
    }
}
