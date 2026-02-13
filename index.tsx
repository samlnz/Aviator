import React from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './index.scss';
import App from './src/app';
import { Provider } from './src/context';

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);

root.render(
	<BrowserRouter>
		<Routes>
			<Route path="*" element={
				<Provider>
					<App />
					<ToastContainer position="top-center" theme="dark" />
				</Provider>
			} />
		</Routes>
	</BrowserRouter>
);