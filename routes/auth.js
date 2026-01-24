import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import Authenticator from '../models/Authenticator.js';
import Challenge from '../models/Challenge.js';

const router = express.Router();

// Configuration
const rpName = 'Just Jeje Admin';
const rpID = process.env.RP_ID || 'localhost';
const origin = process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * REGISTRATION
 */
router.get('/passkey/register-options', async (req, res) => {
  // Ensure user is logged in via normal auth first to register a key
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
    const username = decoded.username;

    // Get existing authenticators to exclude them
    const userAuthenticators = await Authenticator.find({ username });

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new Uint8Array(Buffer.from(username)),
      userName: username,
      // Don't exclude credentials, allow multiple devices
      // excludeCredentials: userAuthenticators.map(authenticator => ({
      //   id: authenticator.credentialID,
      //   type: 'public-key',
      //   transports: authenticator.transports,
      // })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'cross-platform',
      },
    });

    // Save challenge
    await Challenge.create({
      username,
      challenge: options.challenge,
    });

    res.json(options);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/passkey/register-verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
    const username = decoded.username;
    const { body } = req;

    // Retrieve challenge
    const challengeData = await Challenge.findOne({ username }).sort({ createdAt: -1 });
    if (!challengeData) {
      return res.status(400).json({ error: 'Challenge not found or expired' });
    }

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge: challengeData.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: error.message });
    }

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
      const { credentialPublicKey, credentialID, counter } = registrationInfo;

      const newAuthenticator = new Authenticator({
        username,
        credentialID: Buffer.from(credentialID).toString('base64url'),
        credentialPublicKey: Buffer.from(credentialPublicKey).toString('base64url'),
        counter,
        deviceType: registrationInfo.credentialDeviceType,
        backedUp: registrationInfo.credentialBackedUp,
        transports: body.response.transports,
      });

      await newAuthenticator.save();

      // Cleanup challenge
      await Challenge.deleteOne({ _id: challengeData._id });

      res.json({ verified: true });
    } else {
      res.status(400).json({ verified: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * AUTHENTICATION
 */
router.get('/passkey/auth-options', async (req, res) => {
  try {
    const username = process.env.ADMIN_USERNAME || 'admin'; // Target the single admin

    // Check if user has passkeys
    const userAuthenticators = await Authenticator.find({ username });
    if (userAuthenticators.length === 0) {
      return res.status(400).json({ error: 'No passkeys found for admin' });
    }

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: userAuthenticators.map(authenticator => ({
        id: Buffer.from(authenticator.credentialID, 'base64url'),
        type: 'public-key',
        transports: authenticator.transports,
      })),
      userVerification: 'preferred',
    });

    // Save challenge
    await Challenge.create({
      username,
      challenge: options.challenge,
    });

    res.json(options);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/passkey/auth-verify', async (req, res) => {
  try {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const { body } = req;

    const challengeData = await Challenge.findOne({ username }).sort({ createdAt: -1 });
    if (!challengeData) {
      return res.status(400).json({ error: 'Challenge not found or expired' });
    }

    const authenticator = await Authenticator.findOne({
      credentialID: body.id
    });

    if (!authenticator) {
      return res.status(400).json({ error: 'Authenticator not found' });
    }

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge: challengeData.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        authenticator: {
          credentialID: Buffer.from(authenticator.credentialID, 'base64url'),
          credentialPublicKey: Buffer.from(authenticator.credentialPublicKey, 'base64url'),
          counter: authenticator.counter,
          transports: authenticator.transports,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ error: err.message });
    }

    const { verified, authenticationInfo } = verification;

    if (verified) {
      // Update counter
      authenticator.counter = authenticationInfo.newCounter;
      await authenticator.save();

      // Cleanup challenge
      await Challenge.deleteOne({ _id: challengeData._id });

      // Generate Login Token
      const token = jwt.sign(
        { username: username, role: 'admin' },
        process.env.JWT_SECRET || 'default-secret-key',
        { expiresIn: '7d' }
      );

      res.json({ verified: true, token, user: { username, role: 'admin' } });
    } else {
      res.status(400).json({ verified: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});



// Login endpoint
router.post('/', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password harus diisi'
      });
    }

    // Check credentials from environment variables
    const validUsername = process.env.ADMIN_USERNAME || 'admin';
    const validPassword = process.env.ADMIN_PASSWORD || 'justjeje2025';

    if (username !== validUsername || password !== validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah!'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { username: validUsername, role: 'admin' },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login berhasil',
      token,
      user: { username: validUsername, role: 'admin' }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
});

// Verify token endpoint
router.get('/', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');

    res.json({
      success: true,
      user: decoded
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token tidak valid'
    });
  }
});

export default router;
