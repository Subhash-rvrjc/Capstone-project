#!/usr/bin/env node

/**
 * Simple script to generate a secure JWT secret
 * Usage: node generate-jwt-secret.js
 */

const crypto = require('crypto');

// Generate a random 64-byte hex string
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('🔐 Generated JWT Secret:');
console.log('='.repeat(50));
console.log(jwtSecret);
console.log('='.repeat(50));
console.log('\n📝 Copy this to your .env file as:');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('\n⚠️  Keep this secret secure and never share it!');
