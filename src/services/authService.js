// Authentication Service
// For now, using localStorage as a simple backend mock
// In production, this would connect to a real backend API

class AuthService {
  constructor() {
    this.currentUser = null;
    this.users = this.loadUsers();
    this.initCurrentUser();
  }

  // Load users from localStorage
  loadUsers() {
    try {
      const users = localStorage.getItem('linuxGame_users');
      return users ? JSON.parse(users) : {};
    } catch (e) {
      return {};
    }
  }

  // Save users to localStorage
  saveUsers() {
    localStorage.setItem('linuxGame_users', JSON.stringify(this.users));
  }

  // Initialize current user from session
  initCurrentUser() {
    const sessionUser = localStorage.getItem('linuxGame_currentUser');
    if (sessionUser) {
      this.currentUser = JSON.parse(sessionUser);
    }
  }

  // Register a new user
  async register(username, email, password) {
    // Validate input
    if (!username || !email || !password) {
      throw new Error('All fields are required');
    }

    if (username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }

    if (!email.includes('@')) {
      throw new Error('Invalid email address');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check if user already exists
    if (this.users[username]) {
      throw new Error('Username already taken');
    }

    // Check if email already exists
    const emailExists = Object.values(this.users).some(user => user.email === email);
    if (emailExists) {
      throw new Error('Email already registered');
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: this.hashPassword(password), // In production, use proper hashing
      createdAt: new Date().toISOString(),
      profile: {
        level: 1,
        xp: 0,
        completedChallenges: [],
        achievements: [],
        streak: 0,
        lastActive: new Date().toISOString()
      }
    };

    // Save user
    this.users[username] = newUser;
    this.saveUsers();

    // Auto-login after registration
    return this.login(username, password);
  }

  // Login user
  async login(username, password) {
    const user = this.users[username];
    
    if (!user) {
      throw new Error('Invalid username or password');
    }

    if (user.password !== this.hashPassword(password)) {
      throw new Error('Invalid username or password');
    }

    // Create session
    const sessionUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      profile: user.profile
    };

    this.currentUser = sessionUser;
    localStorage.setItem('linuxGame_currentUser', JSON.stringify(sessionUser));

    // Update last active
    user.profile.lastActive = new Date().toISOString();
    this.saveUsers();

    return sessionUser;
  }

  // Logout user
  logout() {
    this.currentUser = null;
    localStorage.removeItem('linuxGame_currentUser');
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Update user profile
  async updateProfile(updates) {
    if (!this.currentUser) {
      throw new Error('Not authenticated');
    }

    const user = this.users[this.currentUser.username];
    if (!user) {
      throw new Error('User not found');
    }

    // Update profile
    Object.assign(user.profile, updates);
    user.profile.lastActive = new Date().toISOString();
    
    // Save changes
    this.saveUsers();

    // Update current session
    this.currentUser.profile = user.profile;
    localStorage.setItem('linuxGame_currentUser', JSON.stringify(this.currentUser));

    return this.currentUser;
  }

  // Sync game progress
  async syncProgress(progressData) {
    if (!this.currentUser) {
      return null;
    }

    return this.updateProfile({
      level: progressData.level,
      xp: progressData.xp,
      completedChallenges: progressData.completedChallenges,
      achievements: progressData.achievements,
      streak: progressData.streak
    });
  }

  // Get leaderboard
  async getLeaderboard() {
    const allUsers = Object.values(this.users)
      .map(user => ({
        username: user.username,
        level: user.profile.level,
        xp: user.profile.xp,
        completedChallenges: user.profile.completedChallenges.length,
        lastActive: user.profile.lastActive
      }))
      .sort((a, b) => {
        // Sort by level first, then by XP
        if (a.level !== b.level) {
          return b.level - a.level;
        }
        return b.xp - a.xp;
      })
      .slice(0, 100); // Top 100 players

    return allUsers;
  }

  // Simple password hashing (NOT secure for production)
  hashPassword(password) {
    // In production, use bcrypt or similar
    return btoa(password);
  }

  // Check if user is logged in
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Delete account
  async deleteAccount(password) {
    if (!this.currentUser) {
      throw new Error('Not authenticated');
    }

    const user = this.users[this.currentUser.username];
    if (!user) {
      throw new Error('User not found');
    }

    if (user.password !== this.hashPassword(password)) {
      throw new Error('Invalid password');
    }

    // Delete user
    delete this.users[this.currentUser.username];
    this.saveUsers();

    // Logout
    this.logout();

    return { success: true };
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;