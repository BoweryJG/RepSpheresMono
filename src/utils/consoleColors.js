// Simple console colors for both browser and Node.js
const colors = {
  // Text colors
  black: (str) => colorize(str, 30),
  red: (str) => colorize(str, 31),
  green: (str) => colorize(str, 32),
  yellow: (str) => colorize(str, 33),
  blue: (str) => colorize(str, 34),
  magenta: (str) => colorize(str, 35),
  cyan: (str) => colorize(str, 36),
  white: (str) => colorize(str, 37),
  
  // Background colors
  bgBlack: (str) => colorize(str, 40, true),
  bgRed: (str) => colorize(str, 41, true),
  bgGreen: (str) => colorize(str, 42, true),
  bgYellow: (str) => colorize(str, 43, true),
  bgBlue: (str) => colorize(str, 44, true),
  bgMagenta: (str) => colorize(str, 45, true),
  bgCyan: (str) => colorize(str, 46, true),
  bgWhite: (str) => colorize(str, 47, true),
  
  // Text styles
  reset: (str) => `\x1b[0m${str}\x1b[0m`,
  bright: (str) => colorize(str, 1),
  dim: (str) => colorize(str, 2),
  italic: (str) => colorize(str, 3),
  underline: (str) => colorize(str, 4),
  blink: (str) => colorize(str, 5),
  reverse: (str) => colorize(str, 7),
  hidden: (str) => colorize(str, 8),
  
  // Aliases for compatibility
  error: (str) => colorize(str, 31), // red
  warn: (str) => colorize(str, 33),  // yellow
  info: (str) => colorize(str, 36),  // cyan
  success: (str) => colorize(str, 32), // green
  
  // Enable colors (no-op for browser)
  enable: () => {},
  disable: () => {}
};

// Helper function to apply ANSI color codes
function colorize(str, code, isBackground = false) {
  if (typeof window === 'undefined') {
    // Node.js environment
    return `\x1b[${code}${isBackground ? ';7m' : 'm'}${str}\x1b[0m`;
  }
  // Browser environment - return string as is
  return str;
}

export default colors;
