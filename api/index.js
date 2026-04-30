const app = require('../src/app');

// Vercel handles the listening part for serverless functions
// We just need to export the express app
module.exports = app;
