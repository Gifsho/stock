const { sheets, spreadsheetId, billSheetName, billGoalSheetName } = require('../config/googleSheets');
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

class BillService {
  // ========== Transactions ==========

  async getAllTransactions(page = 1, limit = 50, search = '', sortBy = '', order = 'asc', filterMonth = '', filterCategory = '') {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${billSheetName}!A2:H`,
    });

    let rows = response.data.values || [];

    let items = rows
      .filter(row => row.length > 0 && row[0])
      .map(row => ({
        id: row[0] || '',
        date: formatDate(row[1]),
        description: row[2] || '',
        amount: parseFloat(row[3]) || 0,
        type: row[4] || '',
        category: row[5] || '',
        note: row[6] || '',
        createdAt: row[7] || ''
      }));

    if (search) {
      const lower = search.toLowerCase();
      items = items.filter(item =>
        item.description.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower)
      );
    }

    if (filterMonth) {
      items = items.filter(item => item.date.startsWith(filterMonth));
    }

    if (filterCategory) {
      items = items.filter(item => item.category === filterCategory);
    }

    if (sortBy) {
      items.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        return order === 'desc' ? (valA > valB ? -1 : 1) : (valA > valB ? 1 : -1);
      });
    }

    const total = items.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, page * limit);

    return {
      data: paginatedItems,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async createTransaction(data) {
    const id = uuidv4().substring(0, 8);
    const now = getThailandTime();
    const newRow = [id, data.date, data.description, data.amount, data.type, data.category, data.note || '', now];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${billSheetName}!A:H`,
      valueInputOption: 'RAW',
      resource: { values: [newRow] },
    });

    return { id, ...data, createdAt: now };
  }

  async updateTransaction(id, data) {
    const all = await this.getAllTransactions(1, 10000);
    const index = all.data.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Transaction not found');

    const rowIndex = index + 2;
    const currentRow = all.data[index];
    const updatedRow = [
      id,
      data.date !== undefined ? data.date : currentRow.date,
      data.description !== undefined ? data.description : currentRow.description,
      data.amount !== undefined ? data.amount : currentRow.amount,
      data.type !== undefined ? data.type : currentRow.type,
      data.category !== undefined ? data.category : currentRow.category,
      data.note !== undefined ? data.note : currentRow.note,
      currentRow.createdAt
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${billSheetName}!A${rowIndex}:H${rowIndex}`,
      valueInputOption: 'RAW',
      resource: { values: [updatedRow] },
    });

    return { id, ...data };
  }

  async deleteTransaction(id) {
    const all = await this.getAllTransactions(1, 10000);
    const index = all.data.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Transaction not found');

    const rowIndex = index + 1;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: 0,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1
            }
          }
        }]
      }
    });

    return { id };
  }

  // ========== Goals ==========

  async getAllGoals() {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${billGoalSheetName}!A2:E`,
    });

    const rows = response.data.values || [];
    return rows
      .filter(row => row.length > 0 && row[0])
      .map(row => ({
        id: row[0] || '',
        name: row[1] || '',
        target: parseFloat(row[2]) || 0,
        deadline: formatDate(row[3]),
        createdAt: row[4] || ''
      }));
  }

  async createGoal(data) {
    const id = uuidv4().substring(0, 8);
    const now = getThailandTime();
    const newRow = [id, data.name, data.target, data.deadline || '', now];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${billGoalSheetName}!A:E`,
      valueInputOption: 'RAW',
      resource: { values: [newRow] },
    });

    return { id, ...data, createdAt: now };
  }

  async deleteGoal(id) {
    const goals = await this.getAllGoals();
    const index = goals.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Goal not found');

    const rowIndex = index + 1;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: 0,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1
            }
          }
        }]
      }
    });

    return { id };
  }
}

module.exports = new BillService();
