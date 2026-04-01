import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearError } from '../../store/slices/authSlice';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Mail, Lock, Github, Chrome } from 'lucide-react';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [validationErrors, setValidationErrors] = useState({});

  const handleLogin = async (e) => {
    e.preventDefault();
    setValidationErrors({});

    if (!formData.username) {
      setValidationErrors({ username: 'Username or Email is required' });
      return;
    }
    if (!formData.password) {
      setValidationErrors({ password: 'Password is required' });
      return;
    }

    // Detect if the user typed an email address and send the right field
    const isEmail = formData.username.includes('@');
    const credentials = isEmail
      ? { email: formData.username, password: formData.password }
      : { username: formData.username, password: formData.password };

    const result = await dispatch(login(credentials));
    if (login.fulfilled.match(result)) {
      navigate('/');
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your project workspace to continue"
    >
      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <div className="p-3 text-sm font-medium text-rose-500 bg-rose-50 border border-rose-100 rounded-lg">
            {error}
          </div>
        )}
        <Input
          label="Username"
          type="text"
          placeholder="username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          error={validationErrors.username}
          autoComplete="username"
        />

        <div className="space-y-1">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={validationErrors.password}
            autoComplete="current-password"
          />
          <div className="flex justify-end">
            <button type="button" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              Forgot password?
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-4 text-base"
          loading={loading}
        >
          Sign In
        </Button>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="secondary" className="w-full py-3">
            <Chrome size={18} className="mr-2" />
            Google
          </Button>
          <Button variant="secondary" className="w-full py-3">
            <Github size={18} className="mr-2" />
            Github
          </Button>
        </div>

        <p className="text-center text-sm font-medium text-slate-500 pt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 font-bold hover:underline">
            Create account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
