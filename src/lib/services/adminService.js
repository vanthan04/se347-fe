import api from "@/lib/api/api";

// Category/Service APIs
export const categoryService = {
  // Get all categories
  getAllCategories: async () => {
    const response = await api.get('/task/service/all');
    return response.data;
  },

  // Create category
  createCategory: async (categoryData) => {
    const response = await api.post('/task/service/create', categoryData);
    return response.data;
  },

  // Update category
  updateCategory: async (categoryId, categoryData) => {
    const response = await api.patch(`/task/service/update/${categoryId}`, categoryData);
    return response.data;
  },

  // Delete category
  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/task/service/delete/${categoryId}`);
    return response.data;
  },
};

// Task/Service APIs
export const taskService = {
  // Get all tasks
  getAllTasks: async () => {
    const response = await api.get('/task/all');
    return response.data;
  },

  // Create task
  createTask: async (taskData) => {
    const response = await api.post('/task/create', taskData);
    return response.data;
  },

  // Update task
  updateTask: async (taskId, taskData) => {
    const response = await api.patch(`/task/update/${taskId}`, taskData);
    return response.data;
  },

  // Delete task
  deleteTask: async (taskId) => {
    const response = await api.delete(`/task/delete/${taskId}`);
    return response.data;
  },
};

// Tasker Management APIs
export const taskerManagementService = {
  // Get all taskers
  getAllTaskers: async () => {
    const response = await api.get('/admin/taskers/all');
    return response.data;
  },

  // Approve tasker
  approveTasker: async (taskerId, data) => {
    const response = await api.patch(`/admin/taskers/approve/${taskerId}`, data);
    return response.data;
  },

  // Reject tasker
  rejectTasker: async (taskerId, data) => {
    const response = await api.patch(`/admin/taskers/reject/${taskerId}`, data);
    return response.data;
  },

  // Update tasker
  updateTasker: async (taskerId, data) => {
    const response = await api.patch(`/admin/taskers/update/${taskerId}`, data);
    return response.data;
  },
};

// Voucher/Discount APIs
export const voucherManagementService = {
  // Get all vouchers
  getAllVouchers: async () => {
    const response = await api.get('/discount/voucher/all');
    return response.data;
  },

  // Get voucher by ID
  getVoucherById: async (voucherId) => {
    const response = await api.get(`/discount/voucher/${voucherId}`);
    return response.data;
  },

  // Create voucher
  createVoucher: async (voucherData) => {
    const response = await api.post('/discount/voucher/create', voucherData);
    return response.data;
  },

  // Update voucher
  updateVoucher: async (voucherId, voucherData) => {
    const response = await api.patch(`/discount/voucher/update/${voucherId}`, voucherData);
    return response.data;
  },

  // Delete voucher
  deleteVoucher: async (voucherId) => {
    const response = await api.delete(`/discount/voucher/delete/${voucherId}`);
    return response.data;
  },

  // Get active services (for voucher creation)
  getActiveServices: async () => {
    const response = await api.get('/task/service/all?status=active&task_status=active&limit=100');
    return response.data;
  },
};

// Invoice APIs
export const invoiceService = {
  // Get all invoices
  getAllInvoices: async () => {
    const response = await api.get('/orders/receipt/all');
    return response.data;
  },

  // Update invoice
  updateInvoice: async (invoiceId, data) => {
    const response = await api.patch(`/orders/receipt/update/${invoiceId}`, data);
    return response.data;
  },

  // Refund invoice
  refundInvoice: async (invoiceId) => {
    const response = await api.post(`/orders/receipt/refund/${invoiceId}`);
    return response.data;
  },
};

// Customer Management APIs
export const customerManagementService = {
  // Get all customers
  getAllCustomers: async () => {
    const response = await api.get('/admin/customers/all');
    return response.data;
  },

  // Update customer
  updateCustomer: async (customerId, data) => {
    const response = await api.patch(`/admin/customers/update/${customerId}`, data);
    return response.data;
  },
};

// Order Management APIs
export const orderManagementService = {
  // Get all orders
  getAllOrders: async () => {
    const response = await api.get('/orders/all');
    return response.data;
  },

  // Update order
  updateOrder: async (orderId, data) => {
    const response = await api.patch(`/orders/update/${orderId}`, data);
    return response.data;
  },
};

// Admin Stats APIs
export const adminStatsService = {
  // Get customer count
  getCustomerCount: async () => {
    const response = await api.get('/admin/customers/count');
    return response.data;
  },

  // Get tasker count
  getTaskerCount: async () => {
    const response = await api.get('/admin/taskers/count');
    return response.data;
  },

  // Get order stats
  getOrderStats: async () => {
    const response = await api.get('/admin/orders/stats');
    return response.data;
  },
};

export default {
  categoryService,
  taskService,
  taskerManagementService,
  voucherManagementService,
  invoiceService,
  customerManagementService,
  orderManagementService,
  adminStatsService,
};
