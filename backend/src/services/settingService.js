class SettingService {
  async getSettings(category) {
    throw new Error('getSettings not implemented');
  }

  async getSetting(key) {
    throw new Error('getSetting not implemented');
  }

  async updateSetting(key, value, userId) {
    throw new Error('updateSetting not implemented');
  }

  async bulkUpdate(settings, userId) {
    throw new Error('bulkUpdate not implemented');
  }

  async resetSetting(key) {
    throw new Error('resetSetting not implemented');
  }

  async getAlertThresholds() {
    throw new Error('getAlertThresholds not implemented');
  }

  async updateAlertThresholds(thresholds) {
    throw new Error('updateAlertThresholds not implemented');
  }
}

module.exports = new SettingService();
