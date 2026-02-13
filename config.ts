const baseUrl = process.env.REACT_APP_API_URL || window.location.origin;

export const config = {
  development: process.env.REACT_APP_DEVELOPMENT === "true",
  debug: true,
  appKey: "crash-0.1.0",
  api: `${baseUrl}/api`,
  wss: baseUrl.replace(/^http/, 'ws'),
};