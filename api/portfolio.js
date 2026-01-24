import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('justjeje-portfolio');

    cachedClient = client;
    cachedDb = db;

    return { client, db };
}

function verifyToken(req) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
        throw new Error('Unauthorized');
    }

    return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const { db } = await connectToDatabase();
        const projects = db.collection('projects');
        const { id } = req.query;

        // GET all projects or single by ID
        if (req.method === 'GET') {
            if (id) {
                // Try finding by MongoDB ObjectId or legacy string ID
                let query = {};
                if (ObjectId.isValid(id)) {
                    query = { $or: [{ _id: new ObjectId(id) }, { id: id }] };
                } else {
                    query = { id: id };
                }

                const project = await projects.findOne(query);
                if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

                return res.status(200).json({
                    success: true,
                    data: { ...project, id: project._id.toString(), _id: undefined }
                });
            }

            let allProjects = await projects.find({}).toArray();

            // Auto-seed if empty
            if (allProjects.length === 0) {
                try {
                    const jsonPath = path.join(process.cwd(), 'src/data/portfolio.json');
                    if (fs.existsSync(jsonPath)) {
                        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                        const seeded = jsonData.map(p => ({
                            ...p,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }));
                        await projects.insertMany(seeded);
                        allProjects = await projects.find({}).toArray();
                    }
                } catch (seedError) {
                    console.error('Seeding error:', seedError);
                }
            }

            const formatted = allProjects.map(p => ({
                ...p,
                id: p._id.toString(),
                _id: undefined
            }));

            res.status(200).json({ success: true, data: formatted });
        }

        // POST add project or migrate (protected)
        else if (req.method === 'POST') {
            try {
                verifyToken(req);
                const projectData = req.body;

                // SPECIAL ACTION: Migrate from JSON
                if (projectData.action === 'migrate') {
                    const jsonPath = path.join(process.cwd(), 'src/data/portfolio.json');
                    if (fs.existsSync(jsonPath)) {
                        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

                        // Get current IDs to avoid duplicates
                        const currentProjects = await projects.find({}).toArray();
                        const existingIds = currentProjects.map(p => p.id || p._id.toString());

                        const newProjects = jsonData
                            .filter(p => !existingIds.includes(p.id))
                            .map(p => ({
                                ...p,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            }));

                        if (newProjects.length > 0) {
                            await projects.insertMany(newProjects);
                        }

                        return res.status(200).json({
                            success: true,
                            message: `Berhasil migrasi ${newProjects.length} postingan baru.`
                        });
                    }
                    return res.status(404).json({ success: false, message: 'Source JSON not found' });
                }

                // Normal creation
                const newProject = {
                    ...projectData,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                const result = await projects.insertOne(newProject);
                const created = await projects.findOne({ _id: result.insertedId });

                res.status(201).json({
                    success: true,
                    data: { ...created, id: created._id.toString(), _id: undefined }
                });
            } catch (authError) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
            }
        }

        // DELETE project (protected)
        else if (req.method === 'DELETE' && id) {
            try {
                verifyToken(req);
                const result = await projects.deleteOne({
                    $or: [
                        { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
                        { id: id }
                    ].filter(q => q !== null)
                });
                res.status(200).json({ success: true });
            } catch (authError) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
            }
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
