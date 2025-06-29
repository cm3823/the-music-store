// API service for communicating with the backend
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://127.0.0.1:3001/api');

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Album collection methods
  async getAlbums() {
    return this.request('/albums');
  }

  async addAlbum(albumData) {
    return this.request('/albums', {
      method: 'POST',
      body: JSON.stringify(albumData),
    });
  }

  async removeAlbum(albumId) {
    return this.request(`/albums/${albumId}`, {
      method: 'DELETE',
    });
  }

  async getAlbumById(albumId) {
    return this.request(`/albums/${albumId}`);
  }

  // Search methods
  async searchAlbums(query, type = 'all') {
    const params = new URLSearchParams({ query, type });
    return this.request(`/search?${params}`);
  }

  async getFeaturedAlbums() {
    return this.request('/search/featured');
  }

  async getAlbumDetails(externalId) {
    return this.request(`/search/${externalId}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;