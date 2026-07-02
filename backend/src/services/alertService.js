class AlertService {
  async getAlerts(query) {
    throw new Error('getAlerts not implemented');
  }

  async getAlert(id) {
    throw new Error('getAlert not implemented');
  }

  async createAlert(data) {
    throw new Error('createAlert not implemented');
  }

  async acknowledgeAlert(id, userId) {
    throw new Error('acknowledgeAlert not implemented');
  }

  async resolveAlert(id, userId) {
    throw new Error('resolveAlert not implemented');
  }

  async dismissAlert(id) {
    throw new Error('dismissAlert not implemented');
  }

  async getStats() {
    throw new Error('getStats not implemented');
  }

  async evaluateThresholds(sensorType, value, wetlandId) {
    throw new Error('evaluateThresholds not implemented');
  }
}

module.exports = new AlertService();
