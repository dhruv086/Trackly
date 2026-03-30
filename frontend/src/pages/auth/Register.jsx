import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, clearError } from '../../store/slices/authSlice';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Mail, Lock, User, Github, Chrome, CheckCircle } from 'lucide-react';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [validationErrors, setValidationErrors] = useState({});

  const handleRegister = async (e) => {
    e.preventDefault();
    setValidationErrors({});

    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    setValidationErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const result = await dispatch(register(formData));
      if (register.fulfilled.match(result)) {
        navigate('/');
      }
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join thousands of teams managing projects together"
    >
      <form onSubmit={handleRegister} className="space-y-5">
        {error && (
          <div className="p-3 text-sm font-medium text-rose-500 bg-rose-50 border border-rose-100 rounded-lg">
            {error}
          </div>
        )}
        <Input
          label="Username"
          type="text"
          placeholder="johndoe"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          error={validationErrors.username}
          autoComplete="username"
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={validationErrors.email}
          autoComplete="email"
        />

        <Input
          label="Create Password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={validationErrors.password}
          autoComplete="new-password"
        />

        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-2 text-[11px] font-medium text-slate-500">
            <CheckCircle size={14} className="text-emerald-500 mt-0.5" />
            <span>At least 6 characters long</span>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-4 text-base"
          loading={loading}
        >
          Create Account
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Or sign up with</span>
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
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;
