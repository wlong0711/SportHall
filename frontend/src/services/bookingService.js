import api from './api';

export const bookingService = {
  // Create a booking
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  // Get user's bookings
  getMyBookings: async () => {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },

  // Get all bookings (Admin)
  getAllBookings: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.date) params.append('date', filters.date);
    if (filters.sport) params.append('sport', filters.sport);
    if (filters.court) params.append('court', filters.court);
    
    const response = await api.get(`/bookings?${params.toString()}`);
    return response.data;
  },

  // Cancel a booking
  cancelBooking: async (bookingId) => {
    const response = await api.put(`/bookings/${bookingId}/cancel`);
    return response.data;
  },
};

export const courtService = {
  // Get all courts
  getCourts: async (sport = null) => {
    const params = sport ? `?sport=${sport}` : '';
    const response = await api.get(`/courts${params}`);
    return response.data;
  },

  // Get available courts
  getAvailableCourts: async (sport, date, timeSlot) => {
    const response = await api.get('/courts/available', {
      params: { sport, date, timeSlot },
    });
    return response.data;
  },

  // Create a court (Admin)
  createCourt: async (courtData) => {
    const response = await api.post('/courts', courtData);
    return response.data;
  },
};

export const availabilityService = {
  // Get availability
  getAvailability: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.date) params.append('date', filters.date);
    if (filters.timeSlot) params.append('timeSlot', filters.timeSlot);
    if (filters.sport) params.append('sport', filters.sport);
    if (filters.courtId) params.append('courtId', filters.courtId);
    
    const response = await api.get(`/availability?${params.toString()}`);
    return response.data;
  },

  // Set availability (Admin)
  setAvailability: async (availabilityData) => {
    const response = await api.post('/availability', availabilityData);
    return response.data;
  },

  // Delete availability (Admin)
  deleteAvailability: async (availabilityId) => {
    const response = await api.delete(`/availability/${availabilityId}`);
    return response.data;
  },
};

