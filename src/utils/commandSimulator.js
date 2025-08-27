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
                      }
                    }
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
      default:
        return { 
          output: `bash: ${command}: command not found`,
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
  chmod <mode> <file> - Change file permissions
  grep <pattern> <file> - Search text in files
  find <path> -name <pattern> - Find files
  
SYSTEM INFO:
  whoami       - Display current user
  date         - Show current date/time
  echo <text>  - Display text
  clear        - Clear terminal screen
  env          - Show environment variables
  history      - Show command history

ADVANCED (Practice in higher levels):
  ps           - Process status
  kill         - Terminate process
  top          - System monitor
  df           - Disk usage
  tar          - Archive files
  ssh          - Secure shell
  awk          - Text processing
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
}

export default CommandSimulator;