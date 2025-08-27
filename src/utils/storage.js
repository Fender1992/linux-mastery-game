import { openDB } from 'idb';

const DB_NAME = 'LinuxMasteryGame';
const DB_VERSION = 1;
const CHALLENGES_STORE = 'challenges';
const PROGRESS_STORE = 'progress';

class StorageManager {
  constructor() {
    this.db = null;
    this.initDB();
  }

  async initDB() {
    try {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(CHALLENGES_STORE)) {
            db.createObjectStore(CHALLENGES_STORE, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(PROGRESS_STORE)) {
            const progressStore = db.createObjectStore(PROGRESS_STORE, { keyPath: 'id', autoIncrement: true });
            progressStore.createIndex('challengeId', 'challengeId');
            progressStore.createIndex('timestamp', 'timestamp');
          }
        }
      });
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
    }
  }

  // LocalStorage methods for quick access to simple data
  saveToLocalStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('LocalStorage save error:', error);
      return false;
    }
  }

  getFromLocalStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('LocalStorage get error:', error);
      return defaultValue;
    }
  }

  removeFromLocalStorage(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('LocalStorage remove error:', error);
      return false;
    }
  }

  // User preferences in localStorage
  saveUserPreferences(preferences) {
    return this.saveToLocalStorage('userPreferences', preferences);
  }

  getUserPreferences() {
    return this.getFromLocalStorage('userPreferences', {
      theme: 'dark',
      fontSize: 14,
      soundEnabled: false,
      difficulty: 'beginner'
    });
  }

  // Progress tracking in localStorage
  saveCompletedChallenges(challengeIds) {
    return this.saveToLocalStorage('completedChallenges', challengeIds);
  }

  getCompletedChallenges() {
    return this.getFromLocalStorage('completedChallenges', []);
  }

  saveCurrentChallenge(challengeId) {
    return this.saveToLocalStorage('currentChallenge', challengeId);
  }

  getCurrentChallenge() {
    return this.getFromLocalStorage('currentChallenge', null);
  }

  // IndexedDB methods for complex data
  async saveChallenges(challenges) {
    if (!this.db) await this.initDB();
    
    try {
      const tx = this.db.transaction(CHALLENGES_STORE, 'readwrite');
      await Promise.all(challenges.map(challenge => tx.store.put(challenge)));
      await tx.done;
      return true;
    } catch (error) {
      console.error('Failed to save challenges:', error);
      return false;
    }
  }

  async getChallenges() {
    if (!this.db) await this.initDB();
    
    try {
      return await this.db.getAll(CHALLENGES_STORE);
    } catch (error) {
      console.error('Failed to get challenges:', error);
      return [];
    }
  }

  async saveProgress(progressData) {
    if (!this.db) await this.initDB();
    
    try {
      const data = {
        ...progressData,
        timestamp: new Date().toISOString()
      };
      
      const tx = this.db.transaction(PROGRESS_STORE, 'readwrite');
      await tx.store.add(data);
      await tx.done;
      return true;
    } catch (error) {
      console.error('Failed to save progress:', error);
      return false;
    }
  }

  async getProgressHistory() {
    if (!this.db) await this.initDB();
    
    try {
      return await this.db.getAll(PROGRESS_STORE);
    } catch (error) {
      console.error('Failed to get progress history:', error);
      return [];
    }
  }

  async getProgressForChallenge(challengeId) {
    if (!this.db) await this.initDB();
    
    try {
      const index = this.db.transaction(PROGRESS_STORE).store.index('challengeId');
      return await index.getAll(challengeId);
    } catch (error) {
      console.error('Failed to get challenge progress:', error);
      return [];
    }
  }

  // Statistics
  async getStatistics() {
    const completedChallenges = this.getCompletedChallenges();
    const progressHistory = await this.getProgressHistory();
    
    const stats = {
      totalCompleted: completedChallenges.length,
      completedChallenges: completedChallenges,
      totalAttempts: progressHistory.length,
      hintsUsed: progressHistory.filter(p => p.hintUsed).length,
      averageAttemptsPerChallenge: progressHistory.length / (completedChallenges.length || 1),
      lastPlayed: progressHistory.length > 0 
        ? progressHistory[progressHistory.length - 1].timestamp 
        : null
    };
    
    return stats;
  }

  // Clear all data
  clearAllData() {
    localStorage.clear();
    if (this.db) {
      this.db.close();
      indexedDB.deleteDatabase(DB_NAME);
      this.db = null;
    }
  }

  // Export/Import functionality for backup
  async exportData() {
    const data = {
      preferences: this.getUserPreferences(),
      completedChallenges: this.getCompletedChallenges(),
      currentChallenge: this.getCurrentChallenge(),
      challenges: await this.getChallenges(),
      progressHistory: await this.getProgressHistory(),
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.preferences) {
        this.saveUserPreferences(data.preferences);
      }
      if (data.completedChallenges) {
        this.saveCompletedChallenges(data.completedChallenges);
      }
      if (data.currentChallenge) {
        this.saveCurrentChallenge(data.currentChallenge);
      }
      if (data.challenges) {
        await this.saveChallenges(data.challenges);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}

export default new StorageManager();