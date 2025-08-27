import React from 'react';

const ChallengeList = ({ challenges, currentChallenge, completedChallenges, onSelectChallenge }) => {
  return (
    <div className="challenge-list">
      <h3>Challenges</h3>
      <div className="challenge-items">
        {challenges.map(challenge => {
          const isCompleted = completedChallenges.includes(challenge.id);
          const isCurrent = currentChallenge?.id === challenge.id;
          
          return (
            <div
              key={challenge.id}
              className={`challenge-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
              onClick={() => onSelectChallenge(challenge)}
            >
              <span className="challenge-status">
                {isCompleted ? '✅' : isCurrent ? '▶️' : '○'}
              </span>
              <span className="challenge-title">{challenge.title}</span>
            </div>
          );
        })}
      </div>
      <div className="challenge-progress">
        Progress: {completedChallenges.length} / {challenges.length} completed
      </div>
    </div>
  );
};

export default ChallengeList;