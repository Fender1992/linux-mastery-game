import React from 'react';

const CommandAutocomplete = ({ 
  suggestions, 
  selectedIndex, 
  inputValue, 
  onSelect,
  visible 
}) => {
  if (!visible || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="autocomplete-dropdown">
      <div className="autocomplete-header">
        Press <kbd>Tab</kbd> to complete, <kbd>↑↓</kbd> to navigate
      </div>
      {suggestions.map((suggestion, index) => (
        <div
          key={suggestion}
          className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
          onClick={() => onSelect(suggestion)}
        >
          <span className="autocomplete-command">{suggestion}</span>
          {getCommandDescription(suggestion) && (
            <span className="autocomplete-description">
              - {getCommandDescription(suggestion)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

const getCommandDescription = (command) => {
  const descriptions = {
    'pwd': 'Print working directory',
    'ls': 'List directory contents',
    'cd': 'Change directory',
    'cat': 'Display file contents',
    'echo': 'Display text',
    'mkdir': 'Create directory',
    'touch': 'Create empty file',
    'rm': 'Remove files',
    'cp': 'Copy files',
    'mv': 'Move/rename files',
    'grep': 'Search text patterns',
    'find': 'Find files and directories',
    'chmod': 'Change file permissions',
    'whoami': 'Display current user',
    'date': 'Display current date',
    'clear': 'Clear terminal screen',
    'help': 'Show available commands',
    'man': 'Display command manual',
    'history': 'Show command history',
    'env': 'Display environment variables',
    'export': 'Set environment variable',
    'ps': 'Process status',
    'kill': 'Terminate process',
    'top': 'System monitor',
    'df': 'Disk usage',
    'tar': 'Archive files',
    'ssh': 'Secure shell',
    'exit': 'Exit terminal'
  };
  
  return descriptions[command] || '';
};

export default CommandAutocomplete;