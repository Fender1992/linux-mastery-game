import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import CommandAutocomplete from './CommandAutocomplete';

const TerminalEmulator = ({ onCommand, currentDirectory = '/home/user' }) => {
  const terminalRef = useRef(null);
  const termRef = useRef(null);
  const fitAddonRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [commandHistory, setCommandHistory] = useState([]);
  const initTimeoutRef = useRef(null);
  const [autocompleteVisible, setAutocompleteVisible] = useState(false);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [autocompleteIndex, setAutocompleteIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');

  const writePrompt = useCallback((term, directory) => {
    if (term) {
      term.write(`\x1b[1;32muser@linux\x1b[0m:\x1b[1;34m${directory}\x1b[0m$ `);
    }
  }, []);

  const handleCommand = useCallback((command) => {
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
  }, [onCommand, currentDirectory, writePrompt]);

  const clearCurrentLine = useCallback((term, currentInput) => {
    if (term && currentInput) {
      for (let i = 0; i < currentInput.length; i++) {
        term.write('\b \b');
      }
    }
  }, []);

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
        termRef.current.dispose();
        termRef.current = null;
        fitAddonRef.current = null;
      }

      // Create new terminal with fixed dimensions
      const term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        theme: {
          background: '#0a0a0a',
          foreground: '#00ff00',
          cursor: '#00ff00',
          selection: 'rgba(0, 255, 0, 0.3)'
        },
        cols: 80, // Fixed columns
        rows: 24,  // Fixed rows
        scrollback: 1000,
        disableStdin: false
      });

      // Open terminal first
      term.open(terminalRef.current);

      // Store reference
      termRef.current = term;

      // Wait for terminal to be ready before adding FitAddon
      setTimeout(() => {
        try {
          const fitAddon = new FitAddon();
          term.loadAddon(fitAddon);
          fitAddonRef.current = fitAddon;
          
          // Try to fit after a delay
          setTimeout(() => {
            if (fitAddon && terminalRef.current && terminalRef.current.offsetParent !== null) {
              try {
                fitAddon.fit();
              } catch (e) {
                console.warn('Fit failed, using default size:', e);
              }
            }
          }, 200);
        } catch (e) {
          console.warn('FitAddon initialization failed, terminal will use fixed size');
        }
      }, 50);

      // Initialize terminal content
      term.writeln('\x1b[1;32m🐧 Linux Mastery Game Terminal\x1b[0m');
      term.writeln('Type "help" to see available commands');
      term.writeln('');
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
  }, [currentDirectory, writePrompt, handleCommand, clearCurrentLine, commandHistory]);

  // Initialize terminal when component mounts
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
        fitAddonRef.current = null;
      }
    };
  }, [initializeTerminal]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Debounce resize and check if terminal is ready
      if (!fitAddonRef.current || !termRef.current || !isReady) {
        return;
      }
      
      setTimeout(() => {
        try {
          // Extra safety check before fitting
          if (fitAddonRef.current && termRef.current && 
              termRef.current.element && 
              termRef.current.element.offsetParent !== null &&
              terminalRef.current &&
              terminalRef.current.offsetWidth > 0) {
            fitAddonRef.current.fit();
          }
        } catch (e) {
          console.warn('Resize fit failed, keeping current size');
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
        backgroundColor: '#0a0a0a',
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
          color: '#00ff00',
          fontSize: '14px'
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