const { sheets, spreadsheetId } = require('../config/googleSheets');
const { v4: uuidv4 } = require('uuid');

const getThailandTime = () => {
  const d = new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const nd = new Date(utc + (3600000 * 7));
  return nd.toISOString().replace('Z', '+07:00');
};

const formatDate = (val) => {
  if (!val) return '';
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(val).substring(0, 10);
};

const ACCOUNT_SHEET = process.env.BILL_ACCOUNT_SHEET_NAME || 'BillAccounts';

class AccountService {
  async ensureSheet() {
    try {
      await sheets.spreadsheets.get({ spreadsheetId, ranges: [ACCOUNT_SHEET] });
    } catch {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{ addSheet: { properties: { title: ACCOUNT_SHEET } } }],
        },
      });
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${ACCOUNT_SHEET}!A1`,
        valueInputOption: 'RAW',
        resource: { values: [['ID', 'Name', 'Type', 'Balance', 'Icon', 'Color', 'CreatedAt', 'Currency']] },
      });
    }
  }

  async getAll() {
    await this.ensureSheet();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${ACCOUNT_SHEET}!A2:H`,
    });

    const rows = response.data.values || [];
    return rows
      .filter(row => row.length > 0 && row[0])
      .map(row => ({
        id: row[0] || '',
        name: row[1] || '',
        type: row[2] || 'wallet',
        balance: parseFloat(row[3]) || 0,
        icon: row[4] || '',
        color: row[5] || '#0984e3',
        createdAt: row[6] || '',
        currency: row[7] || 'THB',
      }));
  }

  async create(data) {
    await this.ensureSheet();
    const id = uuidv4().substring(0, 8);
    const now = getThailandTime();
    const newRow = [id, data.name, data.type || 'wallet', data.balance || 0, data.icon || '', data.color || '#0984e3', now, data.currency || 'THB'];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${ACCOUNT_SHEET}!A:H`,
      valueInputOption: 'RAW',
      resource: { values: [newRow] },
    });

    return { id, ...data, balance: data.balance || 0, createdAt: now };
  }

  async update(id, data) {
    const all = await this.getAll();
    const index = all.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Account not found');

    const sheetId = await this._getSheetId();
    const rowIndex = index + 2;
    const current = all[index];
    const updatedRow = [
      id,
      data.name !== undefined ? data.name : current.name,
      data.type !== undefined ? data.type : current.type,
      data.balance !== undefined ? data.balance : current.balance,
      data.icon !== undefined ? data.icon : current.icon,
      data.color !== undefined ? data.color : current.color,
      current.createdAt,
      data.currency !== undefined ? data.currency : current.currency,
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${ACCOUNT_SHEET}!A${rowIndex}:H${rowIndex}`,
      valueInputOption: 'RAW',
      resource: { values: [updatedRow] },
    });

    return { id, ...data };
  }

  async updateBalance(id, amount) {
    const all = await this.getAll();
    const index = all.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Account not found');

    const newBalance = all[index].balance + amount;
    return this.update(id, { balance: newBalance });
  }

  async delete(id) {
    const all = await this.getAll();
    const index = all.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Account not found');

    const sheetId = await this._getSheetId();
    const rowIndex = index + 1;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [{
          deleteDimension: {
            range: { sheetId, dimension: 'ROWS', startIndex: rowIndex, endIndex: rowIndex + 1 },
          },
        }],
      },
    });

    return { id };
  }

  async _getSheetId() {
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = meta.data.sheets.find(s => s.properties.title === ACCOUNT_SHEET);
    return sheet ? sheet.properties.sheetId : 0;
  }
}

module.exports = new AccountService();
