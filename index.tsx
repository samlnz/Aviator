import React from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './index.css';
import App from './app';
import { Provider } from './context';

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider>
        <Routes>
          <Route path="*" element={<App />} />
        </Routes>
        <ToastContainer position="top-center" theme="dark" />
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);