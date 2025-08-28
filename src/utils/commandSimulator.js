const initialFileSystem = {
  '/': {
    type: 'directory',
    children: {
      'home': {
        type: 'directory',
        children: {
          'user': {
            type: 'directory',
            children: {
              'documents': {
                type: 'directory',
                children: {
                  'readme.txt': {
                    type: 'file',
                    content: 'Welcome to the Linux Mastery Game!\nLearn Linux commands by completing challenges.'
                  },
                  'notes.txt': {
                    type: 'file',
                    content: 'Remember:\n- pwd shows current directory\n- ls lists files\n- cd changes directory'
                  },
                  'tutorial.md': {
                    type: 'file',
                    content: '# Linux Tutorial\n\n## Basic Commands\n- `ls` - list files\n- `cd` - change directory\n- `pwd` - print working directory\n- `cat` - display file contents'
                  },
                  'commands.txt': {
                    type: 'file',
                    content: 'Essential Linux Commands:\nls -la    # List all files with details\ncd ~      # Go to home directory\ngrep text # Search for text\nfind .    # Find files'
                  }
                }
              },
              'projects': {
                type: 'directory',
                children: {
                  'game': {
                    type: 'directory',
                    children: {
                      'main.py': {
                        type: 'file',
                        content: '#!/usr/bin/env python3\nprint("Hello, Linux!")'
                      },
                      'README.md': {
                        type: 'file',
                        content: '# Game Project\n\nA simple Linux game\n\n## Requirements\n- Python 3.x\n- Terminal'
                      },
                      'config.json': {
                        type: 'file',
                        content: '{\n  "name": "LinuxGame",\n  "version": "1.0",\n  "author": "user"\n}'
                      }
                    }
                  },
                  'scripts': {
                    type: 'directory',
                    children: {
                      'backup.sh': {
                        type: 'file',
                        content: '#!/bin/bash\n# Backup script\necho "Starting backup..."\ncp -r /home/user/documents /home/user/backup\necho "Backup complete!"'
                      },
                      'setup.sh': {
                        type: 'file',
                        content: '#!/bin/bash\n# Setup script\necho "Setting up environment..."\nmkdir -p ~/bin\nexport PATH=$PATH:~/bin\necho "Setup complete!"'
                      }
                    }
                  }
                }
              },
              'Downloads': {
                type: 'directory',
                children: {
                  'data.csv': {
                    type: 'file',
                    content: 'id,name,score\n1,Alice,95\n2,Bob,87\n3,Charlie,92\n4,Diana,88'
                  },
                  'install.sh': {
                    type: 'file',
                    content: '#!/bin/bash\necho "Installing application..."\nsleep 2\necho "Installation complete!"'
                  }
                }
              },
              'Desktop': {
                type: 'directory',
                children: {
                  'shortcuts.txt': {
                    type: 'file',
                    content: 'Useful Shortcuts:\nCtrl+C - Cancel command\nCtrl+D - Logout\nCtrl+L - Clear screen\nTab - Auto-complete'
                  }
                }
              },
              '.bashrc': {
                type: 'file',
                content: '# Bash configuration file\nexport PATH=$PATH:/usr/local/bin'
              }
            }
          }
        }
      },
      'etc': {
        type: 'directory',
        children: {
          'passwd': {
            type: 'file',
            content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash'
          }
        }
      },
      'var': {
        type: 'directory',
        children: {
          'log': {
            type: 'directory',
            children: {
              'system.log': {
                type: 'file',
                content: '[INFO] System started successfully\n[INFO] All services running'
              }
            }
          }
        }
      },
      'usr': {
        type: 'directory',
        children: {
          'bin': {
            type: 'directory',
            children: {}
          },
          'local': {
            type: 'directory',
            children: {
              'bin': {
                type: 'directory',
                children: {}
              }
            }
          }
        }
      }
    }
  }
};

class CommandSimulator {
  constructor() {
    this.fileSystem = JSON.parse(JSON.stringify(initialFileSystem));
    this.currentDirectory = '/home/user';
    this.environmentVariables = {
      HOME: '/home/user',
      USER: 'user',
      PATH: '/usr/bin:/usr/local/bin',
      PWD: '/home/user'
    };
  }

  executeCommand(commandLine) {
    const parts = commandLine.trim().split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);

    switch (command) {
      case '':
        return { output: '', newDirectory: this.currentDirectory };
      case 'pwd':
        return this.pwd();
      case 'ls':
        return this.ls(args);
      case 'cd':
        return this.cd(args[0]);
      case 'cat':
        return this.cat(args);
      case 'echo':
        return this.echo(args);
      case 'mkdir':
        return this.mkdir(args);
      case 'touch':
        return this.touch(args);
      case 'rm':
        return this.rm(args);
      case 'cp':
        return this.cp(args);
      case 'mv':
        return this.mv(args);
      case 'grep':
        return this.grep(args);
      case 'find':
        return this.find(args);
      case 'whoami':
        return this.whoami();
      case 'date':
        return this.date();
      case 'clear':
        return this.clear();
      case 'help':
        return this.help();
      case 'man':
        return this.man(args);
      case 'history':
        return this.history();
      case 'env':
        return this.env();
      case 'export':
        return this.export(args);
      case 'head':
        return this.head(args);
      case 'tail':
        return this.tail(args);
      case 'wc':
        return this.wc(args);
      case 'chmod':
        return this.chmod(args);
      case 'ps':
        return this.ps(args);
      case 'sort':
        return this.sort(args);
      case 'uniq':
        return this.uniq(args);
      case 'df':
        return this.df();
      case 'du':
        return this.du(args);
      case 'which':
        return this.which(args);
      default:
        return { 
          output: `bash: ${command}: command not found\nTry 'help' to see available commands`,
          newDirectory: this.currentDirectory 
        };
    }
  }

  pwd() {
    return { 
      output: this.currentDirectory,
      newDirectory: this.currentDirectory 
    };
  }

  ls(args) {
    const showHidden = args.includes('-a') || args.includes('-la');
    const longFormat = args.includes('-l') || args.includes('-la');
    
    const path = args.find(arg => !arg.startsWith('-')) || this.currentDirectory;
    const dir = this.resolvePath(path);
    
    if (!dir || dir.type !== 'directory') {
      return { 
        output: `ls: cannot access '${path}': No such file or directory`,
        newDirectory: this.currentDirectory 
      };
    }

    let items = Object.keys(dir.children || {});
    if (!showHidden) {
      items = items.filter(name => !name.startsWith('.'));
    }

    if (longFormat) {
      const output = items.map(name => {
        const item = dir.children[name];
        const type = item.type === 'directory' ? 'd' : '-';
        const perms = 'rwxr-xr-x';
        const size = item.type === 'file' ? (item.content?.length || 0) : 4096;
        return `${type}${perms} 1 user user ${size.toString().padStart(5)} Jan 01 12:00 ${name}`;
      }).join('\n');
      return { output, newDirectory: this.currentDirectory };
    }

    const output = items.map(name => {
      const item = dir.children[name];
      return item.type === 'directory' ? `\x1b[1;34m${name}/\x1b[0m` : name;
    }).join('  ');

    return { output, newDirectory: this.currentDirectory };
  }

  cd(path) {
    if (!path || path === '~') {
      this.currentDirectory = '/home/user';
      this.environmentVariables.PWD = this.currentDirectory;
      return { output: '', newDirectory: this.currentDirectory };
    }

    const newPath = this.resolvePath(path);
    if (!newPath || newPath.type !== 'directory') {
      return { 
        output: `bash: cd: ${path}: No such file or directory`,
        newDirectory: this.currentDirectory 
      };
    }

    this.currentDirectory = this.getAbsolutePath(path);
    this.environmentVariables.PWD = this.currentDirectory;
    return { output: '', newDirectory: this.currentDirectory };
  }

  cat(args) {
    if (args.length === 0) {
      return { 
        output: 'cat: missing file operand',
        newDirectory: this.currentDirectory 
      };
    }

    const outputs = [];
    for (const filename of args) {
      const file = this.resolvePath(filename);
      if (!file) {
        outputs.push(`cat: ${filename}: No such file or directory`);
      } else if (file.type === 'directory') {
        outputs.push(`cat: ${filename}: Is a directory`);
      } else {
        outputs.push(file.content || '');
      }
    }

    return { 
      output: outputs.join('\n'),
      newDirectory: this.currentDirectory 
    };
  }

  echo(args) {
    const text = args.join(' ').replace(/["']/g, '');
    const expanded = text.replace(/\$(\w+)/g, (match, varName) => {
      return this.environmentVariables[varName] || '';
    });
    return { 
      output: expanded,
      newDirectory: this.currentDirectory 
    };
  }

  mkdir(args) {
    if (args.length === 0) {
      return { 
        output: 'mkdir: missing operand',
        newDirectory: this.currentDirectory 
      };
    }

    const dirname = args[0];
    const parentPath = this.currentDirectory;
    const parent = this.resolvePath(parentPath);
    
    if (parent.children[dirname]) {
      return { 
        output: `mkdir: cannot create directory '${dirname}': File exists`,
        newDirectory: this.currentDirectory 
      };
    }

    parent.children[dirname] = {
      type: 'directory',
      children: {}
    };

    return { 
      output: '',
      newDirectory: this.currentDirectory 
    };
  }

  touch(args) {
    if (args.length === 0) {
      return { 
        output: 'touch: missing file operand',
        newDirectory: this.currentDirectory 
      };
    }

    const filename = args[0];
    const dir = this.resolvePath(this.currentDirectory);
    
    if (!dir.children[filename]) {
      dir.children[filename] = {
        type: 'file',
        content: ''
      };
    }

    return { 
      output: '',
      newDirectory: this.currentDirectory 
    };
  }

  rm(args) {
    if (args.length === 0) {
      return { 
        output: 'rm: missing operand',
        newDirectory: this.currentDirectory 
      };
    }

    const recursive = args.includes('-r') || args.includes('-rf');
    const force = args.includes('-f') || args.includes('-rf');
    const filename = args.find(arg => !arg.startsWith('-'));

    if (!filename) {
      return { 
        output: 'rm: missing operand',
        newDirectory: this.currentDirectory 
      };
    }

    const dir = this.resolvePath(this.currentDirectory);
    const target = dir.children[filename];

    if (!target && !force) {
      return { 
        output: `rm: cannot remove '${filename}': No such file or directory`,
        newDirectory: this.currentDirectory 
      };
    }

    if (target?.type === 'directory' && !recursive) {
      return { 
        output: `rm: cannot remove '${filename}': Is a directory`,
        newDirectory: this.currentDirectory 
      };
    }

    delete dir.children[filename];
    return { 
      output: '',
      newDirectory: this.currentDirectory 
    };
  }

  cp(args) {
    if (args.length < 2) {
      return { 
        output: 'cp: missing destination file operand',
        newDirectory: this.currentDirectory 
      };
    }

    const source = args[0];
    const dest = args[1];
    const sourceFile = this.resolvePath(source);
    
    if (!sourceFile) {
      return { 
        output: `cp: cannot stat '${source}': No such file or directory`,
        newDirectory: this.currentDirectory 
      };
    }

    const dir = this.resolvePath(this.currentDirectory);
    dir.children[dest] = JSON.parse(JSON.stringify(sourceFile));
    
    return { 
      output: '',
      newDirectory: this.currentDirectory 
    };
  }

  mv(args) {
    if (args.length < 2) {
      return { 
        output: 'mv: missing destination file operand',
        newDirectory: this.currentDirectory 
      };
    }

    const source = args[0];
    const dest = args[1];
    const dir = this.resolvePath(this.currentDirectory);
    
    if (!dir.children[source]) {
      return { 
        output: `mv: cannot stat '${source}': No such file or directory`,
        newDirectory: this.currentDirectory 
      };
    }

    dir.children[dest] = dir.children[source];
    delete dir.children[source];
    
    return { 
      output: '',
      newDirectory: this.currentDirectory 
    };
  }

  grep(args) {
    if (args.length < 2) {
      return { 
        output: 'Usage: grep [pattern] [file...]',
        newDirectory: this.currentDirectory 
      };
    }

    const pattern = args[0];
    const filename = args[1];
    const file = this.resolvePath(filename);

    if (!file) {
      return { 
        output: `grep: ${filename}: No such file or directory`,
        newDirectory: this.currentDirectory 
      };
    }

    if (file.type === 'directory') {
      return { 
        output: `grep: ${filename}: Is a directory`,
        newDirectory: this.currentDirectory 
      };
    }

    const lines = (file.content || '').split('\n');
    const matches = lines.filter(line => line.includes(pattern));
    
    return { 
      output: matches.join('\n'),
      newDirectory: this.currentDirectory 
    };
  }

  find(args) {
    const name = args.find((arg, i) => args[i-1] === '-name');
    if (!name) {
      return { 
        output: 'Usage: find [path] -name [pattern]',
        newDirectory: this.currentDirectory 
      };
    }

    const results = [];
    const searchDir = (path, dir) => {
      Object.entries(dir.children || {}).forEach(([childName, child]) => {
        const childPath = path === '/' ? `/${childName}` : `${path}/${childName}`;
        if (childName.includes(name.replace(/\*/g, ''))) {
          results.push(childPath);
        }
        if (child.type === 'directory') {
          searchDir(childPath, child);
        }
      });
    };

    const startPath = args[0] === '-name' ? this.currentDirectory : args[0];
    const startDir = this.resolvePath(startPath);
    searchDir(startPath, startDir);

    return { 
      output: results.join('\n'),
      newDirectory: this.currentDirectory 
    };
  }

  whoami() {
    return { 
      output: 'user',
      newDirectory: this.currentDirectory 
    };
  }

  date() {
    return { 
      output: new Date().toString(),
      newDirectory: this.currentDirectory 
    };
  }

  clear() {
    return { 
      output: '\x1b[2J\x1b[H',
      newDirectory: this.currentDirectory 
    };
  }

  help() {
    const commands = `🐧 Linux Command Reference
===========================

BASIC COMMANDS:
  pwd          - Print working directory
  ls [-la]     - List directory contents
  cd <dir>     - Change directory
  mkdir <dir>  - Create directory
  touch <file> - Create empty file
  rm <file>    - Remove file
  cp <src> <dst> - Copy file
  mv <src> <dst> - Move/rename file
  cat <file>   - Display file contents

FILE OPERATIONS:
  head [-n X] <file>  - Display first X lines (default 10)
  tail [-n X] <file>  - Display last X lines (default 10)
  wc [-lwc] <file>    - Count lines, words, characters
  sort [-rn] <file>   - Sort file contents
  uniq <file>         - Remove duplicate lines
  chmod <mode> <file> - Change file permissions
  grep <pattern> <file> - Search text in files
  find <path> -name <pattern> - Find files
  
SYSTEM INFO:
  ps [aux]     - Display running processes
  df           - Display disk usage  
  du [-h]      - Display directory sizes
  which <cmd>  - Show command location
  whoami       - Display current user
  date         - Show current date/time
  echo <text>  - Display text
  clear        - Clear terminal screen
  env          - Show environment variables
  export <var>=<value> - Set environment variable
  history      - Show command history

ADVANCED (Coming Soon):
  pipe |       - Chain commands together
  && and ||    - Conditional execution
  top          - Real-time system monitor
  tar          - Archive files
  ssh          - Secure shell
  awk          - Advanced text processing
  sed          - Stream editor
  
Type 'man <command>' for detailed help on any command.
Use arrow keys to navigate command history.`;

    return { 
      output: commands,
      newDirectory: this.currentDirectory 
    };
  }

  man(args) {
    if (args.length === 0) {
      return { 
        output: 'What manual page do you want?',
        newDirectory: this.currentDirectory 
      };
    }

    const manuals = {
      ls: 'NAME\n    ls - list directory contents\n\nSYNOPSIS\n    ls [OPTION]... [FILE]...\n\nDESCRIPTION\n    List information about the FILEs',
      cd: 'NAME\n    cd - change directory\n\nSYNOPSIS\n    cd [directory]\n\nDESCRIPTION\n    Change the current directory to the specified path',
      pwd: 'NAME\n    pwd - print working directory\n\nSYNOPSIS\n    pwd\n\nDESCRIPTION\n    Print the full pathname of the current working directory',
      cat: 'NAME\n    cat - concatenate files and print\n\nSYNOPSIS\n    cat [FILE]...\n\nDESCRIPTION\n    Concatenate FILE(s) to standard output'
    };

    const manual = manuals[args[0]] || `No manual entry for ${args[0]}`;
    return { 
      output: manual,
      newDirectory: this.currentDirectory 
    };
  }

  history() {
    return { 
      output: 'Command history not available in this session',
      newDirectory: this.currentDirectory 
    };
  }

  env() {
    const output = Object.entries(this.environmentVariables)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    return { 
      output,
      newDirectory: this.currentDirectory 
    };
  }

  export(args) {
    if (args.length === 0) {
      return this.env();
    }

    const assignment = args[0];
    const [key, value] = assignment.split('=');
    if (key && value) {
      this.environmentVariables[key] = value;
      return { 
        output: '',
        newDirectory: this.currentDirectory 
      };
    }

    return { 
      output: `export: '${assignment}': not a valid identifier`,
      newDirectory: this.currentDirectory 
    };
  }

  resolvePath(path) {
    if (!path) return null;
    
    let current = this.fileSystem['/'];
    let absolutePath = '';

    if (path === '/') {
      return current;
    }

    if (path.startsWith('/')) {
      absolutePath = path;
    } else if (path === '..') {
      const parts = this.currentDirectory.split('/').filter(p => p);
      parts.pop();
      absolutePath = '/' + parts.join('/');
    } else if (path === '.') {
      absolutePath = this.currentDirectory;
    } else {
      absolutePath = this.currentDirectory === '/' 
        ? '/' + path 
        : this.currentDirectory + '/' + path;
    }

    const parts = absolutePath.split('/').filter(p => p);
    for (const part of parts) {
      if (part === '..') {
        return null;
      }
      if (!current.children || !current.children[part]) {
        return null;
      }
      current = current.children[part];
    }

    return current;
  }

  getAbsolutePath(path) {
    if (path.startsWith('/')) {
      return path;
    }
    if (path === '..') {
      const parts = this.currentDirectory.split('/').filter(p => p);
      parts.pop();
      return '/' + parts.join('/') || '/';
    }
    if (path === '.') {
      return this.currentDirectory;
    }
    return this.currentDirectory === '/' 
      ? '/' + path 
      : this.currentDirectory + '/' + path;
  }

  // New command implementations
  head(args) {
    if (args.length === 0) {
      return { output: 'head: missing file operand', newDirectory: this.currentDirectory };
    }
    
    const lines = parseInt(args.find(arg => arg.startsWith('-n'))?.slice(2)) || 10;
    const filename = args.find(arg => !arg.startsWith('-'));
    
    if (!filename) {
      return { output: 'head: missing file operand', newDirectory: this.currentDirectory };
    }
    
    const file = this.resolvePath(filename);
    if (!file) {
      return { output: `head: ${filename}: No such file or directory`, newDirectory: this.currentDirectory };
    }
    if (file.type !== 'file') {
      return { output: `head: ${filename}: Is a directory`, newDirectory: this.currentDirectory };
    }
    
    const content = file.content || '';
    const contentLines = content.split('\n');
    const output = contentLines.slice(0, lines).join('\n');
    
    return { output, newDirectory: this.currentDirectory };
  }

  tail(args) {
    if (args.length === 0) {
      return { output: 'tail: missing file operand', newDirectory: this.currentDirectory };
    }
    
    const lines = parseInt(args.find(arg => arg.startsWith('-n'))?.slice(2)) || 10;
    const filename = args.find(arg => !arg.startsWith('-'));
    
    if (!filename) {
      return { output: 'tail: missing file operand', newDirectory: this.currentDirectory };
    }
    
    const file = this.resolvePath(filename);
    if (!file) {
      return { output: `tail: ${filename}: No such file or directory`, newDirectory: this.currentDirectory };
    }
    if (file.type !== 'file') {
      return { output: `tail: ${filename}: Is a directory`, newDirectory: this.currentDirectory };
    }
    
    const content = file.content || '';
    const contentLines = content.split('\n');
    const output = contentLines.slice(-lines).join('\n');
    
    return { output, newDirectory: this.currentDirectory };
  }

  wc(args) {
    if (args.length === 0) {
      return { output: 'wc: missing file operand', newDirectory: this.currentDirectory };
    }
    
    const filename = args.find(arg => !arg.startsWith('-'));
    if (!filename) {
      return { output: 'wc: missing file operand', newDirectory: this.currentDirectory };
    }
    
    const file = this.resolvePath(filename);
    if (!file) {
      return { output: `wc: ${filename}: No such file or directory`, newDirectory: this.currentDirectory };
    }
    if (file.type !== 'file') {
      return { output: `wc: ${filename}: Is a directory`, newDirectory: this.currentDirectory };
    }
    
    const content = file.content || '';
    const lines = content.split('\n').length;
    const words = content.split(/\s+/).filter(w => w).length;
    const bytes = content.length;
    
    const showLines = args.includes('-l') || (!args.some(a => a.startsWith('-')));
    const showWords = args.includes('-w') || (!args.some(a => a.startsWith('-')));
    const showBytes = args.includes('-c') || (!args.some(a => a.startsWith('-')));
    
    let output = '';
    if (showLines) output += lines + ' ';
    if (showWords) output += words + ' ';
    if (showBytes) output += bytes + ' ';
    output += filename;
    
    return { output: output.trim(), newDirectory: this.currentDirectory };
  }

  chmod(args) {
    if (args.length < 2) {
      return { output: 'chmod: missing operand', newDirectory: this.currentDirectory };
    }
    
    const mode = args[0];
    const filename = args[1];
    
    const file = this.resolvePath(filename);
    if (!file) {
      return { output: `chmod: cannot access '${filename}': No such file or directory`, newDirectory: this.currentDirectory };
    }
    
    // Simulate chmod (just store the mode as metadata)
    file.permissions = mode;
    
    return { output: '', newDirectory: this.currentDirectory };
  }

  ps(args) {
    const aux = args.includes('aux') || args.includes('-aux');
    
    if (aux) {
      return {
        output: `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1  19352  1536 ?        Ss   10:00   0:01 /sbin/init
user      1234  0.1  0.5  45632  5120 pts/0    S+   10:15   0:00 bash
user      1235  0.0  0.3  38456  3072 pts/0    R+   10:30   0:00 ps aux`,
        newDirectory: this.currentDirectory
      };
    }
    
    return {
      output: `  PID TTY          TIME CMD
 1234 pts/0    00:00:00 bash
 1235 pts/0    00:00:00 ps`,
      newDirectory: this.currentDirectory
    };
  }

  sort(args) {
    if (args.length === 0) {
      return { output: 'sort: missing file operand', newDirectory: this.currentDirectory };
    }
    
    const filename = args.find(arg => !arg.startsWith('-'));
    if (!filename) {
      return { output: 'sort: missing file operand', newDirectory: this.currentDirectory };
    }
    
    const file = this.resolvePath(filename);
    if (!file) {
      return { output: `sort: ${filename}: No such file or directory`, newDirectory: this.currentDirectory };
    }
    if (file.type !== 'file') {
      return { output: `sort: ${filename}: Is a directory`, newDirectory: this.currentDirectory };
    }
    
    const content = file.content || '';
    const lines = content.split('\n');
    const reverse = args.includes('-r');
    const numeric = args.includes('-n');
    
    lines.sort((a, b) => {
      if (numeric) {
        return reverse ? parseFloat(b) - parseFloat(a) : parseFloat(a) - parseFloat(b);
      }
      return reverse ? b.localeCompare(a) : a.localeCompare(b);
    });
    
    return { output: lines.join('\n'), newDirectory: this.currentDirectory };
  }

  uniq(args) {
    if (args.length === 0) {
      return { output: 'uniq: missing file operand', newDirectory: this.currentDirectory };
    }
    
    const filename = args.find(arg => !arg.startsWith('-'));
    if (!filename) {
      return { output: 'uniq: missing file operand', newDirectory: this.currentDirectory };
    }
    
    const file = this.resolvePath(filename);
    if (!file) {
      return { output: `uniq: ${filename}: No such file or directory`, newDirectory: this.currentDirectory };
    }
    if (file.type !== 'file') {
      return { output: `uniq: ${filename}: Is a directory`, newDirectory: this.currentDirectory };
    }
    
    const content = file.content || '';
    const lines = content.split('\n');
    const unique = [];
    let prev = null;
    
    for (const line of lines) {
      if (line !== prev) {
        unique.push(line);
        prev = line;
      }
    }
    
    return { output: unique.join('\n'), newDirectory: this.currentDirectory };
  }

  df() {
    return {
      output: `Filesystem     1K-blocks    Used Available Use% Mounted on
/dev/sda1       20480000  8192000  11264000  43% /
tmpfs            2048000        0   2048000   0% /dev/shm
/dev/sda2       40960000 16384000  22528000  43% /home`,
      newDirectory: this.currentDirectory
    };
  }

  du(args) {
    const humanReadable = args.includes('-h');
    const path = args.find(arg => !arg.startsWith('-')) || '.';
    
    const dir = this.resolvePath(path);
    if (!dir) {
      return { output: `du: cannot access '${path}': No such file or directory`, newDirectory: this.currentDirectory };
    }
    
    // Simulate disk usage
    const size = humanReadable ? '4.0K' : '4';
    return { output: `${size}\t${path}`, newDirectory: this.currentDirectory };
  }

  which(args) {
    if (args.length === 0) {
      return { output: 'which: missing argument', newDirectory: this.currentDirectory };
    }
    
    const command = args[0];
    const knownCommands = ['ls', 'cd', 'pwd', 'cat', 'echo', 'grep', 'find', 'mkdir', 'touch', 'rm', 'cp', 'mv', 'head', 'tail', 'wc', 'chmod', 'ps', 'sort', 'uniq', 'df', 'du', 'which'];
    
    if (knownCommands.includes(command)) {
      return { output: `/usr/bin/${command}`, newDirectory: this.currentDirectory };
    }
    
    return { output: '', newDirectory: this.currentDirectory };
  }
}

export default CommandSimulator;