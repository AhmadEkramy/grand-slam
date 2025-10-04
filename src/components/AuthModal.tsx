
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { signIn, signUp, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isSignUp) {
        await signUp(formData.email, formData.password, formData.fullName || undefined);
      } else {
        await signIn(formData.email, formData.password);
      }
      onClose();
    } catch (error: unknown) {
      let msg = 'An error occurred';
      if (error && typeof error === 'object') {
        const e = error as Record<string, unknown>;
        if (typeof e.message === 'string') msg = e.message;
      }
      setError(msg);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">
            {isSignUp ? t('signUp', 'Sign Up') : t('signIn', 'Sign In')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">
              {t('email', 'Email')}
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="form-control"
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-gray-700 mb-2">Full name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="form-control"
              />
            </div>
          )}

          <div>
            <label className="block text-gray-700 mb-2">
              {t('password', 'Password')}
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="form-control"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-success w-full"
            >
              {loading ? t('loading', 'Loading...') : 
               isSignUp ? t('signUp', 'Sign Up') : t('signIn', 'Sign In')}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary hover:text-accent"
          >
            {isSignUp 
              ? t('alreadyHaveAccount', 'Already have an account? Sign In') 
              : t('needAccount', 'Need an account? Sign Up')
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
