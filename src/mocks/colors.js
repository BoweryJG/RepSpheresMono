// Minimal mock for 'colors' package to prevent browser errors.
const identity = (text) => String(text === undefined ? '' : text);

const styles = [
  'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray', 'grey', 'black',
  'bold', 'italic', 'underline', 'inverse', 'strikethrough',
  'rainbow', 'zebra', 'america', 'trap', 'random', 'zalgo'
];

// Base object for the proxy, includes non-style methods
const colorsBase = {
  _text: '', // Internal state to hold the current string
  enable: () => {},
  disable: () => {},
  stripColors: identity,
  strip: identity,
  themes: {},
  setTheme: () => {},
  // Make it behave like a string when needed
  toString: function() { return this._text; },
  valueOf: function() { return this._text; }, // for Symbol.toPrimitive default
  [Symbol.toPrimitive]: function(hint) {
    if (hint === 'string' || hint === 'default') {
      return this._text;
    }
    return null; // Or throw error for number hint
  },
};

// Handler for the proxy to enable chaining
const chainHandler = {
  get: function(target, prop) {
    if (prop in target) {
      return target[prop];
    }
    if (typeof prop === 'string' && styles.includes(prop)) {
      // If a style property is accessed, return a new proxy
      // that can be called as a function (to set text) or further chained.
      const styleFunction = (...args) => {
        const newText = args.length > 0 ? String(args[0] === undefined ? '' : args[0]) : target._text;
        // Create a new base for the proxy to avoid mutating shared state
        return new Proxy({ ...colorsBase, _text: newText }, chainHandler);
      };
      return styleFunction;
    }
    // For any other property, return a function that returns a new chainable proxy
    return () => new Proxy(target, chainHandler);
  },
  apply: function(targetAsFunction, thisArg, argumentsList) {
    // This allows the root mock itself to be called: colors('text')
    // It should behave like a style function, setting the text and returning a chainable proxy.
    const newText = argumentsList.length > 0 ? String(argumentsList[0] === undefined ? '' : argumentsList[0]) : '';
    return new Proxy({ ...colorsBase, _text: newText }, chainHandler);
  }
};

const colorsMock = new Proxy(colorsBase, chainHandler);

export default colorsMock;

// Export individual style functions for named imports
export const red = colorsMock.red;
export const green = colorsMock.green;
export const yellow = colorsMock.yellow;
export const blue = colorsMock.blue;
export const magenta = colorsMock.magenta;
export const cyan = colorsMock.cyan;
export const white = colorsMock.white;
export const gray = colorsMock.gray;
export const grey = colorsMock.grey;
export const black = colorsMock.black;
export const bold = colorsMock.bold;
export const italic = colorsMock.italic;
export const underline = colorsMock.underline;
export const inverse = colorsMock.inverse;
export const strikethrough = colorsMock.strikethrough;
export const rainbow = colorsMock.rainbow;
export const zebra = colorsMock.zebra;
export const america = colorsMock.america;
export const trap = colorsMock.trap;
export const random = colorsMock.random;
export const zalgo = colorsMock.zalgo;
export const stripColors = colorsMock.stripColors;
export const setTheme = colorsMock.setTheme;
export const enable = colorsMock.enable;
export const disable = colorsMock.disable;
