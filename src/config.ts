
export const config = {
  development: process.env.REACT_APP_DEVELOPMENT === "true",
  debug: true,
  appKey: "crash-0.1.0",
  api: `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api`,
  wss: process.env.REACT_APP_API_URL || 'http://localhost:5001',
};
