import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';

const TerminalEmulator = ({ onCommand, currentDirectory = '/home/user', challenge, theme = 'matrix', fontSize = 14 }) => {
  const terminalRef = useRef(null);
  const termRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [commandHistory, setCommandHistory] = useState([]);
  const initTimeoutRef = useRef(null);
  const [showHint, setShowHint] = useState(false);
  const commandSimulatorRef = useRef(null);

  const themes = {
    matrix: { bg: '#0a0a0a', fg: '#00ff00', cursor: '#00ff00' },
    dracula: { bg: '#282a36', fg: '#f8f8f2', cursor: '#ff79c6' },
    monokai: { bg: '#272822', fg: '#f8f8f2', cursor: '#f92672' },
    solarized: { bg: '#002b36', fg: '#839496', cursor: '#268bd2' },
    ocean: { bg: '#001220', fg: '#00ccff', cursor: '#00ccff' },
    amber: { bg: '#1a1100', fg: '#ffb000', cursor: '#ffb000' },
    cyberpunk: { bg: '#0d0208', fg: '#ff006e', cursor: '#8338ec' },
    retro: { bg: '#000000', fg: '#33ff00', cursor: '#33ff00' }
  };

  const currentTheme = themes[theme] || themes.matrix;

  const writePrompt = useCallback((term, directory) => {
    if (term) {
      term.write(`\x1b[1;32muser@linux\x1b[0m:\x1b[1;34m${directory}\x1b[0m$ `);
    }
  }, []);
  
  const clearCurrentLine = useCallback((term, currentInput) => {
    if (term && currentInput) {
      for (let i = 0; i < currentInput.length; i++) {
        term.write('\b \b');
      }
    }
  }, []);
  
  const displayChallenge = useCallback((term) => {
    if (!term || !challenge) return;
    
    term.writeln('\x1b[1;33m' + '─'.repeat(60) + '\x1b[0m');
    term.writeln('\x1b[1;36m📋 CURRENT CHALLENGE:\x1b[0m');
    term.writeln('\x1b[1;32m' + challenge.title + '\x1b[0m');
    term.writeln('');
    term.writeln('\x1b[1;37m' + challenge.description + '\x1b[0m');
    
    if (challenge.story) {
      term.writeln('');
      term.writeln('\x1b[1;33mScenario:\x1b[0m ' + challenge.story.setup);
      term.writeln('\x1b[1;33mRole:\x1b[0m ' + challenge.story.character);
      term.writeln('\x1b[1;31mStakes:\x1b[0m ' + challenge.story.stakes);
    }
    
    if (challenge.technical) {
      term.writeln('');
      term.writeln('\x1b[1;36mObjective:\x1b[0m ' + challenge.technical.objective);
    }
    
    term.writeln('');
    if (!showHint) {
      term.writeln('\x1b[1;90mType "hint" to see a hint\x1b[0m');
    } else if (challenge.hint) {
      term.writeln('\x1b[1;33m💡 Hint:\x1b[0m ' + challenge.hint);
    }
    
    term.writeln('\x1b[1;33m' + '─'.repeat(60) + '\x1b[0m');
    term.writeln('');
  }, [challenge, showHint]);

  const handleCommand = useCallback((command) => {
    if (command.toLowerCase() === 'hint') {
      setShowHint(true);
      if (termRef.current) {
        if (challenge && challenge.hint) {
          termRef.current.writeln('\x1b[1;33m💡 Hint:\x1b[0m ' + challenge.hint);
        } else {
          termRef.current.writeln('No hint available for this challenge');
        }
        writePrompt(termRef.current, currentDirectory);
      }
      return;
    }
    
    if (command.toLowerCase() === 'clear') {
      if (termRef.current) {
        termRef.current.clear();
        displayChallenge(termRef.current);
        writePrompt(termRef.current, currentDirectory);
      }
      return;
    }
    
    if (onCommand) {
      const result = onCommand(command);
      if (result && result.output && termRef.current) {
        termRef.current.writeln(result.output);
      }
      if (termRef.current) {
        writePrompt(termRef.current, result?.newDirectory || currentDirectory);
      }
    } else if (termRef.current) {
      termRef.current.writeln(`Command not recognized: ${command}`);
      writePrompt(termRef.current, currentDirectory);
    }
  }, [onCommand, currentDirectory, writePrompt, challenge, displayChallenge]);

  const initializeTerminal = useCallback(() => {
    // Clear any existing timeout
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
    }

    // Check if container is ready
    if (!terminalRef.current) {
      console.warn('Terminal container not available');
      return false;
    }

    // Force a layout calculation
    const containerRect = terminalRef.current.getBoundingClientRect();
    if (containerRect.width === 0 || containerRect.height === 0) {
      console.warn('Terminal container has zero dimensions');
      return false;
    }

    try {
      // Dispose existing terminal if any
      if (termRef.current) {
        try {
          termRef.current.dispose();
        } catch (e) {
          console.warn('Error disposing terminal:', e);
        }
        termRef.current = null;
      }

      // Calculate optimal terminal size based on container
      const cols = Math.floor(containerRect.width / 9) || 80;
      const rows = Math.floor(containerRect.height / 17) || 24;

      // Create new terminal with calculated dimensions
      const term = new Terminal({
        cursorBlink: true,
        fontSize: fontSize,
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        theme: {
          background: currentTheme.bg,
          foreground: currentTheme.fg,
          cursor: currentTheme.cursor,
          selection: `${currentTheme.cursor}33`
        },
        cols: cols,
        rows: rows,
        scrollback: 1000,
        disableStdin: false
      });

      // Open terminal first
      term.open(terminalRef.current);

      // Store reference
      termRef.current = term;

      // Skip FitAddon entirely to avoid dimension errors
      // The terminal will use the calculated dimensions

      // Initialize terminal content
      term.writeln('\x1b[1;32m🐧 Linux Mastery Game Terminal\x1b[0m');
      term.writeln('Type "help" to see available commands');
      term.writeln('');
      
      // Display current challenge if exists
      displayChallenge(term);
      
      writePrompt(term, currentDirectory);

      // Set up input handling
      let inputBuffer = '';
      let historyIndex = -1;

      const disposable = term.onData((data) => {
        const code = data.charCodeAt(0);
        
        if (code === 13) { // Enter
          const command = inputBuffer.trim();
          if (command) {
            setCommandHistory(prev => [...prev, command]);
            historyIndex = -1;
          }
          term.write('\r\n');
          handleCommand(command);
          inputBuffer = '';
        } else if (code === 127) { // Backspace
          if (inputBuffer.length > 0) {
            inputBuffer = inputBuffer.slice(0, -1);
            term.write('\b \b');
          }
        } else if (code === 27) { // Escape sequences
          const seq = data.slice(1);
          if (seq === '[A' && commandHistory.length > 0) { // Up arrow
            if (historyIndex === -1) {
              historyIndex = commandHistory.length - 1;
            } else {
              historyIndex = Math.max(0, historyIndex - 1);
            }
            clearCurrentLine(term, inputBuffer);
            inputBuffer = commandHistory[historyIndex] || '';
            term.write(inputBuffer);
          } else if (seq === '[B' && historyIndex >= 0) { // Down arrow
            historyIndex = Math.min(commandHistory.length - 1, historyIndex + 1);
            clearCurrentLine(term, inputBuffer);
            if (historyIndex < commandHistory.length) {
              inputBuffer = commandHistory[historyIndex] || '';
            } else {
              inputBuffer = '';
              historyIndex = -1;
            }
            term.write(inputBuffer);
          }
        } else if (code === 9) { // Tab key for autocomplete
          const parts = inputBuffer.split(' ');
          const lastPart = parts[parts.length - 1];
          
          // Get available commands
          const availableCommands = [
            'ls', 'cd', 'pwd', 'cat', 'echo', 'grep', 'find', 'mkdir', 'touch', 
            'rm', 'cp', 'mv', 'head', 'tail', 'wc', 'chmod', 'ps', 'sort', 
            'uniq', 'df', 'du', 'which', 'whoami', 'date', 'clear', 'help', 
            'man', 'history', 'env', 'export', 'hint'
          ];
          
          // If it's the first word, autocomplete commands
          if (parts.length === 1 && lastPart.length > 0) {
            const matches = availableCommands.filter(cmd => cmd.startsWith(lastPart));
            
            if (matches.length === 1) {
              // Complete the command
              const completion = matches[0].slice(lastPart.length);
              inputBuffer += completion;
              term.write(completion);
            } else if (matches.length > 1) {
              // Show options
              term.write('\r\n');
              term.write(matches.join('  '));
              term.write('\r\n');
              writePrompt(term, currentDirectory);
              term.write(inputBuffer);
            }
          }
          // TODO: Add file/directory autocomplete for arguments
        } else if (code === 3) { // Ctrl+C
          term.write('^C\r\n');
          writePrompt(term, currentDirectory);
          inputBuffer = '';
        } else if (code >= 32) { // Printable characters
          inputBuffer += data;
          term.write(data);
        }
      });

      // Removed duplicate fit attempt - handled in FitAddon initialization above

      setIsReady(true);
      console.log('Terminal initialized successfully');
      return true;

    } catch (error) {
      console.error('Terminal initialization failed:', error);
      setIsReady(false);
      return false;
    }
  }, [currentDirectory, writePrompt, handleCommand, clearCurrentLine, commandHistory, displayChallenge, currentTheme, fontSize]);

  // Initialize terminal when component mounts or theme/fontSize changes
  useEffect(() => {
    const attemptInit = () => {
      if (!initializeTerminal()) {
        // Retry with increasing delays
        initTimeoutRef.current = setTimeout(() => {
          if (!termRef.current) {
            attemptInit();
          }
        }, 100);
      }
    };

    // Wait for next tick to ensure DOM is ready
    initTimeoutRef.current = setTimeout(attemptInit, 0);

    // Cleanup
    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      if (termRef.current) {
        termRef.current.dispose();
        termRef.current = null;
      }
    };
  }, [initializeTerminal, theme, fontSize]);

  // Handle challenge changes
  useEffect(() => {
    if (termRef.current && challenge) {
      setShowHint(false);  // Reset hint when challenge changes
      termRef.current.clear();
      termRef.current.writeln('\x1b[1;32m🐧 New Challenge Loaded!\x1b[0m');
      termRef.current.writeln('');
      displayChallenge(termRef.current);
      writePrompt(termRef.current, currentDirectory);
    }
  }, [challenge, displayChallenge, writePrompt, currentDirectory]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Reinitialize terminal on resize with new dimensions
      if (!termRef.current || !isReady || !terminalRef.current) {
        return;
      }
      
      setTimeout(() => {
        try {
          const containerRect = terminalRef.current.getBoundingClientRect();
          if (containerRect.width > 0 && containerRect.height > 0) {
            const cols = Math.floor(containerRect.width / 9) || 80;
            const rows = Math.floor(containerRect.height / 17) || 24;
            
            // Only resize if dimensions actually changed
            if (termRef.current.cols !== cols || termRef.current.rows !== rows) {
              termRef.current.resize(cols, rows);
            }
          }
        } catch (e) {
          console.warn('Resize failed, keeping current size');
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isReady]);

  return (
    <div 
      style={{ 
        width: '100%', 
        height: '100%',
        backgroundColor: currentTheme.bg,
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        minHeight: '400px',
        position: 'relative'
      }}
    >
      {!isReady && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: currentTheme.fg,
          fontSize: `${fontSize}px`
        }}>
          Initializing terminal...
        </div>
      )}
      <div 
        ref={terminalRef}
        style={{
          flex: 1,
          height: '100%',
          minWidth: '300px',
          minHeight: '200px',
          opacity: isReady ? 1 : 0.3,
          transition: 'opacity 0.3s'
        }}
      />
    </div>
  );
};

export default TerminalEmulator;