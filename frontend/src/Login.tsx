import React, { useState, useEffect } from 'react';
import { Star, Eye, EyeOff, Check, Apple } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useAuthStore } from './store/authStore';
import OTPVerification from './components/OTPVerification';
import { FieldErrors, extractErrorMessage, extractFieldErrors } from './utils/formErrors';

type LoginField = 'email' | 'password';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<LoginField>>({});
  const [formError, setFormError] = useState('');

  const navigate = useNavigate();
  const { loginAsync, isLoggingIn, loginError, refetchUser } = useAuth();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      if (user && !user.emailVerified) {
        setUnverifiedEmail(user.email);
        setShowOTP(true);
      } else {
        navigate('/home');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const errors: FieldErrors<LoginField> = {};
    if (!email.trim()) {
      errors.email = 'Email is required';
    }
    if (!password.trim()) {
      errors.password = 'Password is required';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const loggedInUser = await loginAsync({ email: email.trim(), password });
      if (loggedInUser && !loggedInUser.emailVerified) {
        setUnverifiedEmail(loggedInUser.email);
        setShowOTP(true);
      } else {
        navigate('/home');
      }
    } catch (error) {
      console.error('Login failed:', error);
      const errors = extractFieldErrors<LoginField>(error);
      const message = extractErrorMessage(error, 'Login failed. Please try again.');
      const status = (error as any)?.response?.status;

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
      } else if (status === 404 || message.toLowerCase().includes('email')) {
        setFieldErrors({ email: message });
      } else if (status === 401 || message.toLowerCase().includes('password')) {
        setFieldErrors({ password: message });
      } else {
        setFormError(message);
      }
    }
  };

  const handleOTPVerified = async () => {
    await refetchUser();
    setShowOTP(false);
    navigate('/home');
  };

  if (showOTP) {
    return (
      <OTPVerification 
        email={unverifiedEmail}
        onVerified={handleOTPVerified}
        onBack={() => setShowOTP(false)}
        autoSent={false} // We don't automatically send OTP on login, unless we want to
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-40px)] flex items-center justify-center p-4 md:p-8 bg-surface">
      <main className="w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-2 bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-[0_4px_24px_-4px_rgba(139,78,62,0.08)] border border-surface-variant/50">
        
        {/* Left Side: Visual / Brand */}
        <section className="relative hidden md:block overflow-hidden">
          <img 
            className="absolute inset-0 w-full h-full object-cover" 
            alt="Friends laughing in a meadow" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4r_OYC5YowbJvkrbbQYkQhex-tTjKOLXHbxQimanar8PPlEapmQWFiWB1pKt0jYxcduIYi4-7zUX4IaUbzviU6SfPfgW2fZLX2ohO_gGzyP8fuHsfEzVg-jCXTh-iktNfY7FSJPpOuXIhX6np7IOBiiePkwrLwM_zper-5Bt30E_EP1e1nsVhrNyaCkIALHHHDKpVeNKh5gXn51Qv07emDhShdVGhbN-qZifTP_oqBu-CTBP5hPlx9e5CXaGPvIUd8WQgmu9x3z8" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent"></div>
          <div className="absolute bottom-12 left-12 right-12 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Star fill="currentColor" size={32} />
              <h1 className="text-3xl font-bold tracking-tight">Moments</h1>
            </div>
            <p className="text-lg font-medium opacity-90 leading-relaxed">
              Designed for the heartbeat of human connection. Find your kindred spirits in a space that feels like home.
            </p>
          </div>
        </section>

        {/* Right Side: Login Form */}
        <section className="flex flex-col justify-center p-8 md:p-16 bg-surface-container-lowest">
          
          {/* Mobile Brand Header */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-8 text-primary">
            <Star fill="currentColor" size={28} />
            <span className="text-2xl font-bold tracking-tight">Moments</span>
          </div>

          <div className="max-w-md mx-auto w-full">
            <header className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-bold text-on-surface mb-2">Welcome Back</h2>
              <p className="text-base font-medium text-on-surface-variant">Log in to see what your kindred spirits have been up to.</p>
            </header>

            {/* Login Form */}
            <form className="space-y-6" onSubmit={handleLogin} noValidate>
              {(formError || (loginError && Object.keys(fieldErrors).length === 0)) && (
                <div className="p-4 bg-error-container rounded-2xl border border-error">
                  <p className="text-sm font-medium text-on-error-container">
                    {formError || extractErrorMessage(loginError, 'Login failed. Please try again.')}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                
                {/* Email Input */}
                <div className="group">
                  <label className="block text-sm font-bold text-on-surface-variant mb-2 ml-1" htmlFor="email">Email or Username</label>
                  <div className="relative focus-within:ring-4 focus-within:ring-tertiary/10 rounded-full transition-all duration-300">
                    <input 
                      id="email" 
                      placeholder="Enter your email" 
                      type="text"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setFieldErrors((current) => ({ ...current, email: undefined }));
                        setFormError('');
                      }}
                      disabled={isLoggingIn}
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
                      className={`w-full px-6 py-4 bg-surface-container rounded-full border-2 focus:ring-0 text-on-surface text-base font-medium transition-all outline-none disabled:opacity-50 ${fieldErrors.email ? 'border-error focus:border-error' : 'border-transparent focus:border-tertiary'}`} 
                    />
                  </div>
                  {fieldErrors.email && (
                    <p id="login-email-error" className="mt-2 ml-1 text-sm font-medium text-error">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Password Input */}
                <div className="group">
                  <label className="block text-sm font-bold text-on-surface-variant mb-2 ml-1" htmlFor="password">Password</label>
                  <div className="relative focus-within:ring-4 focus-within:ring-tertiary/10 rounded-full transition-all duration-300">
                    <input 
                      id="password" 
                      placeholder="••••••••" 
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setFieldErrors((current) => ({ ...current, password: undefined }));
                        setFormError('');
                      }}
                      disabled={isLoggingIn}
                      aria-invalid={Boolean(fieldErrors.password)}
                      aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                      className={`w-full px-6 py-4 bg-surface-container rounded-full border-2 focus:ring-0 text-on-surface text-base font-medium transition-all outline-none disabled:opacity-50 ${fieldErrors.password ? 'border-error focus:border-error' : 'border-transparent focus:border-tertiary'}`} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      disabled={isLoggingIn}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p id="login-password-error" className="mt-2 ml-1 text-sm font-medium text-error">{fieldErrors.password}</p>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer appearance-none w-5 h-5 border-2 border-outline-variant rounded bg-surface-container checked:bg-primary checked:border-primary transition-all cursor-pointer" 
                    />
                    <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none stroke-[3]" />
                  </div>
                  <span className="text-sm font-bold text-on-surface-variant group-hover:text-on-surface transition-colors">Remember me</span>
                </label>
                <a href="#" className="text-sm font-bold text-primary hover:text-primary-container transition-colors">Forgot password?</a>
              </div>

              {/* CTA */}
              <button 
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-4 bg-primary text-on-primary rounded-full text-xl font-bold shadow-sm hover:shadow-[inset_0_0_12px_rgba(255,255,255,0.4),0_8px_16px_-4px_rgba(139,78,62,0.15)] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isLoggingIn ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/30"></div>
              </div>
              <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
                <span className="bg-surface-container-lowest px-4 text-on-surface-variant/60">or connect with</span>
              </div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 py-3 border-2 border-outline-variant/30 rounded-full text-sm font-bold text-on-surface hover:bg-surface-container-low active:scale-[0.98] transition-all duration-200">
                <img 
                  alt="Google" 
                  className="w-5 h-5" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmUf-RzL4W3z8u7CVuNBerUjRvUPz5nn-OTGuoPydC2w0AvVznBJZvrDnJumonKSsnypEApqqRInaPl_IZSv629iMQIYcWxZsFxrlsJ2KhHiV8n2QdqkUOFeeRCxQ5o6a2GVCtB9-p2S34ztSt0gK-pSzEWxC39d2sVQ4lTGfgHAfMcQB80T5M14eDQO2S5w_GTy0SCkK5aPDtQs_b93kIQMQCmXw6BAWrNHPKdkF3IW-G3d6HsMtLetzMXY-ahDoK5-GwDJKXp-o"
                  referrerPolicy="no-referrer"
                />
                Google
              </button>
              <button className="flex items-center justify-center gap-3 py-3 border-2 border-outline-variant/30 rounded-full text-sm font-bold text-on-surface hover:bg-surface-container-low active:scale-[0.98] transition-all duration-200">
                <Apple size={20} className="text-on-surface" />
                Apple
              </button>
            </div>

            {/* Footer Link */}
            <p className="mt-10 text-center text-base font-medium text-on-surface-variant">
              New to Moments?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline ml-1">Join now</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
