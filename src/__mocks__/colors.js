// Mock implementation of colors package for browser
const colors = {
  // Define color methods as no-ops
  red: (str) => str,
  green: (str) => str,
  yellow: (str) => str,
  blue: (str) => str,
  magenta: (str) => str,
  cyan: (str) => str,
  white: (str) => str,
  gray: (str) => str,
  grey: (str) => str,
  black: (str) => str,
  // Add other color methods as needed
};

// Enable chaining
Object.keys(colors).forEach(color => {
  colors[color].bold = (str) => str;
  colors[color].underline = (str) => str;
  colors[color].italic = (str) => str;
  // Add other text styles as needed
});

export default colors;
