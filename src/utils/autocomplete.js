// Available commands for autocomplete
const AVAILABLE_COMMANDS = [
  'pwd', 'ls', 'cd', 'cat', 'echo', 'mkdir', 'touch', 'rm', 'cp', 'mv',
  'grep', 'find', 'chmod', 'whoami', 'date', 'clear', 'help', 'man',
  'history', 'env', 'export', 'ps', 'kill', 'top', 'df', 'tar', 'ssh',
  'exit', 'nano', 'vim', 'sed', 'awk', 'sort', 'uniq', 'wc', 'head', 'tail'
];

// Common directories and files for path autocomplete
const COMMON_PATHS = [
  'documents/', 'projects/', 'downloads/', 'desktop/', 'pictures/',
  'readme.txt', 'notes.txt', '.bashrc', 'config.json', 'main.py'
];

class AutocompleteEngine {
  constructor() {
    this.commands = AVAILABLE_COMMANDS;
    this.paths = COMMON_PATHS;
  }

  // Get suggestions based on partial input
  getSuggestions(input, type = 'command') {
    if (!input) return [];
    
    const searchTerm = input.toLowerCase();
    
    if (type === 'command') {
      // For commands, match from the beginning
      return this.commands
        .filter(cmd => cmd.toLowerCase().startsWith(searchTerm))
        .sort()
        .slice(0, 10); // Limit to 10 suggestions
    } else if (type === 'path') {
      // For paths, match anywhere in the string
      return this.paths
        .filter(path => path.toLowerCase().includes(searchTerm))
        .sort()
        .slice(0, 10);
    }
    
    return [];
  }

  // Complete the input with the selected suggestion
  complete(input, suggestion) {
    const parts = input.split(' ');
    if (parts.length === 1) {
      // Completing a command
      return suggestion;
    } else {
      // Completing an argument
      parts[parts.length - 1] = suggestion;
      return parts.join(' ');
    }
  }

  // Determine what type of autocomplete to use
  getAutocompleteType(input) {
    const parts = input.trim().split(' ');
    
    if (parts.length === 1) {
      // First word is always a command
      return 'command';
    } else {
      // After the command, usually paths or arguments
      const command = parts[0];
      const pathCommands = ['cd', 'ls', 'cat', 'rm', 'cp', 'mv', 'touch', 'mkdir'];
      
      if (pathCommands.includes(command)) {
        return 'path';
      }
    }
    
    return null;
  }

  // Get the part of input that should be autocompleted
  getAutocompletePart(input) {
    const parts = input.split(' ');
    return parts[parts.length - 1];
  }
}

export default AutocompleteEngine;