import React from 'react';
import { PLAYER_RANKS } from '../utils/gamification';

const PlayerProfile = ({ playerData, onClose }) => {
  const currentRank = PLAYER_RANKS[playerData.rank];
  const xpProgress = ((playerData.xp - currentRank.minXP) / (currentRank.maxXP - currentRank.minXP)) * 100;

  return (
    <div className="player-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="rank-badge" style={{ backgroundColor: currentRank.color }}>
            {currentRank.badge}
          </div>
        </div>
        <div className="profile-info">
          <h2>{playerData.username}</h2>
          <div className="rank-title">{currentRank.name}</div>
          <div className="level-info">Level {playerData.level}</div>
        </div>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="xp-section">
        <div className="xp-bar-container">
          <div className="xp-bar" style={{ width: `${xpProgress}%` }}></div>
          <div className="xp-text">
            {playerData.xp} / {currentRank.maxXP} XP
          </div>
        </div>
        <p className="rank-narrative">{currentRank.narrative}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{playerData.stats.commandsExecuted}</div>
          <div className="stat-label">Commands</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{playerData.stats.challengesCompleted}</div>
          <div className="stat-label">Challenges</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{playerData.streak}🔥</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{playerData.achievements.length}</div>
          <div className="stat-label">Achievements</div>
        </div>
      </div>

      <div className="equipment-section">
        <h3>Equipment</h3>
        <div className="equipment-grid">
          <div className="equipment-item">
            <span className="equipment-icon">🖥️</span>
            <span className="equipment-name">Shell: {playerData.equipment.shell}</span>
          </div>
          <div className="equipment-item">
            <span className="equipment-icon">💻</span>
            <span className="equipment-name">Terminal: {playerData.equipment.terminal}</span>
          </div>
          <div className="equipment-item">
            <span className="equipment-icon">🎨</span>
            <span className="equipment-name">Theme: {playerData.equipment.theme}</span>
          </div>
        </div>
      </div>

      <div className="inventory-section">
        <h3>Inventory</h3>
        <div className="inventory-grid">
          <div className="inventory-item">
            <span className="item-count">{playerData.inventory.hints}</span>
            <span className="item-name">Hints</span>
          </div>
          <div className="inventory-item">
            <span className="item-count">{playerData.inventory.xpBoosts}</span>
            <span className="item-name">XP Boosts</span>
          </div>
          <div className="inventory-item">
            <span className="item-count">{playerData.inventory.timeFreeze}</span>
            <span className="item-name">Time Freeze</span>
          </div>
        </div>
      </div>

      <div className="core-skills">
        <h3>Core Skills to Master</h3>
        <div className="skills-list">
          {currentRank.coreSkills.map((skill, index) => (
            <span key={index} className="skill-badge">{skill}</span>
          ))}
        </div>
      </div>

      <div className="next-unlock">
        <h3>Next Unlock</h3>
        <p>{currentRank.unlock}</p>
      </div>
    </div>
  );
};

export default PlayerProfile;