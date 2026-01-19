import api from "@/lib/api/api";

// Order APIs
export const taskerOrderService = {
  // Get all orders for tasker
  getAllOrders: async () => {
    const response = await api.get("/tasker/orders/available");
    return response.data;
  },

  // Get scheduled orders (pre-booked)
  getScheduledOrders: async () => {
    const response = await api.get("/tasker/orders/scheduled");
    return response.data;
  },

  // Get order details
  getOrderDetails: async (orderId) => {
    const response = await api.get(`/tasker/order/${orderId}`);
    return response.data;
  },

  // Accept order
  acceptOrder: async (orderId) => {
    const response = await api.put(`/tasker/order/accept/${orderId}`);
    return response.data;
  },

  // Deny order
  denyOrder: async (orderId, reason) => {
    const response = await api.put(`/tasker/order/deny/${orderId}`, { reason });
    return response.data;
  },

  // Confirm depart
  confirmDepart: async (orderId) => {
    const response = await api.put(`/tasker/order/confirm/depart/${orderId}`);
    return response.data;
  },

  // Confirm arrive
  confirmArrive: async (orderId) => {
    const response = await api.put(`/tasker/order/confirm/arrive/${orderId}`);
    return response.data;
  },

  // Confirm start
  confirmStart: async (orderId) => {
    const response = await api.put(`/tasker/order/confirm/start/${orderId}`);
    return response.data;
  },

  // Confirm complete
  confirmComplete: async (orderId) => {
    const response = await api.put(`/tasker/order/confirm/complete/${orderId}`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    const response = await api.put(`/tasker/order/cancel/${orderId}`, {
      reason,
    });
    return response.data;
  },
};

// Chat APIs
export const chatService = {
  // Get all conversations
  getConversations: async () => {
    const response = await api.get("/chats");
    return response.data;
  },

  // Get messages for an order
  getMessages: async (orderId, cursor = null) => {
    let url = `/chats/orders/${orderId}/messages`;
    if (cursor) url += `?before=${cursor}`;
    const response = await api.get(url);
    return response.data;
  },

  // Send message (handled via socket, but API endpoint might exist)
  sendMessage: async (orderId, content) => {
    const response = await api.post("/chats/messages", {
      target_order_id: orderId,
      content,
    });
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (orderId) => {
    const response = await api.post("/chats/mark-read", {
      target_order_id: orderId,
    });
    return response.data;
  },
};

// Review APIs
export const reviewService = {
  // Check if review exists
  checkReview: async (customerId) => {
    const response = await api.get(`/tasker/review/check/${customerId}`);
    return response.data;
  },

  // Create review
  createReview: async (customerId, data) => {
    const response = await api.post(
      `/tasker/review/create/${customerId}`,
      data,
    );
    return response.data;
  },

  // Get reviews received
  getReceivedReviews: async () => {
    const response = await api.get("/tasker/reviews/received");
    return response.data;
  },
};

// Profile APIs
export const taskerProfileService = {
  // Get profile
  getProfile: async () => {
    const response = await api.get("/user/profile");
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.patch("/tasker/profile/update", data);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (formData) => {
    const response = await api.post("/tasker/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Get statistics
  getStatistics: async () => {
    const response = await api.get("/tasker/statistics");
    return response.data;
  },

  // Update availability/working status
  updateAvailability: async (isAvailable) => {
    const newStatus = isAvailable ? "available" : "offline";
    const response = await api.patch("/user/profile/update/working-status", {
      working_status: newStatus,
    });
    return response.data;
  },

  // Get today earnings (cashout)
  getTodayEarnings: async () => {
    const response = await api.get("/tasker/cashOut");
    return response.data;
  },

  // Get available balance
  getAvailableBalance: async () => {
    const response = await api.get("/tasker/cashOut/available");
    return response.data;
  },

  // Request cashout
  requestCashout: async () => {
    const response = await api.put("/tasker/cashOut");
    return response.data;
  },
};

// Activity APIs
export const activityService = {
  // Get upcoming orders
  getUpcomingOrders: async () => {
    const response = await api.get("/tasker/orders/upcoming");
    return response.data;
  },

  // Get order history
  getOrderHistory: async () => {
    const response = await api.get("/tasker/orders/history");
    return response.data;
  },

  // Get earnings
  getEarnings: async (period = "week") => {
    const response = await api.get(`/tasker/earnings?period=${period}`);
    return response.data;
  },
};

export default {
  taskerOrderService,
  chatService,
  reviewService,
  taskerProfileService,
  activityService,
};
