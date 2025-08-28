import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import TerminalEmulator from './components/TerminalEmulator';
import ChallengeList from './components/ChallengeList';
import ChallengeDetail from './components/ChallengeDetail';
import PlayerProfile from './components/PlayerProfile';
import Leaderboard from './components/Leaderboard';
import DailyQuest from './components/DailyQuest';
import ProgressTracker from './components/ProgressTracker';
import SandboxMode from './components/SandboxMode';
import Settings from './components/Settings';
import CommandSimulator from './utils/commandSimulator';
import storage from './utils/storage';
import gamification from './utils/gamification';

// Import challenge data directly
import beginnerChallengesData from './data/beginnerChallenges.json';
import intermediateChallengesData from './data/intermediateChallenges.json';
import advancedChallengesData from './data/advancedChallenges.json';
import expertChallengesData from './data/expertChallenges.json';
import narrativeChallengesData from './data/narrativeChallenges.json';

function App() {
  const [challenges, setChallenges] = useState([]);
  const [narrativeChallenges, setNarrativeChallenges] = useState([]);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [difficulty, setDifficulty] = useState('beginner');
  const [commandSimulator] = useState(() => new CommandSimulator());
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  // Gamification states
  const [playerData, setPlayerData] = useState(gamification.playerData);
  const [showProfile, setShowProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);
  const [dailyQuest, setDailyQuest] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [xpAnimation, setXpAnimation] = useState(null);
  
  // Theme and settings
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('terminal-theme') || 'matrix');
  const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem('terminal-font-size')) || 14);

  // Load challenges and saved progress on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Update player streak
        gamification.updateStreak();
        
        // Load user preferences
        const preferences = storage.getUserPreferences();
        setDifficulty(preferences.difficulty || 'beginner');

        // Load completed challenges
        const completed = storage.getCompletedChallenges();
        setCompletedChallenges(completed);

        // Load regular challenges from imported data
        let challengeData;
        switch(difficulty) {
          case 'beginner':
            challengeData = beginnerChallengesData;
            break;
          case 'intermediate':
            challengeData = intermediateChallengesData;
            break;
          case 'advanced':
            challengeData = advancedChallengesData;
            break;
          case 'expert':
            challengeData = expertChallengesData;
            break;
          default:
            challengeData = beginnerChallengesData;
        }
        
        console.log('Loaded challenges:', challengeData.length);
        setChallenges(challengeData);

        // Load narrative challenges from imported data
        const narrativeData = narrativeChallengesData;
        console.log('Loaded narrative challenges:', narrativeData.length);
        setNarrativeChallenges(narrativeData);

        // Save challenges to IndexedDB for offline use
        await storage.saveChallenges([...challengeData, ...narrativeData]);

        // Load daily quest
        const quest = gamification.getDailyQuest();
        setDailyQuest(quest);

        // Restore current challenge
        const savedCurrentId = storage.getCurrentChallenge();
        if (savedCurrentId) {
          const savedChallenge = [...challengeData, ...narrativeData].find(c => c.id === savedCurrentId);
          if (savedChallenge) {
            setCurrentChallenge(savedChallenge);
          }
        }

        // Update player data
        setPlayerData(gamification.playerData);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Try to load from IndexedDB if fetch fails
        const cachedChallenges = await storage.getChallenges();
        if (cachedChallenges.length > 0) {
          const regularChallenges = cachedChallenges.filter(c => c.id < 1000);
          const storyChallen = cachedChallenges.filter(c => c.id >= 1000);
          setChallenges(regularChallenges);
          setNarrativeChallenges(storyChallen);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [difficulty]);

  // Handle command execution
  const handleCommand = useCallback((command) => {
    console.log('handleCommand called with:', command);
    const result = commandSimulator.executeCommand(command);
    console.log('Command simulator result:', result);
    
    // Track command for stats
    gamification.playerData.stats.commandsExecuted++;
    
    // Check if command matches current challenge
    if (currentChallenge && command.trim() !== '') {
      console.log('Current challenge:', currentChallenge.title, 'Solution:', currentChallenge.solution);
      let isCorrect = false;
      
      if (currentChallenge.validation === 'exact') {
        isCorrect = command.trim() === currentChallenge.solution;
      } else if (currentChallenge.validation === 'contains') {
        isCorrect = command.includes(currentChallenge.solution) || 
                   result.output.includes(currentChallenge.expectedOutput || '');
      } else if (currentChallenge.validation === 'pattern') {
        const pattern = new RegExp(currentChallenge.pattern || currentChallenge.technical?.pattern);
        isCorrect = pattern.test(command);
      }
      
      console.log('Is correct?', isCorrect);
      
      if (isCorrect) {
        // Challenge completed!
        console.log('Challenge completed!');
        const newCompleted = [...completedChallenges, currentChallenge.id];
        setCompletedChallenges(newCompleted);
        storage.saveCompletedChallenges(newCompleted);
        
        // Calculate XP with multipliers
        const baseXP = currentChallenge.xpReward || 50;
        const multiplier = gamification.calculateXPMultiplier({
          noHints: true,
          timeBonus: true
        });
        const xpGained = Math.round(baseXP * multiplier);
        
        // Add XP and check for level up
        const xpResult = gamification.addXP(xpGained, `Completed: ${currentChallenge.title}`);
        
        // Show XP animation
        setXpAnimation({
          amount: xpGained,
          x: window.innerWidth / 2,
          y: window.innerHeight / 2
        });
        setTimeout(() => setXpAnimation(null), 2000);
        
        // Update player data
        setPlayerData({...gamification.playerData});
        
        // Track stats
        gamification.playerData.stats.challengesCompleted++;
        
        // Check for achievements
        if (gamification.playerData.stats.challengesCompleted === 1) {
          const achievement = gamification.unlockAchievement('FIRST_COMMAND');
          if (achievement) {
            showAchievementNotification(achievement);
          }
        }
        
        // Update daily quest progress
        if (dailyQuest && dailyQuest.id === 'daily_challenges') {
          setDailyQuest({
            ...dailyQuest,
            progress: dailyQuest.progress + 1
          });
        }
        
        // Save progress to IndexedDB
        storage.saveProgress({
          challengeId: currentChallenge.id,
          command: command,
          completed: true,
          hintUsed: false
        });
        
        // Show success message
        setSuccessMessage(currentChallenge.successMessage || 'Challenge completed!');
        setTimeout(() => setSuccessMessage(''), 5000);
        
        // Move to next challenge
        const allChallenges = [...challenges, ...narrativeChallenges];
        const currentIndex = allChallenges.findIndex(c => c.id === currentChallenge.id);
        if (currentIndex < allChallenges.length - 1) {
          const nextChallenge = allChallenges[currentIndex + 1];
          setCurrentChallenge(nextChallenge);
          storage.saveCurrentChallenge(nextChallenge.id);
        }
        
        // Return success result
        console.log('Returning success result');
        return { ...result, challengeResult: 'success' };
      } else {
        // Wrong answer - provide feedback
        console.log('Wrong answer! Returning incorrect result');
        const incorrectResult = { 
          ...result, 
          challengeResult: 'incorrect',
          incorrectMessage: `❌ Incorrect answer. Hint: ${currentChallenge.hint || 'Try again!'}`
        };
        console.log('Incorrect result object:', incorrectResult);
        return incorrectResult;
      }
    }
    
    return result;
  }, [currentChallenge, challenges, narrativeChallenges, completedChallenges, dailyQuest]);

  // Handle challenge selection
  const handleSelectChallenge = (challenge) => {
    setCurrentChallenge(challenge);
    storage.saveCurrentChallenge(challenge.id);
    setShowMenu(false);
  };

  // Handle difficulty change
  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
    const preferences = storage.getUserPreferences();
    storage.saveUserPreferences({ ...preferences, difficulty: newDifficulty });
  };

  // Handle hint usage
  const handleShowHint = (challengeId) => {
    if (gamification.playerData.inventory.hints > 0) {
      gamification.playerData.inventory.hints--;
      setPlayerData({...gamification.playerData});
      
      storage.saveProgress({
        challengeId: challengeId,
        hintUsed: true,
        completed: false
      });
    }
  };

  // Show achievement notification
  const showAchievementNotification = (achievement) => {
    setNotifications([...notifications, {
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: achievement.achievement.name,
      icon: achievement.achievement.icon
    }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 5000);
  };

  // Handle daily quest claim
  const handleClaimDailyQuest = (quest) => {
    const xpResult = gamification.addXP(quest.xp, 'Daily Quest Completed');
    setPlayerData({...gamification.playerData});
    
    // Reset quest for next day
    setDailyQuest({
      ...quest,
      progress: 0,
      claimed: true
    });
    
    showAchievementNotification({
      achievement: {
        name: 'Daily Quest Complete!',
        icon: '✅'
      }
    });
  };

  // Handle swipe gestures for mobile menu
  const minSwipeDistance = 50;
  
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      setShowMenu(false);
    } else if (isRightSwipe && window.innerWidth <= 768) {
      setShowMenu(true);
    }
  };

  // Handle theme change
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('terminal-theme', newTheme);
  };

  // Handle font size change
  const handleFontSizeChange = (newSize) => {
    setFontSize(newSize);
    localStorage.setItem('terminal-font-size', newSize.toString());
  };

  // Handle export progress
  const handleExportProgress = () => {
    const data = {
      version: '1.0',
      date: new Date().toISOString(),
      completedChallenges,
      currentChallenge: currentChallenge?.id,
      playerData: gamification.playerData,
      difficulty,
      theme,
      fontSize
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linux-mastery-progress-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle import progress
  const handleImportProgress = (data) => {
    try {
      if (data.completedChallenges) {
        setCompletedChallenges(data.completedChallenges);
        storage.saveCompletedChallenges(data.completedChallenges);
      }
      
      if (data.currentChallenge) {
        const challenge = [...challenges, ...narrativeChallenges].find(c => c.id === data.currentChallenge);
        if (challenge) {
          setCurrentChallenge(challenge);
          storage.saveCurrentChallenge(challenge.id);
        }
      }
      
      if (data.playerData) {
        Object.assign(gamification.playerData, data.playerData);
        setPlayerData({...gamification.playerData});
      }
      
      if (data.difficulty) {
        handleDifficultyChange(data.difficulty);
      }
      
      if (data.theme) {
        handleThemeChange(data.theme);
      }
      
      if (data.fontSize) {
        handleFontSizeChange(data.fontSize);
      }
      
      setSuccessMessage('Progress imported successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Import failed:', error);
      setSuccessMessage('Failed to import progress');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // Reset progress
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all progress?')) {
      setCompletedChallenges([]);
      setCurrentChallenge(null);
      storage.saveCompletedChallenges([]);
      storage.saveCurrentChallenge(null);
      setSuccessMessage('Progress reset!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="app loading">
        <div className="loader">Loading Linux Mastery Game...</div>
      </div>
    );
  }

  const allChallenges = difficulty === 'story' 
    ? narrativeChallenges 
    : challenges;

  return (
    <div 
      className="app"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}>
      <header className="app-header">
        <button 
          className="menu-toggle"
          onClick={() => setShowMenu(!showMenu)}
          title="Toggle Menu"
        >
          ☰
        </button>
        
        <h1>Linux:~$</h1>
        
        <div className="nav-center">
          <button 
            className={`nav-btn ${difficulty === 'beginner' ? 'active' : ''}`}
            onClick={() => handleDifficultyChange('beginner')}
          >
            Beginner
          </button>
          <button 
            className={`nav-btn ${difficulty === 'intermediate' ? 'active' : ''}`}
            onClick={() => handleDifficultyChange('intermediate')}
          >
            Intermediate
          </button>
          <button 
            className={`nav-btn ${difficulty === 'advanced' ? 'active' : ''}`}
            onClick={() => handleDifficultyChange('advanced')}
          >
            Advanced
          </button>
          <button 
            className={`nav-btn ${difficulty === 'expert' ? 'active' : ''}`}
            onClick={() => handleDifficultyChange('expert')}
          >
            Expert
          </button>
          <button 
            className={`nav-btn ${difficulty === 'story' ? 'active' : ''}`}
            onClick={() => handleDifficultyChange('story')}
          >
            Story
          </button>
        </div>
        
        <div className="nav-right">
          <span className="status-text">Lv.{playerData.level} | {playerData.xp}XP</span>
          <button className="nav-icon" onClick={() => setShowSandbox(true)} title="Sandbox">🧪</button>
          <button className="nav-icon" onClick={() => setShowSettings(true)} title="Settings">⚙️</button>
          <button className="nav-icon" onClick={() => setShowProfile(true)} title="Profile">👤</button>
          <button className="nav-icon" onClick={() => setShowLeaderboard(true)} title="Leaderboard">🏆</button>
        </div>
      </header>

      {successMessage && (
        <div className="success-banner">
          {successMessage}
        </div>
      )}

      {notifications.map((notif, index) => (
        <div key={index} className="notification-popup">
          <span className="notif-icon">{notif.icon}</span>
          <div>
            <div className="notif-title">{notif.title}</div>
            <div className="notif-message">{notif.message}</div>
          </div>
        </div>
      ))}

      {xpAnimation && (
        <div 
          className="xp-animation"
          style={{
            left: xpAnimation.x,
            top: xpAnimation.y
          }}
        >
          +{xpAnimation.amount} XP
        </div>
      )}

      <div className={`app-body ${!showMenu ? 'sidebar-collapsed' : ''}`}>
        <aside className={`sidebar ${!showMenu ? 'collapsed' : ''}`}>
          {showMenu && (
            <>
              <ProgressTracker 
                completedChallenges={completedChallenges}
                totalChallenges={allChallenges.length}
              />
              
              {dailyQuest && (
                <DailyQuest 
                  quest={dailyQuest}
                  onClaim={handleClaimDailyQuest}
                />
              )}
              
              <ChallengeList 
                challenges={allChallenges}
                currentChallenge={currentChallenge}
                completedChallenges={completedChallenges}
                onSelectChallenge={handleSelectChallenge}
              />
              
              <div className="sidebar-actions">
                <button onClick={handleReset} className="reset-btn">
                  Reset Progress
                </button>
              </div>
            </>
          )}
        </aside>

        <main className={`main-content ${!showMenu ? 'expanded' : ''}`}>
          <div className="terminal-section">
            <TerminalEmulator 
              onCommand={handleCommand}
              currentDirectory={commandSimulator.currentDirectory}
              challenge={currentChallenge}
              theme={theme}
              fontSize={fontSize}
            />
          </div>
        </main>
      </div>

      {showProfile && (
        <div className="modal-overlay">
          <PlayerProfile 
            playerData={playerData}
            onClose={() => setShowProfile(false)}
          />
        </div>
      )}

      {showLeaderboard && (
        <div className="modal-overlay">
          <Leaderboard 
            players={gamification.getLeaderboard()}
            currentPlayer={playerData.username}
            onClose={() => setShowLeaderboard(false)}
          />
        </div>
      )}

      {showSandbox && (
        <div className="modal-overlay">
          <SandboxMode 
            onClose={() => setShowSandbox(false)}
          />
        </div>
      )}

      {showSettings && (
        <div className="modal-overlay">
          <Settings 
            currentTheme={theme}
            currentFontSize={fontSize}
            onThemeChange={handleThemeChange}
            onFontSizeChange={handleFontSizeChange}
            onClose={() => setShowSettings(false)}
            onExport={handleExportProgress}
            onImport={handleImportProgress}
          />
        </div>
      )}

      <footer className="app-footer">
        <p>Master Linux commands through epic gameplay 🚀</p>
      </footer>
    </div>
  );
}

export default App;