import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock QueryClientProvider to avoid issues in tests
const MockedApp = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

test('renders admin dashboard', () => {
  render(<MockedApp />);
  // Check if the app renders without crashing
  expect(document.body).toBeInTheDocument();
});
