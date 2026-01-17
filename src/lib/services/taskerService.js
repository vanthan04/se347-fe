import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('token') || localStorage.getItem('accessToken');

const getAuthHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

// Order APIs
export const taskerOrderService = {
  // Get all orders for tasker
  getAllOrders: async () => {
    const response = await axios.get(`${API_URL}/tasker/orders`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Get order details
  getOrderDetails: async (orderId) => {
    const response = await axios.get(`${API_URL}/tasker/order/${orderId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Accept order
  acceptOrder: async (orderId) => {
    const response = await axios.put(
      `${API_URL}/tasker/order/accept/${orderId}`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Deny order
  denyOrder: async (orderId, reason) => {
    const response = await axios.put(
      `${API_URL}/tasker/order/deny/${orderId}`,
      { reason },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Confirm depart
  confirmDepart: async (orderId) => {
    const response = await axios.put(
      `${API_URL}/tasker/order/confirm/depart/${orderId}`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Confirm arrive
  confirmArrive: async (orderId) => {
    const response = await axios.put(
      `${API_URL}/tasker/order/confirm/arrive/${orderId}`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Confirm start
  confirmStart: async (orderId) => {
    const response = await axios.put(
      `${API_URL}/tasker/order/confirm/start/${orderId}`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Confirm complete
  confirmComplete: async (orderId) => {
    const response = await axios.put(
      `${API_URL}/tasker/order/confirm/complete/${orderId}`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    const response = await axios.put(
      `${API_URL}/tasker/order/cancel/${orderId}`,
      { reason },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },
};

// Chat APIs
export const chatService = {
  // Get all conversations
  getConversations: async () => {
    const response = await axios.get(`${API_URL}/chats`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Get messages for an order
  getMessages: async (orderId, cursor = null) => {
    let url = `${API_URL}/chats/orders/${orderId}/messages`;
    if (cursor) url += `?before=${cursor}`;

    const response = await axios.get(url, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Send message (handled via socket, but API endpoint might exist)
  sendMessage: async (orderId, content) => {
    const response = await axios.post(
      `${API_URL}/chats/messages`,
      { target_order_id: orderId, content },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (orderId) => {
    const response = await axios.post(
      `${API_URL}/chats/mark-read`,
      { target_order_id: orderId },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },
};

// Review APIs
export const reviewService = {
  // Check if review exists
  checkReview: async (customerId) => {
    const response = await axios.get(
      `${API_URL}/tasker/review/check/${customerId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Create review
  createReview: async (customerId, data) => {
    const response = await axios.post(
      `${API_URL}/tasker/review/create/${customerId}`,
      data,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  // Get reviews received
  getReceivedReviews: async () => {
    const response = await axios.get(`${API_URL}/tasker/reviews/received`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};

// Profile APIs
export const taskerProfileService = {
  // Get profile
  getProfile: async () => {
    const response = await axios.get(`${API_URL}/tasker/profile`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await axios.patch(`${API_URL}/tasker/profile/update`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (formData) => {
    const response = await axios.post(`${API_URL}/tasker/profile/avatar`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get statistics
  getStatistics: async () => {
    const response = await axios.get(`${API_URL}/tasker/statistics`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Update availability
  updateAvailability: async (isAvailable) => {
    const response = await axios.patch(
      `${API_URL}/tasker/availability`,
      { is_available: isAvailable },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },
};

// Activity APIs
export const activityService = {
  // Get upcoming orders
  getUpcomingOrders: async () => {
    const response = await axios.get(`${API_URL}/tasker/orders/upcoming`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Get order history
  getOrderHistory: async () => {
    const response = await axios.get(`${API_URL}/tasker/orders/history`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Get earnings
  getEarnings: async (period = 'week') => {
    const response = await axios.get(`${API_URL}/tasker/earnings?period=${period}`, {
      headers: getAuthHeaders(),
    });
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
