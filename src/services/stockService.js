const { sheets, spreadsheetId, sheetName } = require('../config/googleSheets');
const { v4: uuidv4 } = require('uuid');
const activityService = require('./activityService');

class StockService {
  async getAll(page = 1, limit = 10, search = '', sortBy = '', order = 'asc') {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:E`, // Assuming A=ID, B=Name, C=Qty, D=Price, E=UpdatedAt
    });

    let rows = response.data.values || [];
    
    // Filter out empty rows and map to objects
    let items = rows
      .filter(row => row.length > 0 && row[0]) // Ensure row has at least an ID
      .map(row => ({
        id: row[0] || '',
        name: row[1] || 'Unknown',
        qty: parseInt(row[2]) || 0,
        price: parseFloat(row[3]) || 0,
        updatedAt: row[4] || new Date().toISOString()
      }));

    // Search filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(lowerSearch) || 
        item.id.toLowerCase().includes(lowerSearch)
      );
    }

    // Server-side Sorting
    if (sortBy) {
      items.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (order === 'desc') {
          return valA > valB ? -1 : 1;
        } else {
          return valA > valB ? 1 : -1;
        }
      });
    }

    // Pagination
    const total = items.length;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedItems = items.slice(startIndex, endIndex);

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

  async create(data) {
    const id = uuidv4();
    const updatedAt = new Date().toISOString();
    const newRow = [id, data.name, data.qty, data.price, updatedAt];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:E`,
      valueInputOption: 'RAW',
      resource: { values: [newRow] },
    });

    // Log activity
    await activityService.log({
      stockId: id,
      stockName: data.name,
      type: 'create',
      diff: data.qty,
      finalQty: data.qty,
      price: data.price,
      performer: data.performer
    });

    return { id, ...data, updatedAt };
  }

  async update(id, data) {
    const all = await this.getAll(1, 10000); // Fetch all to find index
    const index = all.data.findIndex(item => item.id === id);
    
    if (index === -1) throw new Error('Item not found');

    const rowIndex = index + 2; // +2 because of header and 1-based indexing
    const updatedAt = new Date().toISOString();
    
    const currentRow = all.data[index];
    const updatedRow = [
      id,
      data.name !== undefined ? data.name : currentRow.name,
      data.qty !== undefined ? data.qty : currentRow.qty,
      data.price !== undefined ? data.price : currentRow.price,
      updatedAt
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A${rowIndex}:E${rowIndex}`,
      valueInputOption: 'RAW',
      resource: { values: [updatedRow] },
    });

    // Log activity
    await activityService.log({
      stockId: id,
      stockName: data.name !== undefined ? data.name : currentRow.name,
      type: data.qty !== undefined ? 'qtyChange' : 'update',
      diff: data.qty !== undefined ? (data.qty - currentRow.qty) : 0,
      finalQty: data.qty !== undefined ? data.qty : currentRow.qty,
      price: data.price !== undefined ? data.price : currentRow.price,
      performer: data.performer
    });

    return { id, ...data, updatedAt };
  }

  async delete(id) {
    const all = await this.getAll(1, 10000);
    const index = all.data.findIndex(item => item.id === id);
    
    if (index === -1) throw new Error('Item not found');

    const currentStock = all.data[index];
    const rowIndex = index + 1; // 0-based index for deleteDimension

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0, 
                dimension: 'ROWS',
                startIndex: rowIndex,
                endIndex: rowIndex + 1
              }
            }
          }
        ]
      }
    });

    // Log activity
    await activityService.log({
      stockId: id,
      stockName: currentStock.name,
      type: 'delete',
      diff: -currentStock.qty,
      finalQty: 0,
      price: currentStock.price,
      performer: data.performer
    });

    return { id };
  }
}

module.exports = new StockService();
