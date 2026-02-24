import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // **CHÚ Ý: Thay Router bằng Route**
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import UserManagerInfoPage from './pages/UserManagerInfoPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage/>}></Route> 
        <Route path="/register" element={<RegisterPage/>}></Route>
        <Route path="/home" element={<HomePage/>}></Route> 
        <Route path="/userInfo" element={<UserManagerInfoPage/>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;