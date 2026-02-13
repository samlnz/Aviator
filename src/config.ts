const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

export const config = {
  development: false,
  debug: true,
  appKey: "crash-0.1.0",
  api: `${baseUrl}/api`,
  wss: baseUrl.replace(/^http/, 'ws'),
};
