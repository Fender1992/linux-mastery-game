import React from 'react';

const ProgressTracker = ({ completedChallenges, totalChallenges }) => {
  const beginnerTotal = 15;
  const intermediateTotal = 15;
  const advancedTotal = 12;
  const expertTotal = 15;
  
  // Calculate progress for each difficulty
  const calculateProgress = (startId, endId) => {
    const completed = completedChallenges.filter(id => id >= startId && id <= endId).length;
    const total = endId - startId + 1;
    return { completed, total, percentage: (completed / total) * 100 };
  };
  
  const beginnerProgress = calculateProgress(1, 15);
  const intermediateProgress = calculateProgress(101, 115);
  const advancedProgress = calculateProgress(201, 212);
  const expertProgress = calculateProgress(301, 315);
  
  const overallProgress = completedChallenges.filter(id => id < 1000).length;
  const overallTotal = beginnerTotal + intermediateTotal + advancedTotal + expertTotal;
  const overallPercentage = (overallProgress / overallTotal) * 100;
  
  // Determine skill level based on progress
  const getSkillLevel = () => {
    if (expertProgress.percentage > 50) return 'Linux Master 🏆';
    if (advancedProgress.percentage > 50) return 'Linux Professional 🎯';
    if (intermediateProgress.percentage > 50) return 'Linux User 📚';
    if (beginnerProgress.percentage > 50) return 'Linux Learner 🌱';
    return 'Linux Novice 🐣';
  };
  
  return (
    <div className="progress-tracker">
      <h3>Your Learning Journey</h3>
      
      <div className="skill-level">
        <span className="level-label">Current Level:</span>
        <span className="level-value">{getSkillLevel()}</span>
      </div>
      
      <div className="overall-progress">
        <h4>Overall Progress</h4>
        <div className="progress-bar-container">
          <div 
            className="progress-bar overall-bar" 
            style={{ width: `${overallPercentage}%` }}
          ></div>
          <div className="progress-text">
            {overallProgress} / {overallTotal} Challenges
          </div>
        </div>
      </div>
      
      <div className="difficulty-progress">
        <div className="progress-item">
          <span className="progress-label">Beginner:</span>
          <div className="mini-progress-bar">
            <div 
              className="progress-fill beginner-fill" 
              style={{ width: `${beginnerProgress.percentage}%` }}
            ></div>
          </div>
          <span className="progress-count">{beginnerProgress.completed}/{beginnerProgress.total}</span>
        </div>
        
        <div className="progress-item">
          <span className="progress-label">Intermediate:</span>
          <div className="mini-progress-bar">
            <div 
              className="progress-fill intermediate-fill" 
              style={{ width: `${intermediateProgress.percentage}%` }}
            ></div>
          </div>
          <span className="progress-count">{intermediateProgress.completed}/{intermediateProgress.total}</span>
        </div>
        
        <div className="progress-item">
          <span className="progress-label">Advanced:</span>
          <div className="mini-progress-bar">
            <div 
              className="progress-fill advanced-fill" 
              style={{ width: `${advancedProgress.percentage}%` }}
            ></div>
          </div>
          <span className="progress-count">{advancedProgress.completed}/{advancedProgress.total}</span>
        </div>
        
        <div className="progress-item">
          <span className="progress-label">Expert:</span>
          <div className="mini-progress-bar">
            <div 
              className="progress-fill expert-fill" 
              style={{ width: `${expertProgress.percentage}%` }}
            ></div>
          </div>
          <span className="progress-count">{expertProgress.completed}/{expertProgress.total}</span>
        </div>
      </div>
      
      <div className="next-milestone">
        {overallPercentage < 100 && (
          <p>🎯 Complete {overallTotal - overallProgress} more challenges to become a Linux Master!</p>
        )}
        {overallPercentage === 100 && (
          <p>🎉 Congratulations! You've mastered all Linux challenges!</p>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;