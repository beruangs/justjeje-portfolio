import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';

const router = express.Router();
const MONGODB_URI = process.env.MONGODB_URI;

async function getDb() {
    const client = await MongoClient.connect(MONGODB_URI);
    return client.db('justjeje-portfolio');
}

// Get all projects
router.get('/', async (req, res) => {
    try {
        const db = await getDb();
        const all = await db.collection('projects').find({}).toArray();
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

// Delete project
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
