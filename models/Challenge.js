import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
    username: { type: String, required: true },
    challenge: { type: String, required: true },
    createdAt: { type: Date, expires: 300, default: Date.now } // Expires in 5 minutes
});

const Challenge = mongoose.model('Challenge', challengeSchema);

export default Challenge;
