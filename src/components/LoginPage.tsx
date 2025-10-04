import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginPageProps {
  onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { signIn, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await signIn(formData.email, formData.password);
      // Navigation will be handled by the parent component based on auth state
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-2">
            {t('adminLogin', 'Admin Login')}
          </h2>
          <p className="text-gray-600">
            {t('adminLoginDescription', 'Please sign in to access the admin dashboard')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              {t('email', 'Email')}
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              {t('password', 'Password')}
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#13005A] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#1C82AD] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md"
            >
              {loading ? t('signing_in', 'Signing In...') : t('signIn', 'Sign In')}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              {t('back', 'Back to Home')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
