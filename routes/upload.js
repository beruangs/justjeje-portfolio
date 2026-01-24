import express from 'express';
import multer from 'multer';
import { put } from '@vercel/blob';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const blob = await put(req.file.originalname, req.file.buffer, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        res.json({ url: blob.url });
    } catch (error) {
        console.error('Blob Upload Error:', error);
        res.status(500).json({ error: 'Failed to upload file to storage' });
    }
});

export default router;
