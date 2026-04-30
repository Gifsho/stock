const { google } = require('googleapis');
require('dotenv').config();

const auth = new google.auth.GoogleAuth({
  // keyFile: "credentials.json",
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: 'v4', auth });

module.exports = {
  sheets,
  spreadsheetId: process.env.GOOGLE_SHEET_ID,
  sheetName: process.env.GOOGLE_SHEET_NAME || 'Sheet1',
  activitySheetName: process.env.ACTIVITY_SHEET_NAME || 'Activities',
};
