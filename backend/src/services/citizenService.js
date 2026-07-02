class CitizenService {
  async getCitizens(query) {
    throw new Error('getCitizens not implemented');
  }

  async getCitizen(id) {
    throw new Error('getCitizen not implemented');
  }

  async createCitizen(data) {
    throw new Error('createCitizen not implemented');
  }

  async updateCitizen(id, data) {
    throw new Error('updateCitizen not implemented');
  }

  async deleteCitizen(id) {
    throw new Error('deleteCitizen not implemented');
  }

  async updateStatus(id, status, reason) {
    throw new Error('updateStatus not implemented');
  }

  async bulkUpdateStatus(ids, status) {
    throw new Error('bulkUpdateStatus not implemented');
  }

  async getStats() {
    throw new Error('getStats not implemented');
  }

  async export(format, filters) {
    throw new Error('export not implemented');
  }

  async sendTestAlert(id) {
    throw new Error('sendTestAlert not implemented');
  }

  async requestInfo(id, infoType) {
    throw new Error('requestInfo not implemented');
  }

  async getNotificationHistory(id) {
    throw new Error('getNotificationHistory not implemented');
  }
}

module.exports = new CitizenService();
