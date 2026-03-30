import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { Ghost, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl shadow-indigo-100 flex items-center justify-center text-indigo-600 mb-8 animate-bounce">
        <Ghost size={48} />
      </div>
      <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-4">404</h1>
      <h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Workspace Not Found</h2>
      <p className="text-slate-400 font-medium max-w-md mb-10 leading-relaxed">
        It seems the page you are looking for has been moved, deleted, or never existed in the first place.
      </p>
      <div className="flex gap-4">
        <Button variant="secondary" onClick={() => window.history.back()}>
          <ArrowLeft size={18} className="mr-2" />
          Go Back
        </Button>
        <Link to="/dashboard">
          <Button variant="primary">
            <Home size={18} className="mr-2" />
            Home Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
