import React from 'react';
import LoginForm from '../components/Auth/LoginForm';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/');
  }

  const handleLoginSuccess = (userData: any, token: string) => {
    login(userData, token);
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md rounded-md shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Log in to your account</h2>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};

export default Login;
