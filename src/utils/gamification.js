// Gamification System based on Params.md specifications

export const PLAYER_RANKS = {
  NOVICE: {
    name: "The Shell Awakening",
    minXP: 0,
    maxXP: 100,
    narrative: "You've discovered the terminal. Master basic navigation.",
    coreSkills: ["pwd", "ls", "cd", "mkdir", "cp", "mv", "rm"],
    bossFight: "The Filesystem Maze",
    unlock: "Custom prompt colors + Apprentice challenges",
    badge: "🐣",
    color: "#4ade80"
  },
  APPRENTICE: {
    name: "The Text Warrior",
    minXP: 101,
    maxXP: 500,
    narrative: "Text is your weapon. Master data manipulation.",
    coreSkills: ["grep", "sed", "awk", "find", "xargs", "pipes"],
    bossFight: "The Log Monster",
    unlock: "Command aliases + Advanced regex challenges",
    badge: "⚔️",
    color: "#60a5fa"
  },
  PRACTITIONER: {
    name: "The Automation Mage",
    minXP: 501,
    maxXP: 1500,
    narrative: "Scripts are your spells. Automate everything.",
    coreSkills: ["bash scripting", "cron", "systemd", "process management"],
    bossFight: "The Chaos Daemon",
    unlock: "Script library + Custom automation challenges",
    badge: "🧙",
    color: "#a78bfa"
  },
  ADVANCED: {
    name: "The System Guardian",
    minXP: 1501,
    maxXP: 5000,
    narrative: "Protect and serve. Master security and performance.",
    coreSkills: ["docker", "iptables", "selinux", "monitoring", "networking"],
    bossFight: "The Breach",
    unlock: "Security toolkit + Cloud lab access",
    badge: "🛡️",
    color: "#f59e0b"
  },
  EXPERT: {
    name: "The Infrastructure Architect",
    minXP: 5001,
    maxXP: 10000,
    narrative: "Build worlds. Master cloud and orchestration.",
    coreSkills: ["kubernetes", "terraform", "ansible", "CI/CD", "monitoring"],
    bossFight: "The Scale Dragon",
    unlock: "Architecture templates + Mentor status",
    badge: "🏗️",
    color: "#ef4444"
  },
  MASTER: {
    name: "The Kernel Sage",
    minXP: 10001,
    maxXP: Infinity,
    narrative: "Shape the future. Contribute to Linux itself.",
    coreSkills: ["kernel modules", "performance tuning", "custom distros"],
    bossFight: "The Upstream",
    unlock: "Hall of Fame + Lifetime premium",
    badge: "👑",
    color: "#fbbf24"
  }
};

export const ACHIEVEMENTS = {
  FIRST_COMMAND: {
    id: "first_command",
    name: "Hello World",
    description: "Execute your first command",
    icon: "🎯",
    xp: 10
  },
  SPEED_DEMON: {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Complete a challenge in under 30 seconds",
    icon: "⚡",
    xp: 50
  },
  PERFECT_WEEK: {
    id: "perfect_week",
    name: "Perfect Week",
    description: "Complete daily quests for 7 days straight",
    icon: "🔥",
    xp: 100
  },
  NO_HINTS: {
    id: "no_hints",
    name: "Pure Skill",
    description: "Complete 10 challenges without using hints",
    icon: "🧠",
    xp: 75
  },
  NIGHT_OWL: {
    id: "night_owl",
    name: "Night Owl",
    description: "Complete challenges after midnight",
    icon: "🦉",
    xp: 25
  },
  HELPER: {
    id: "helper",
    name: "Community Helper",
    description: "Help another player in guild chat",
    icon: "🤝",
    xp: 30
  },
  EXPLORER: {
    id: "explorer",
    name: "Explorer",
    description: "Try all available commands",
    icon: "🗺️",
    xp: 40
  },
  STREAK_10: {
    id: "streak_10",
    name: "Unstoppable",
    description: "Maintain a 10-day streak",
    icon: "💪",
    xp: 150
  }
};

export class GamificationEngine {
  constructor() {
    this.playerData = this.loadPlayerData();
  }

  loadPlayerData() {
    const saved = localStorage.getItem('playerData');
    if (saved) {
      return JSON.parse(saved);
    }
    
    return {
      username: 'Player',
      xp: 0,
      level: 1,
      rank: 'NOVICE',
      achievements: [],
      badges: [],
      streak: 0,
      lastPlayed: null,
      stats: {
        commandsExecuted: 0,
        challengesCompleted: 0,
        totalPlayTime: 0,
        favoriteCommand: null,
        fastestChallenge: null
      },
      equipment: {
        shell: 'bash',
        terminal: 'basic',
        theme: 'matrix_green'
      },
      inventory: {
        hints: 3,
        xpBoosts: 0,
        timeFreeze: 0
      }
    };
  }

  savePlayerData() {
    localStorage.setItem('playerData', JSON.stringify(this.playerData));
  }

  addXP(amount, reason = '') {
    const previousRank = this.playerData.rank;
    this.playerData.xp += amount;
    
    // Check for rank up
    const newRank = this.calculateRank(this.playerData.xp);
    if (newRank !== previousRank) {
      this.playerData.rank = newRank;
      this.onRankUp(previousRank, newRank);
    }
    
    // Calculate level (more granular than rank)
    this.playerData.level = Math.floor(this.playerData.xp / 50) + 1;
    
    this.savePlayerData();
    
    return {
      xpGained: amount,
      totalXP: this.playerData.xp,
      level: this.playerData.level,
      rank: this.playerData.rank,
      reason: reason,
      rankChanged: newRank !== previousRank
    };
  }

  calculateRank(xp) {
    for (const [key, rank] of Object.entries(PLAYER_RANKS)) {
      if (xp >= rank.minXP && xp <= rank.maxXP) {
        return key;
      }
    }
    return 'MASTER';
  }

  onRankUp(oldRank, newRank) {
    // Trigger special events on rank up
    const notification = {
      type: 'RANK_UP',
      title: `Rank Up! Welcome to ${PLAYER_RANKS[newRank].name}`,
      message: PLAYER_RANKS[newRank].narrative,
      rewards: PLAYER_RANKS[newRank].unlock,
      badge: PLAYER_RANKS[newRank].badge
    };
    
    // Store notification for UI to display
    this.storeNotification(notification);
  }

  unlockAchievement(achievementId) {
    if (this.playerData.achievements.includes(achievementId)) {
      return null; // Already unlocked
    }
    
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) return null;
    
    this.playerData.achievements.push(achievementId);
    this.addXP(achievement.xp, `Achievement: ${achievement.name}`);
    
    this.savePlayerData();
    
    return {
      achievement: achievement,
      xpGained: achievement.xp
    };
  }

  updateStreak() {
    const today = new Date().toDateString();
    const lastPlayed = this.playerData.lastPlayed;
    
    if (!lastPlayed) {
      this.playerData.streak = 1;
    } else {
      const lastDate = new Date(lastPlayed);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastDate.toDateString() === yesterday.toDateString()) {
        this.playerData.streak++;
        
        // Check streak achievements
        if (this.playerData.streak === 7) {
          this.unlockAchievement('PERFECT_WEEK');
        } else if (this.playerData.streak === 10) {
          this.unlockAchievement('STREAK_10');
        }
      } else if (lastDate.toDateString() !== today) {
        this.playerData.streak = 1;
      }
    }
    
    this.playerData.lastPlayed = new Date().toISOString();
    this.savePlayerData();
    
    return this.playerData.streak;
  }

  calculateXPMultiplier(factors = {}) {
    let multiplier = 1.0;
    
    // No hints bonus
    if (factors.noHints) multiplier += 0.5;
    
    // Speed bonus
    if (factors.timeBonus) multiplier += 0.3;
    
    // Streak bonus
    if (this.playerData.streak > 0) {
      multiplier += Math.min(this.playerData.streak * 0.05, 0.5);
    }
    
    // Equipment bonuses
    if (this.playerData.equipment.shell !== 'bash') {
      multiplier += 0.1;
    }
    
    // XP boost item
    if (this.playerData.inventory.xpBoosts > 0) {
      multiplier *= 2;
      this.playerData.inventory.xpBoosts--;
    }
    
    return multiplier;
  }

  getProgressToNextRank() {
    const currentRankData = PLAYER_RANKS[this.playerData.rank];
    const xpInRank = this.playerData.xp - currentRankData.minXP;
    const xpNeededForRank = currentRankData.maxXP - currentRankData.minXP;
    
    return {
      current: xpInRank,
      needed: xpNeededForRank,
      percentage: (xpInRank / xpNeededForRank) * 100
    };
  }

  getDailyQuest() {
    const quests = [
      {
        id: 'daily_commands',
        title: 'Command Master',
        description: 'Execute 20 different commands',
        xp: 50,
        progress: 0,
        target: 20
      },
      {
        id: 'daily_challenges',
        title: 'Challenge Accepted',
        description: 'Complete 5 challenges',
        xp: 75,
        progress: 0,
        target: 5
      },
      {
        id: 'daily_perfect',
        title: 'Perfectionist',
        description: 'Complete 3 challenges without hints',
        xp: 100,
        progress: 0,
        target: 3
      }
    ];
    
    // Deterministic daily quest based on date
    const today = new Date().getDate();
    return quests[today % quests.length];
  }

  storeNotification(notification) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push({
      ...notification,
      timestamp: new Date().toISOString(),
      read: false
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }

  getLeaderboard() {
    // In a real app, this would fetch from a server
    // For now, generate mock data
    const mockPlayers = [
      { username: 'LinuxNinja', xp: 8500, rank: 'EXPERT' },
      { username: 'ShellMaster', xp: 6200, rank: 'ADVANCED' },
      { username: 'CommanderBash', xp: 4800, rank: 'ADVANCED' },
      { username: this.playerData.username, xp: this.playerData.xp, rank: this.playerData.rank },
      { username: 'TerminalHero', xp: 2100, rank: 'PRACTITIONER' },
      { username: 'ScriptKid', xp: 750, rank: 'APPRENTICE' }
    ];
    
    return mockPlayers.sort((a, b) => b.xp - a.xp);
  }
}

export default new GamificationEngine();