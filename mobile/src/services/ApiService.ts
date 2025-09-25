// API Service for HabitFlow Mobile App
// Connects to the existing Node.js backend

// Configure this with your deployed backend URL
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000' // Development  
  : 'https://habitflow-backend.replit.app'; // Production - replace with your actual deployed URL

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Habit Management
  static async getHabits() {
    return this.request<any[]>('/api/habits');
  }

  static async createHabit(habitData: {
    name: string;
    description?: string;
    category: string;
    targetDays: number;
    color: string;
  }) {
    return this.request<any>('/api/habits', {
      method: 'POST',
      body: JSON.stringify(habitData),
    });
  }

  static async updateHabit(habitId: string, updates: any) {
    return this.request<any>(`/api/habits/${habitId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  static async deleteHabit(habitId: string) {
    return this.request<any>(`/api/habits/${habitId}`, {
      method: 'DELETE',
    });
  }

  // Habit Entries
  static async toggleHabitEntry(habitId: string, date: string) {
    return this.request<any>('/api/habits/entries', {
      method: 'POST',
      body: JSON.stringify({
        habitId,
        date,
        completed: true, // Toggle logic handled by backend
      }),
    });
  }

  static async getHabitEntries(habitId: string, limit = 30) {
    return this.request<any[]>(`/api/habits/${habitId}/entries?limit=${limit}`);
  }

  // User Stats
  static async getUserStats() {
    return this.request<any>('/api/stats');
  }

  // AI Features
  static async getAiNudges() {
    return this.request<any[]>('/api/nudges');
  }

  static async generateNudge() {
    return this.request<any>('/api/ai/generate-nudge', {
      method: 'POST',
    });
  }

  static async generateMotivation(habitId?: string) {
    const endpoint = habitId 
      ? `/api/ai/generate-motivation?habitId=${habitId}`
      : '/api/ai/generate-motivation';
    
    return this.request<any>(endpoint, {
      method: 'POST',
    });
  }

  static async generateChallenge() {
    return this.request<any>('/api/ai/generate-challenge', {
      method: 'POST',
    });
  }

  static async getHabitSuggestions(category?: string) {
    const endpoint = category 
      ? `/api/ai/habit-suggestions?category=${category}`
      : '/api/ai/habit-suggestions';
    
    return this.request<string[]>(endpoint);
  }

  static async dismissNudge(nudgeId: string) {
    return this.request<any>(`/api/nudges/${nudgeId}/dismiss`, {
      method: 'POST',
    });
  }

  static async markNudgeAsRead(nudgeId: string) {
    return this.request<any>(`/api/nudges/${nudgeId}/read`, {
      method: 'POST',
    });
  }

  static async requestAiNudge() {
    return this.request<any>('/api/ai/request-nudge', {
      method: 'POST',
    });
  }

  // Notifications (for future use)
  static async getNotifications() {
    return this.request<any[]>('/api/notifications');
  }

  static async markNotificationAsRead(notificationId: string) {
    return this.request<any>(`/api/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  }
}

export { ApiService };