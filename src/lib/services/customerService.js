import api from "@/lib/api/api";

// Task APIs
export const taskService = {
  // Get task detail by ID
  getTaskDetail: async (taskId) => {
    const response = await api.get(`/task/${taskId}`);
    return response.data;
  },
};

// Address APIs
export const addressService = {
  // Get my addresses
  getMyAddresses: async () => {
    const response = await api.get('/user/addresses/my');
    return response.data;
  },

  // Add new address
  addAddress: async (addressData) => {
    const response = await api.post('/user/addresses', addressData);
    return response.data;
  },

  // Update address
  updateAddress: async (addressId, addressData) => {
    const response = await api.put(`/user/addresses/${addressId}`, addressData);
    return response.data;
  },

  // Delete address
  deleteAddress: async (addressId) => {
    const response = await api.delete(`/user/addresses/${addressId}`);
    return response.data;
  },
};

// Order APIs
export const orderService = {
  // Create order
  createOrder: async (orderData) => {
    const response = await api.post('/order/create', orderData);
    return response.data;
  },

  // Get order details
  getOrderDetails: async (orderId) => {
    const response = await api.get(`/order/${orderId}`);
    return response.data;
  },

  // Create receipt for order
  createReceipt: async (orderId, paymentMethod) => {
    const response = await api.post('/order/receipt/add', {
      order_id: orderId,
      payment_method: paymentMethod,
    });
    return response.data;
  },

  // Get my orders
  getMyOrders: async () => {
    const response = await api.get('/order/my-orders');
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    const response = await api.put(`/order/cancel/${orderId}`, { reason });
    return response.data;
  },
};

// Voucher/Discount APIs
export const voucherService = {
  // Get eligible vouchers
  getEligibleVouchers: async (totalAmount) => {
    const response = await api.post('/discount/voucher/eligible-list', {
      total_amount: totalAmount,
    });
    return response.data;
  },

  // Apply voucher
  applyVoucher: async (voucherCode, totalAmount) => {
    const response = await api.post('/discount/voucher/apply', {
      voucher_code: voucherCode,
      total_amount: totalAmount,
    });
    return response.data;
  },
};

// Payment/Transaction APIs
export const paymentService = {
  // Create payment link (PayOS)
  createPaymentLink: async (customerId, transactionData) => {
    const response = await api.post(
      `/transaction/paymentLink/${customerId}`,
      transactionData
    );
    return response.data;
  },

  // Check payment status
  checkPaymentStatus: async (orderCode) => {
    const response = await api.get(
      `/transaction/payment-status/${orderCode}`
    );
    return response.data;
  },
};

export default {
  addressService,
  orderService,
  voucherService,
  paymentService,
};
