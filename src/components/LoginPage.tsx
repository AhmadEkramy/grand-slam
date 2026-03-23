import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';

interface LoginPageProps {
  onBack: () => void;
  title?: string;
  subtitle?: string;
  allowSignUp?: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onBack, title, subtitle, allowSignUp = false }) => {
  const { t } = useLanguage();
  const { signIn, signUp, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      // Trim inputs to avoid whitespace-only credentials
      const email = formData.email.trim();
      const password = formData.password.trim();
      if (!email || !password) {
        setError('الرجاء إدخال البريد الإلكتروني وكلمة المرور بشكل صحيح.');
        return;
      }

      if (isSignUp) {
        // Create account (pass displayName)
        await signUp(email, password, formData.fullName || undefined);
      } else {
        await signIn(email, password);
      }
      // Navigation will be handled by the parent component based on auth state
    } catch (err: unknown) {
      let msg = 'An error occurred';
      if (err && typeof err === 'object') {
        const e = err as Record<string, unknown> & { code?: string };
        if (typeof e.message === 'string') msg = e.message;
        if (typeof e.code === 'string') msg = `${msg} (code: ${e.code})`;
      }
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-2">
            {title || t('adminLogin', 'Admin Login')}
          </h2>
          <p className="text-gray-600">
            {subtitle || t('adminLoginDescription', 'Please sign in to access the admin dashboard')}
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

          {isSignUp && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">Full name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>
          )}

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
              {loading ? (isSignUp ? 'Creating...' : 'Signing In...') : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>

            <div className="flex gap-2">
              {allowSignUp && (
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  {isSignUp ? 'Have an account? Sign In' : 'Create an account'}
                </button>
              )}

              <button
                type="button"
                onClick={onBack}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                {t('back', 'Back to Home')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
