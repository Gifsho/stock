const activityService = require('../services/activityService');

class ActivityController {
  async getAll(req, res) {
    try {
      const activities = await activityService.getAll();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ActivityController();
