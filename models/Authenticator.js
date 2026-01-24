import mongoose from 'mongoose';

const authenticatorSchema = new mongoose.Schema({
    // Since we only have one admin, we can link this to 'admin' username 
    username: {
        type: String,
        required: true,
    },
    // WebAuthn Credentials
    credentialID: {
        type: String,
        required: true,
        unique: true
    },
    credentialPublicKey: {
        type: String, // Stored as base64 or bytes
        required: true
    },
    counter: {
        type: Number,
        required: true
    },
    deviceType: {
        type: String,
        required: true
    },
    backedUp: {
        type: Boolean,
        required: true
    },
    transports: [String],
}, { timestamps: true });

const Authenticator = mongoose.model('Authenticator', authenticatorSchema);

export default Authenticator;
