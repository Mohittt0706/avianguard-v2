const Types = {
  PaginationParams: {
    page: 1,
    limit: 20,
    sort: '-createdAt',
  },

  ApiResponse: {
    success: true,
    status: 200,
    message: '',
    data: null,
    pagination: null,
  },

  ErrorResponse: {
    success: false,
    status: 500,
    message: 'Internal server error',
    stack: null,
  },

  QueryFilters: {
    search: '',
    status: '',
    district: '',
    taluka: '',
    village: '',
    wetland: '',
    role: '',
    type: '',
    severity: '',
    startDate: null,
    endDate: null,
  },
};

module.exports = Types;
