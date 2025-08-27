import React, { useState } from 'react';
import TerminalEmulator from './TerminalEmulator';
import CommandSimulator from '../utils/commandSimulator';

const SandboxMode = ({ onClose }) => {
  const [commandSimulator] = useState(() => new CommandSimulator());
  const [commandHistory, setCommandHistory] = useState([]);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  const handleCommand = (command) => {
    const result = commandSimulator.executeCommand(command);
    setCommandHistory(prev => [...prev, { command, result }].slice(-50)); // Keep last 50 commands
    return result;
  };

  const cheatSheetCommands = [
    { category: 'Navigation', commands: [
      { cmd: 'pwd', desc: 'Print working directory' },
      { cmd: 'ls', desc: 'List files and directories' },
      { cmd: 'cd [dir]', desc: 'Change directory' },
      { cmd: 'cd ..', desc: 'Go to parent directory' },
      { cmd: 'cd ~', desc: 'Go to home directory' }
    ]},
    { category: 'File Operations', commands: [
      { cmd: 'cat [file]', desc: 'Display file contents' },
      { cmd: 'touch [file]', desc: 'Create empty file' },
      { cmd: 'mkdir [dir]', desc: 'Create directory' },
      { cmd: 'rm [file]', desc: 'Remove file' },
      { cmd: 'cp [src] [dst]', desc: 'Copy file' },
      { cmd: 'mv [src] [dst]', desc: 'Move/rename file' }
    ]},
    { category: 'Text Processing', commands: [
      { cmd: 'grep [pattern] [file]', desc: 'Search for pattern' },
      { cmd: 'echo [text]', desc: 'Display text' },
      { cmd: 'find [path] -name [pattern]', desc: 'Find files' }
    ]},
    { category: 'System Info', commands: [
      { cmd: 'whoami', desc: 'Current username' },
      { cmd: 'date', desc: 'Current date/time' },
      { cmd: 'env', desc: 'Environment variables' },
      { cmd: 'history', desc: 'Command history' },
      { cmd: 'clear', desc: 'Clear screen' }
    ]}
  ];

  return (
    <div className="sandbox-mode">
      <div className="sandbox-header">
        <h2>🧪 Sandbox Mode - Practice Linux Commands Freely</h2>
        <div className="sandbox-controls">
          <button 
            className="cheatsheet-btn"
            onClick={() => setShowCheatSheet(!showCheatSheet)}
          >
            {showCheatSheet ? '📖 Hide' : '📖 Commands'} Cheat Sheet
          </button>
          <button className="close-sandbox-btn" onClick={onClose}>
            ✕ Exit Sandbox
          </button>
        </div>
      </div>

      <div className="sandbox-body">
        {showCheatSheet && (
          <div className="cheat-sheet">
            <h3>📚 Linux Command Reference</h3>
            {cheatSheetCommands.map((category, idx) => (
              <div key={idx} className="cheat-category">
                <h4>{category.category}</h4>
                <div className="cheat-commands">
                  {category.commands.map((cmd, cmdIdx) => (
                    <div key={cmdIdx} className="cheat-command">
                      <code>{cmd.cmd}</code>
                      <span>{cmd.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="sandbox-content">
          <div className="sandbox-info">
            <p>🎮 This is your playground! Try any Linux command without worrying about challenges.</p>
            <p>💡 Tip: Type <code>help</code> to see all available commands</p>
          </div>

          <div className="sandbox-terminal">
            <TerminalEmulator 
              onCommand={handleCommand}
              currentDirectory={commandSimulator.currentDirectory}
            />
          </div>

          {commandHistory.length > 0 && (
            <div className="command-history-panel">
              <h4>Recent Commands</h4>
              <div className="history-list">
                {commandHistory.slice(-10).reverse().map((entry, idx) => (
                  <div key={idx} className="history-entry">
                    <code className="history-command">$ {entry.command}</code>
                    {entry.result.output && (
                      <pre className="history-output">{entry.result.output.slice(0, 100)}</pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SandboxMode;