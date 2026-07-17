import React, { useState, useEffect } from 'react';
import { Star, Eye, EyeOff, Apple } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useAuthStore } from './store/authStore';
import OTPVerification from './components/OTPVerification';
import { FieldErrors, extractErrorMessage, extractFieldErrors } from './utils/formErrors';

type RegisterField = 'displayName' | 'username' | 'email' | 'password';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    displayName: '',
  });
  const [showOTP, setShowOTP] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isAutoSent, setIsAutoSent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<RegisterField>>({});
  const [formError, setFormError] = useState('');

  const navigate = useNavigate();
  const { registerAsync, isRegistering, registerError, loginAsync } = useAuth();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setFormError('');
  };

  const validateForm = () => {
    const errors: FieldErrors<RegisterField> = {};
    const email = formData.email.trim();
    const username = formData.username.trim();
    const password = formData.password;
    const displayName = formData.displayName.trim();

    if (!displayName) {
      errors.displayName = 'Display name is required';
    } else if (displayName.length > 100) {
      errors.displayName = 'Display name must be 100 characters or fewer';
    }

    if (!username) {
      errors.username = 'Username is required';
    } else if (username.length < 3 || username.length > 50) {
      errors.username = 'Username must be between 3 and 50 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!email) {
      errors.email = 'Email is required';
    } else if (email.length < 5 || email.length > 255) {
      errors.email = 'Email must be between 5 and 255 characters';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!validateForm()) {
      return;
    }

    try {
      const response = await registerAsync({
        ...formData,
        email: formData.email.trim(),
        username: formData.username.trim(),
        displayName: formData.displayName.trim(),
      });
      setRegisteredEmail(formData.email.trim());
      setIsAutoSent(!!response.otpSent);
      setShowOTP(true);
    } catch (error) {
      console.error('Registration failed:', error);
      const errors = extractFieldErrors<RegisterField>(error);
      setFieldErrors(errors);
      if (Object.keys(errors).length === 0) {
        setFormError(extractErrorMessage(error, 'Registration failed. Please try again.'));
      }
    }
  };

  const handleOTPVerified = async () => {
    try {
      await loginAsync({
        email: formData.email,
        password: formData.password,
      });
      navigate('/home');
    } catch (error) {
      console.error('Login after verification failed:', error);
      navigate('/login'); // Go to login if auto-login fails
    }
  };

  if (showOTP) {
    return (
      <OTPVerification 
        email={registeredEmail}
        onVerified={handleOTPVerified}
        onBack={() => setShowOTP(false)}
        autoSent={isAutoSent}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-surface">
      <main className="w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-2 bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-[0_4px_24px_-4px_rgba(139,78,62,0.08)] border border-surface-variant/50">
        
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
              Join a community where genuine connections flourish. Create your space in a world designed for authentic friendships.
            </p>
          </div>
        </section>

        <section className="flex flex-col justify-center p-8 md:p-16 bg-surface-container-lowest max-h-screen overflow-y-auto">
          
          <div className="md:hidden flex items-center justify-center gap-2 mb-8 text-primary">
            <Star fill="currentColor" size={28} />
            <span className="text-2xl font-bold tracking-tight">Moments</span>
          </div>

          <div className="max-w-md mx-auto w-full">
            <header className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-bold text-on-surface mb-2">Join Moments</h2>
              <p className="text-base font-medium text-on-surface-variant">Create your account and start connecting with kindred spirits.</p>
            </header>

            <form className="space-y-5" onSubmit={handleRegister} noValidate>
              {(formError || (registerError && Object.keys(fieldErrors).length === 0)) && (
                <div className="p-4 bg-error-container rounded-2xl border border-error">
                  <p className="text-sm font-medium text-on-error-container">
                    {formError || extractErrorMessage(registerError, 'Registration failed. Please try again.')}
                  </p>
                </div>
              )}

              <div className="group">
                <label className="block text-sm font-bold text-on-surface-variant mb-2 ml-1" htmlFor="displayName">Display Name</label>
                <input 
                  id="displayName"
                  name="displayName"
                  placeholder="John Doe" 
                  type="text"
                  value={formData.displayName}
                  onChange={handleChange}
                  disabled={isRegistering}
                  aria-invalid={Boolean(fieldErrors.displayName)}
                  aria-describedby={fieldErrors.displayName ? 'displayName-error' : undefined}
                  className={`w-full px-6 py-3 bg-surface-container rounded-full border-2 focus:ring-4 focus:ring-tertiary/10 text-on-surface text-base font-medium transition-all outline-none disabled:opacity-50 ${fieldErrors.displayName ? 'border-error focus:border-error' : 'border-transparent focus:border-tertiary'}`} 
                />
                {fieldErrors.displayName && (
                  <p id="displayName-error" className="mt-2 ml-1 text-sm font-medium text-error">{fieldErrors.displayName}</p>
                )}
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-on-surface-variant mb-2 ml-1" htmlFor="username">Username</label>
                <input 
                  id="username"
                  name="username"
                  placeholder="johndoe" 
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isRegistering}
                  aria-invalid={Boolean(fieldErrors.username)}
                  aria-describedby={fieldErrors.username ? 'username-error' : undefined}
                  className={`w-full px-6 py-3 bg-surface-container rounded-full border-2 focus:ring-4 focus:ring-tertiary/10 text-on-surface text-base font-medium transition-all outline-none disabled:opacity-50 ${fieldErrors.username ? 'border-error focus:border-error' : 'border-transparent focus:border-tertiary'}`} 
                />
                {fieldErrors.username && (
                  <p id="username-error" className="mt-2 ml-1 text-sm font-medium text-error">{fieldErrors.username}</p>
                )}
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-on-surface-variant mb-2 ml-1" htmlFor="email">Email</label>
                <input 
                  id="email"
                  name="email"
                  placeholder="john@example.com" 
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isRegistering}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  className={`w-full px-6 py-3 bg-surface-container rounded-full border-2 focus:ring-4 focus:ring-tertiary/10 text-on-surface text-base font-medium transition-all outline-none disabled:opacity-50 ${fieldErrors.email ? 'border-error focus:border-error' : 'border-transparent focus:border-tertiary'}`} 
                />
                {fieldErrors.email && (
                  <p id="email-error" className="mt-2 ml-1 text-sm font-medium text-error">{fieldErrors.email}</p>
                )}
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-on-surface-variant mb-2 ml-1" htmlFor="password">Password</label>
                <div className="relative focus-within:ring-4 focus-within:ring-tertiary/10 rounded-full transition-all duration-300">
                  <input 
                    id="password"
                    name="password"
                    placeholder="••••••••" 
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isRegistering}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                    className={`w-full px-6 py-3 bg-surface-container rounded-full border-2 focus:ring-0 text-on-surface text-base font-medium transition-all outline-none disabled:opacity-50 ${fieldErrors.password ? 'border-error focus:border-error' : 'border-transparent focus:border-tertiary'}`} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    disabled={isRegistering}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p id="password-error" className="mt-2 ml-1 text-sm font-medium text-error">{fieldErrors.password}</p>
                )}
              </div>

              <button 
                type="submit"
                disabled={isRegistering}
                className="w-full py-4 bg-primary text-on-primary rounded-full text-xl font-bold shadow-sm hover:shadow-[inset_0_0_12px_rgba(255,255,255,0.4),0_8px_16px_-4px_rgba(139,78,62,0.15)] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isRegistering ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/30"></div>
              </div>
              <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
                <span className="bg-surface-container-lowest px-4 text-on-surface-variant/60">or sign up with</span>
              </div>
            </div>

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

            <p className="mt-8 text-center text-base font-medium text-on-surface-variant">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline ml-1">Login</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
