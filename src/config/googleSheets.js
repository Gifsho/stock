let sheets, spreadsheetId, sheetName, activitySheetName, billSheetName, billGoalSheetName;

try {
  const { google } = require('googleapis');
  require('dotenv').config();

  const privateKey = process.env.GOOGLE_PRIVATE_KEY 
    ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined;

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  sheets = google.sheets({ version: 'v4', auth });

  spreadsheetId = process.env.GOOGLE_SHEET_ID;
  sheetName = process.env.GOOGLE_SHEET_NAME || 'Sheet1';
  activitySheetName = process.env.ACTIVITY_SHEET_NAME || 'Activities';
  billSheetName = process.env.BILL_SHEET_NAME || 'BillTransactions';
  billGoalSheetName = process.env.BILL_GOAL_SHEET_NAME || 'BillGoals';
} catch (err) {
  console.error('Failed to init Google Sheets:', err.message);
}

module.exports = {
  sheets,
  spreadsheetId,
  sheetName,
  activitySheetName,
  billSheetName,
  billGoalSheetName,
};
