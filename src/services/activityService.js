const { sheets, spreadsheetId, activitySheetName } = require('../config/googleSheets');

class ActivityService {
  async log(data) {
    // Expected data: { stockId, stockName, type, diff, finalQty, price }
    const timestamp = new Date().toISOString();
    const newRow = [
      timestamp,
      data.stockId,
      data.stockName,
      data.type,
      data.diff,
      data.finalQty,
      data.price,
      data.performer || 'System'
    ];

    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${activitySheetName}!A:H`,
        valueInputOption: 'RAW',
        resource: { values: [newRow] },
      });
    } catch (error) {
      console.error('Failed to log activity to Google Sheet:', error);
      // We don't want to fail the main transaction just because logging failed
    }
  }

  async getAll() {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${activitySheetName}!A2:H`,
    });

    const rows = response.data.values || [];
    return rows.map(row => ({
      timestamp: row[0],
      stockId: row[1],
      stockName: row[2],
      type: row[3],
      diff: parseInt(row[4]) || 0,
      finalQty: parseInt(row[5]) || 0,
      price: parseFloat(row[6]) || 0,
      performer: row[7] || 'System',
    })).reverse(); // Newest first
  }
}

module.exports = new ActivityService();
