import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { del } from '@vercel/blob';

const router = express.Router();
async function getDb() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI is not defined in environment variables');
    }
    const client = await MongoClient.connect(uri);
    return client.db('justjeje-portfolio');
}

// Get all projects or single by ID (Query Param support like Vercel)
router.get('/', async (req, res) => {
    try {
        const db = await getDb();
        const { id } = req.query;

        if (id) {
            // Single ID fetch
            let query = {};
            if (ObjectId.isValid(id)) {
                query = { $or: [{ _id: new ObjectId(id) }, { id: id }] };
            } else {
                query = { id: id };
            }
            const project = await db.collection('projects').findOne(query);
            if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
            return res.json({ success: true, data: { ...project, id: project._id.toString(), _id: undefined } });
        }

        // List all
        const all = await db.collection('projects').find({}).sort({ createdAt: -1 }).toArray();
        res.json({ success: true, data: all.map(p => ({ ...p, id: p._id.toString(), _id: undefined })) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Add new project
router.post('/', async (req, res) => {
    try {
        const db = await getDb();
        const result = await db.collection('projects').insertOne({
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const created = await db.collection('projects').findOne({ _id: result.insertedId });
        res.json({ success: true, data: { ...created, id: created._id.toString(), _id: undefined } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete project (Query Param support like Vercel)
router.delete('/', async (req, res) => {
    try {
        const db = await getDb();
        const { id } = req.query;

        if (!id) return res.status(400).json({ success: false, message: 'ID required' });

        const query = ObjectId.isValid(id) ? { $or: [{ _id: new ObjectId(id) }, { id: id }] } : { id: id };

        // Find existing project to get image URLs
        const project = await db.collection('projects').findOne(query);

        if (project) {
            // Collect all potential blob URLs to delete
            const urlsToDelete = [];

            // Check Thumbnail
            if (project.thumbnail && project.thumbnail.includes('.public.blob.vercel-storage.com')) {
                urlsToDelete.push(project.thumbnail);
            }
            // Check Photos 1-3
            for (let i = 1; i <= 3; i++) {
                const photoUrl = project[`photo${i}`];
                if (photoUrl && photoUrl.includes('.public.blob.vercel-storage.com')) {
                    urlsToDelete.push(photoUrl);
                }
            }

            // Delete blobs if any
            if (urlsToDelete.length > 0) {
                try {
                    await del(urlsToDelete, { token: process.env.BLOB_READ_WRITE_TOKEN });
                    console.log('Deleted blobs:', urlsToDelete);
                } catch (blobError) {
                    console.error('Failed to delete blobs:', blobError);
                    // Continue to delete db entry anyway
                }
            }

            await db.collection('projects').deleteOne(query);
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Legacy path param delete
router.delete('/:id', async (req, res) => {
    try {
        const db = await getDb();
        const id = req.params.id;
        await db.collection('projects').deleteOne({
            $or: [
                { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
                { id: id }
            ].filter(q => q !== null)
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
