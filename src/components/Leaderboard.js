import React from 'react';
import { PLAYER_RANKS } from '../utils/gamification';

const Leaderboard = ({ players, currentPlayer, onClose }) => {
  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h2>🏆 Global Leaderboard</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="leaderboard-tabs">
        <button className="tab-btn active">Global</button>
        <button className="tab-btn">Friends</button>
        <button className="tab-btn">Guild</button>
      </div>

      <div className="leaderboard-list">
        {players.map((player, index) => {
          const isCurrentPlayer = player.username === currentPlayer;
          const rankData = PLAYER_RANKS[player.rank];
          
          return (
            <div 
              key={index} 
              className={`leaderboard-item ${isCurrentPlayer ? 'current-player' : ''}`}
            >
              <div className="rank-position">
                {index === 0 && '🥇'}
                {index === 1 && '🥈'}
                {index === 2 && '🥉'}
                {index > 2 && `#${index + 1}`}
              </div>
              
              <div className="player-info">
                <span className="player-badge" style={{ color: rankData.color }}>
                  {rankData.badge}
                </span>
                <span className="player-name">{player.username}</span>
                {isCurrentPlayer && <span className="you-badge">YOU</span>}
              </div>
              
              <div className="player-stats">
                <span className="player-rank">{rankData.name}</span>
                <span className="player-xp">{player.xp.toLocaleString()} XP</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="leaderboard-footer">
        <p>Rankings update every hour</p>
        <p>Season ends in: 23d 14h 32m</p>
      </div>
    </div>
  );
};

export default Leaderboard;