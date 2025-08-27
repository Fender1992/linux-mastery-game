import React, { useState } from 'react';

const ChallengeDetail = ({ challenge, onShowHint }) => {
  const [showHint, setShowHint] = useState(false);

  if (!challenge) {
    return (
      <div className="challenge-detail">
        <div className="no-challenge">
          <h3>Welcome to Linux Mastery Game!</h3>
          <p>Select a challenge from the list to begin learning Linux commands.</p>
        </div>
      </div>
    );
  }

  const handleShowHint = () => {
    setShowHint(true);
    if (onShowHint) {
      onShowHint(challenge.id);
    }
  };

  return (
    <div className="challenge-detail">
      <h3>{challenge.title}</h3>
      <div className="challenge-description">
        <p>{challenge.description}</p>
      </div>
      
      {!showHint && (
        <button 
          className="hint-button"
          onClick={handleShowHint}
        >
          💡 Show Hint
        </button>
      )}
      
      {showHint && (
        <div className="challenge-hint">
          <strong>Hint:</strong> {challenge.hint}
        </div>
      )}
    </div>
  );
};

export default ChallengeDetail;