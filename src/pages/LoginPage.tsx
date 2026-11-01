import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { normalizeLogin, isValidBdMobile } from '../utils/logic';
import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  queryString: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ queryString }) => {
  const { users, loginUser, registerUser, showToast } = useStore();

  const params = new URLSearchParams(queryString || '');
  const isRegDefault = params.get('m') === 'reg';
  const nextUrl = params.get('next') || '#/account';

  const [mode, setMode] = useState<'login' | 'reg'>(isRegDefault ? 'reg' : 'login');

  // Form states
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [regLogin, setRegLogin] = useState('');
  const [regPass, setRegPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const norm = normalizeLogin(loginInput);
    if (!norm) {
      showToast('Enter your mobile number, email, or username');
      return;
    }

    setIsSubmitting(true);

    // Compute SHA-256
    let hash = '';
    try {
      const msgBuffer = new TextEncoder().encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      hash = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      hash = btoa(password);
    }

    const found = users.find(
      (u) => (u.login === norm || u.phone === norm) && u.pass === hash
    );

    setIsSubmitting(false);

    if (found) {
      loginUser(found);
      window.location.hash = nextUrl.startsWith('#') ? nextUrl : `#${nextUrl}`;
    } else {
      showToast('Wrong login or password');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Enter your full name');
      return;
    }
    const norm = normalizeLogin(regLogin);
    if (!norm) {
      showToast('Enter a valid mobile number or email');
      return;
    }
    if (regPass.length < 6) {
      showToast('Password must be at least 6 characters');
      return;
    }
    if (regPass !== confirmPass) {
      showToast('Passwords do not match');
      return;
    }

    const phoneValue = isValidBdMobile(regLogin) ? regLogin.replace(/[\s-]/g, '') : '';

    setIsSubmitting(true);
    const success = await registerUser(name.trim(), norm, regPass, phoneValue);
    setIsSubmitting(false);

    if (success) {
      window.location.hash = nextUrl.startsWith('#') ? nextUrl : `#${nextUrl}`;
    }
  };

  return (
    <div className="max-w-[420px] mx-auto py-6 px-2 page-enter">
      <div className="bg-white rounded-lg border border-[#e0e0e0] overflow-hidden shadow-xs">
        {/* Banner */}
        <div className="bg-[#fff7f2] p-5 text-center border-b border-[#e0e0e0]">
          <div className="text-3xl mb-1">🛍️</div>
          <h1 className="text-lg font-bold text-[#f85606]">Welcome to Smart Bazar</h1>
          <p className="text-xs text-[#757575] mt-0.5">
            {mode === 'login'
              ? 'Login to your account to continue'
              : 'Create a new account for fast checkout'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#e0e0e0]">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              mode === 'login'
                ? 'text-[#f85606] border-b-2 border-[#f85606]'
                : 'text-[#757575] hover:text-[#212121]'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('reg')}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              mode === 'reg'
                ? 'text-[#f85606] border-b-2 border-[#f85606]'
                : 'text-[#757575] hover:text-[#212121]'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5">
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#212121] block mb-1">
                  Mobile number / email / username
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 01712345678 or user@email.com"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  className="w-full text-sm border border-[#e0e0e0] rounded-lg p-2.5 focus:border-[#f85606] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#212121] block mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-sm border border-[#e0e0e0] rounded-lg p-2.5 pr-9 focus:border-[#f85606] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-2.5 top-3 text-gray-400 hover:text-gray-600"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#f85606] hover:bg-[#d94a04] active:scale-[0.99] disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-sm transition-all shadow-xs mt-2"
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>

              <div className="text-center text-xs text-[#757575] pt-2">
                New here?{' '}
                <button
                  type="button"
                  onClick={() => setMode('reg')}
                  className="font-bold text-[#f85606] hover:underline"
                >
                  Register
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#212121] block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hasan Nasrullah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm border border-[#e0e0e0] rounded-lg p-2.5 focus:border-[#f85606] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#212121] block mb-1">
                  Mobile number or email
                </label>
                <input
                  type="text"
                  required
                  placeholder="01XXXXXXXXX or email@domain.com"
                  value={regLogin}
                  onChange={(e) => setRegLogin(e.target.value)}
                  className="w-full text-sm border border-[#e0e0e0] rounded-lg p-2.5 focus:border-[#f85606] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#212121] block mb-1">
                  Password (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  placeholder="Create password"
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  className="w-full text-sm border border-[#e0e0e0] rounded-lg p-2.5 focus:border-[#f85606] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#212121] block mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repeat password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full text-sm border border-[#e0e0e0] rounded-lg p-2.5 focus:border-[#f85606] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#f85606] hover:bg-[#d94a04] active:scale-[0.99] disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-sm transition-all shadow-xs mt-2"
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>

              <div className="text-center text-xs text-[#757575] pt-2">
                Already a member?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-[#f85606] hover:underline"
                >
                  Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
