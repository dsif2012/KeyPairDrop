// src/lib/polyfill.ts
if (typeof window !== 'undefined') {
  window.global = window;
  window.process = require('process');
  window.Buffer = require('buffer').Buffer;
}

