import React, { useState, useEffect } from 'react';

const DailyQuest = ({ quest, onClaim }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft(`${hours}h ${minutes}m`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const progressPercentage = (quest.progress / quest.target) * 100;
  const isComplete = quest.progress >= quest.target;

  return (
    <div className="daily-quest">
      <div className="quest-header">
        <h3>📅 Daily Quest</h3>
        <span className="time-left">Resets in: {timeLeft}</span>
      </div>

      <div className="quest-content">
        <h4>{quest.title}</h4>
        <p>{quest.description}</p>
        
        <div className="quest-progress">
          <div className="progress-bar-container">
            <div 
              className="progress-bar quest-bar" 
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
            <div className="progress-text">
              {quest.progress} / {quest.target}
            </div>
          </div>
        </div>

        <div className="quest-reward">
          <span className="reward-label">Reward:</span>
          <span className="reward-value">{quest.xp} XP</span>
        </div>

        {isComplete && (
          <button className="claim-btn" onClick={() => onClaim(quest)}>
            Claim Reward 🎁
          </button>
        )}
      </div>

      <div className="quest-tip">
        💡 Tip: Complete daily quests to maintain your streak!
      </div>
    </div>
  );
};

export default DailyQuest;