// OAuth client IDs are public identifiers, not secrets. Set this before deployment.
export const API_URL = 'https://notes-api-646952944612.us-east1.run.app';

// Local development keeps the encrypted workspace entirely in this browser.
export const LOCAL_ONLY = typeof location !== 'undefined' &&
  ['localhost', '127.0.0.1', '[::1]', '::1'].includes(location.hostname);
