class ReportService {
  async getReports(query) {
    throw new Error('getReports not implemented');
  }

  async getReport(id) {
    throw new Error('getReport not implemented');
  }

  async createReport(data) {
    throw new Error('createReport not implemented');
  }

  async generateReport(reportId) {
    throw new Error('generateReport not implemented');
  }

  async downloadReport(id) {
    throw new Error('downloadReport not implemented');
  }

  async deleteReport(id) {
    throw new Error('deleteReport not implemented');
  }
}

module.exports = new ReportService();
