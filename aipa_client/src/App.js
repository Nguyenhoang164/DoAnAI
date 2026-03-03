import './App.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './features/auth/context';
import { AppRoutes } from './app/routes';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
