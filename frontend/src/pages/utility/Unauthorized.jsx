import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { ShieldAlert, Home, Lock } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 bg-rose-500 rounded-[2rem] shadow-2xl shadow-rose-200 flex items-center justify-center text-white mb-8">
        <ShieldAlert size={48} />
      </div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Access Restricted</h1>
      <p className="text-slate-400 font-medium max-w-sm mb-10 leading-relaxed">
        You do not have the required permissions to view this module. Please contact your system administrator.
      </p>
      <Link to="/dashboard">
        <Button variant="primary" className="px-10">
          <Home size={18} className="mr-2" />
          Return Safety
        </Button>
      </Link>
    </div>
  );
};

export default Unauthorized;
