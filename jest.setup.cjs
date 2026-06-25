// Custom matchers from @testing-library/jest-dom (toBeInTheDocument, etc.)
require('@testing-library/jest-dom');

// react-router-dom 7 uses TextEncoder/Decoder which JSDOM doesn't expose by default.
const { TextEncoder, TextDecoder } = require('util');
if (typeof globalThis.TextEncoder === 'undefined') globalThis.TextEncoder = TextEncoder;
if (typeof globalThis.TextDecoder === 'undefined') globalThis.TextDecoder = TextDecoder;
