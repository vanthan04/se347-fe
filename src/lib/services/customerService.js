import api from "@/lib/api/api";
import { API_ENDPOINTS } from "@/lib/contants";

// Profile APIs
export const profileService = {
  // Get customer profile
  getProfile: async () => {
    const response = await api.get(API_ENDPOINTS.CUSTOMER.PROFILE.ROOT);
    return response.data;
  },

  // Update customer profile
  updateProfile: async (profileData) => {
    const response = await api.patch(
      API_ENDPOINTS.CUSTOMER.PROFILE.ROOT,
      profileData,
    );
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await api.post(
      API_ENDPOINTS.CUSTOMER.PROFILE.AVATAR,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  // Get customer addresses
  getAddresses: async () => {
    const response = await api.get(
      API_ENDPOINTS.CUSTOMER.PROFILE.ADDRESSES.ROOT,
    );
    return response.data;
  },

  // Add new address
  addAddress: async (addressData) => {
    const response = await api.post(
      API_ENDPOINTS.CUSTOMER.PROFILE.ADDRESSES.ROOT,
      addressData,
    );
    return response.data;
  },

  // Update address
  updateAddress: async (addressId, addressData) => {
    const response = await api.patch(
      API_ENDPOINTS.CUSTOMER.PROFILE.ADDRESSES.DETAIL(addressId),
      addressData,
    );
    return response.data;
  },

  // Delete address
  deleteAddress: async (addressId) => {
    const response = await api.delete(
      API_ENDPOINTS.CUSTOMER.PROFILE.ADDRESSES.DETAIL(addressId),
    );
    return response.data;
  },

  // Get customer stats (points, orders, etc.)
  getStats: async () => {
    const response = await api.get(
      API_ENDPOINTS.STATS.ORDER_COMPLETED_CANCELLED,
    );
    return response.data;
  },

  // Get reputation score/points
  getReputationScore: async () => {
    const response = await api.get(API_ENDPOINTS.STATS.REPUTATION_SCORE);
    return response.data;
  },

  // Get favorite taskers
  getFavoriteTaskers: async () => {
    const response = await api.get(API_ENDPOINTS.CUSTOMER.FAVORITES.TASKERS);
    return response.data;
  },

  // Get favorite tasks
  getFavoriteTasks: async () => {
    const response = await api.get(API_ENDPOINTS.CUSTOMER.FAVORITES.TASKS);
    return response.data;
  },
};

// Task APIs
export const taskService = {
  // Get task detail by ID
  getTaskDetail: async (taskId) => {
    const response = await api.get(API_ENDPOINTS.TASK.DETAIL(taskId));
    return response.data;
  },

  // Get favorite tasks
  getFavoriteTasks: async () => {
    const response = await api.get(API_ENDPOINTS.TASK.FAVORITE_BY_USER);
    return response.data;
  },

  // Get popular tasks
  getPopularTasks: async () => {
    const response = await api.get(API_ENDPOINTS.TASK.TOP_POPULAR_BY_ORDERS);
    return response.data;
  },

  // Get all tasks/services
  getAllTasks: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.TASK.ALL, {
      params: params,
    });
    return response.data;
  },

  // Get all service categories
  getAllServices: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.SERVICE.ALL, {
      params: params,
    });
    return response.data;
  },
};

// Customer Order APIs
export const customerOrderService = {
  // Get upcoming orders
  getUpcomingOrders: async () => {
    const response = await api.get(API_ENDPOINTS.CUSTOMER.ORDERS.UPCOMING);
    return response.data;
  },

  // Get order history
  getOrderHistory: async () => {
    const response = await api.get(API_ENDPOINTS.CUSTOMER.ORDERS.HISTORY);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    const response = await api.patch(
      API_ENDPOINTS.CUSTOMER.ORDERS.CANCEL(orderId),
    );
    return response.data;
  },

  // Rate order
  rateOrder: async (orderId, ratingData) => {
    const response = await api.post(
      API_ENDPOINTS.CUSTOMER.ORDERS.RATE(orderId),
      ratingData,
    );
    return response.data;
  },
};

// Address APIs
export const addressService = {
  // Get my addresses
  getMyAddresses: async () => {
    const response = await api.get(API_ENDPOINTS.USER.ADDRESSES.MY);
    return response.data;
  },

  // Add new address
  addAddress: async (addressData) => {
    const response = await api.post(
      API_ENDPOINTS.USER.ADDRESSES.CREATE,
      addressData,
    );
    return response.data;
  },

  // Update address
  updateAddress: async (addressId, addressData) => {
    const response = await api.put(
      API_ENDPOINTS.USER.ADDRESSES.UPDATE(addressId),
      addressData,
    );
    return response.data;
  },

  // Delete address
  deleteAddress: async (addressId) => {
    const response = await api.delete(
      API_ENDPOINTS.USER.ADDRESSES.DELETE(addressId),
    );
    return response.data;
  },
};

// Order APIs
export const orderService = {
  // Create order
  createOrder: async (orderData) => {
    const response = await api.post(API_ENDPOINTS.ORDER.CREATE, orderData);
    return response.data;
  },

  // Get order details
  getOrderDetails: async (orderId) => {
    const response = await api.get(API_ENDPOINTS.ORDER.DETAIL(orderId));
    return response.data;
  },

  // Create receipt for order
  createReceipt: async (orderId, paymentMethod) => {
    const response = await api.post(API_ENDPOINTS.ORDER.RECEIPT.ADD, {
      order_id: orderId,
      payment_method: paymentMethod,
    });
    return response.data;
  },

  // Get my orders
  getMyOrders: async () => {
    const response = await api.get(API_ENDPOINTS.ORDER.MY_ORDERS);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    const response = await api.put(API_ENDPOINTS.ORDER.CANCEL(orderId), {
      reason,
    });
    return response.data;
  },
};

// Voucher/Discount APIs
export const voucherService = {
  // Get eligible vouchers
  getEligibleVouchers: async (totalAmount) => {
    const response = await api.post(
      API_ENDPOINTS.DISCOUNT.VOUCHER.ELIGIBLE_LIST,
      {
        total_amount: totalAmount,
      },
    );
    return response.data;
  },

  // Apply voucher
  applyVoucher: async (voucherCode, totalAmount) => {
    const response = await api.post(API_ENDPOINTS.DISCOUNT.VOUCHER.APPLY, {
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
      API_ENDPOINTS.TRANSACTION.PAYMENT_LINK(customerId),
      transactionData,
    );
    return response.data;
  },

  // Check payment status
  checkPaymentStatus: async (orderCode) => {
    const response = await api.get(
      API_ENDPOINTS.TRANSACTION.PAYMENT_STATUS(orderCode),
    );
    return response.data;
  },
};

// Tasker APIs
export const taskerService = {
  // Get tasker profile by ID
  getTaskerById: async (taskerId) => {
    const response = await api.get(API_ENDPOINTS.TASKER.PROFILE(taskerId));
    return response.data;
  },

  // Get available taskers for a task
  getAvailableTaskers: async (taskId, filters = {}) => {
    const response = await api.post(
      API_ENDPOINTS.TASKER.AVAILABLE(taskId),
      filters,
    );
    return response.data;
  },

  // Get tasker reviews
  getTaskerReviews: async (taskerId) => {
    const response = await api.get(
      API_ENDPOINTS.TASKER.REVIEWS.BY_TASKER(taskerId),
    );
    return response.data;
  },
};

export default {
  profileService,
  taskService,
  customerOrderService,
  addressService,
  orderService,
  voucherService,
  paymentService,
  taskerService,
};
