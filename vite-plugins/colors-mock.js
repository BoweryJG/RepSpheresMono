// Vite plugin to mock the 'colors' package
export default function colorsMock() {
  return {
    name: 'colors-mock',
    resolveId(source) {
      if (source === 'colors' || source === 'colors/safe') {
        return { id: '\0' + source, external: false };
      }
      return null;
    },
    load(id) {
      if (id === '\0colors' || id === '\0colors/safe') {
        // Return a mock implementation of the colors package
        return `
          const colors = {
            red: str => str,
            green: str => str,
            yellow: str => str,
            blue: str => str,
            magenta: str => str,
            cyan: str => str,
            white: str => str,
            gray: str => str,
            grey: str => str,
            black: str => str,
            // Add other color methods as needed
          };
          
          // Enable method chaining
          Object.keys(colors).forEach(color => {
            colors[color].bold = str => str;
            colors[color].underline = str => str;
            colors[color].italic = str => str;
            colors[color].inverse = str => str;
            colors[color].strikethrough = str => str;
            colors[color].dim = str => str;
          });
          
          export default colors;
        `;
      }
      return null;
    }
  };
}
