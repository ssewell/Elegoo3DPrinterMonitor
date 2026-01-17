import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from '../components/ErrorBoundary';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
