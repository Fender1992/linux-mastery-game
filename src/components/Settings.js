import React, { useState } from 'react';

const Settings = ({ currentTheme, currentFontSize, onThemeChange, onFontSizeChange, onClose, onExport, onImport }) => {
  const [importData, setImportData] = useState('');
  
  const themes = {
    matrix: { name: 'Matrix Green', bg: '#0a0a0a', fg: '#00ff00', cursor: '#00ff00' },
    dracula: { name: 'Dracula', bg: '#282a36', fg: '#f8f8f2', cursor: '#ff79c6' },
    monokai: { name: 'Monokai', bg: '#272822', fg: '#f8f8f2', cursor: '#f92672' },
    solarized: { name: 'Solarized Dark', bg: '#002b36', fg: '#839496', cursor: '#268bd2' },
    ocean: { name: 'Ocean Blue', bg: '#001220', fg: '#00ccff', cursor: '#00ccff' },
    amber: { name: 'Amber', bg: '#1a1100', fg: '#ffb000', cursor: '#ffb000' },
    cyberpunk: { name: 'Cyberpunk', bg: '#0d0208', fg: '#ff006e', cursor: '#8338ec' },
    retro: { name: 'Retro Terminal', bg: '#000000', fg: '#33ff00', cursor: '#33ff00' }
  };

  const handleExport = () => {
    onExport();
  };

  const handleImport = () => {
    if (importData) {
      try {
        const data = JSON.parse(importData);
        onImport(data);
        setImportData('');
        alert('Progress imported successfully!');
      } catch (error) {
        alert('Invalid import data. Please check and try again.');
      }
    }
  };

  return (
    <div className="settings-modal">
      <div className="settings-container">
        <button className="close-btn" onClick={onClose}>✕</button>
        
        <h2>⚙️ Settings</h2>
        
        <div className="settings-section">
          <h3>Terminal Appearance</h3>
          
          <div className="setting-group">
            <label>Theme:</label>
            <div className="theme-grid">
              {Object.entries(themes).map(([key, theme]) => (
                <div 
                  key={key}
                  className={`theme-option ${currentTheme === key ? 'active' : ''}`}
                  onClick={() => onThemeChange(key)}
                  style={{ 
                    backgroundColor: theme.bg,
                    color: theme.fg,
                    borderColor: currentTheme === key ? theme.cursor : 'transparent'
                  }}
                >
                  <div className="theme-preview">
                    <span style={{ color: theme.fg }}>$ ls -la</span>
                    <span style={{ color: theme.cursor }}>█</span>
                  </div>
                  <div className="theme-name">{theme.name}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="setting-group">
            <label>Font Size:</label>
            <div className="font-size-control">
              <button onClick={() => onFontSizeChange(Math.max(10, currentFontSize - 1))}>-</button>
              <span className="font-size-value">{currentFontSize}px</span>
              <button onClick={() => onFontSizeChange(Math.min(24, currentFontSize + 1))}>+</button>
            </div>
            <div className="font-preview" style={{ fontSize: `${currentFontSize}px` }}>
              user@linux:~$ echo "Hello, World!"
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Progress Management</h3>
          
          <div className="setting-group">
            <label>Export Progress:</label>
            <button className="export-btn" onClick={handleExport}>
              📥 Download Progress Backup
            </button>
            <p className="setting-hint">Save your progress to a file that you can import later</p>
          </div>
          
          <div className="setting-group">
            <label>Import Progress:</label>
            <textarea 
              placeholder="Paste your exported progress data here..."
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="import-textarea"
            />
            <button className="import-btn" onClick={handleImport} disabled={!importData}>
              📤 Import Progress
            </button>
            <p className="setting-hint">Restore your progress from a previously exported file</p>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Keyboard Shortcuts</h3>
          <div className="shortcuts-list">
            <div className="shortcut-item">
              <kbd>Tab</kbd> <span>Autocomplete command</span>
            </div>
            <div className="shortcut-item">
              <kbd>↑/↓</kbd> <span>Navigate command history</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl+C</kbd> <span>Cancel current command</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl+L</kbd> <span>Clear terminal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;