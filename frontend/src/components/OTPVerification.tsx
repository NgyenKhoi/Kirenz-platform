import React, { useState, useRef, useEffect } from 'react';
import { Mail, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface OTPVerificationProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
  autoSent?: boolean;
}

export default function OTPVerification({ 
  email, 
  onVerified, 
  onBack,
  autoSent = false 
}: OTPVerificationProps) {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [canResend, setCanResend] = useState(!autoSent);
  const [countdown, setCountdown] = useState(autoSent ? 60 : 0);
  
  const { verifyOTPAsync, isVerifyingOTP, sendOTPAsync, isSendingOTP } = useAuth();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!isVerified) {
      inputRefs.current[0]?.focus();
    }
  }, [isVerified]);

  useEffect(() => {
    if (countdown > 0 && !isVerified) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canResend && !isVerified) {
      setCanResend(true);
    }
  }, [countdown, canResend, isVerified]);

  useEffect(() => {
    if (isVerified && redirectCountdown > 0) {
      const timer = setTimeout(() => setRedirectCountdown(redirectCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isVerified && redirectCountdown === 0) {
      onVerified();
    }
  }, [isVerified, redirectCountdown, onVerified]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (index === 5 && value && newOtp.every(digit => digit)) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '');
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    const lastFilledIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastFilledIndex]?.focus();

    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setError(null);

    try {
      await verifyOTPAsync({ email, otp: code });
      setIsVerified(true);
      setSuccess('Email verified successfully!');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Invalid or expired OTP. Please try again.';
      setError(errorMsg);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setError(null);
    setSuccess(null);

    try {
      await sendOTPAsync(email);
      setSuccess('OTP sent successfully! Check your email.');
      setCanResend(false);
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to send OTP. Please try again.';
      setError(errorMsg);
    }
  };

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-surface">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-[2.5rem] p-10 shadow-[0_8px_32px_-4px_rgba(139,78,62,0.12)] border border-surface-variant/50 text-center">
          <div className="relative mb-8 flex justify-center">
            <div className="absolute inset-0 bg-tertiary/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-tertiary/10 rounded-full">
              <CheckCircle2 className="text-tertiary" size={56} />
            </div>
          </div>

          <h2 className="text-3xl font-black text-on-surface mb-4 tracking-tight">
            Verification Success!
          </h2>
          <p className="text-lg text-on-surface-variant mb-10 leading-relaxed font-medium">
            Your email has been verified. You're now ready to join the community.
          </p>

          <button
            onClick={() => onVerified()}
            className="w-full py-5 bg-primary text-on-primary rounded-full text-xl font-bold shadow-lg hover:shadow-primary/25 hover:translate-y-[-2px] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 mb-6"
          >
            Continue to Moments
          </button>

          <p className="text-sm font-bold text-on-surface-variant/60 tracking-wider uppercase">
            Redirecting in <span className="text-primary italic inline-block w-4">{redirectCountdown}s</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-8 shadow-[0_4px_24px_-4px_rgba(139,78,62,0.08)] border border-surface-variant/50">
        
        {/* Back Button */}
        {!isVerified && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6 group"
          >
            <ArrowLeft size={20} className="group-hover:translate-x-[-4px] transition-transform" />
            <span className="text-sm font-bold">Back to registration</span>
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Mail className="text-primary" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">
            Verify Your Email
          </h2>
          <p className="text-base text-on-surface-variant font-medium">
            We've sent a 6-digit code to<br />
            <span className="font-bold text-on-surface">{maskedEmail}</span>
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-error-container rounded-2xl border border-error/20 animate-in fade-in slide-in-from-top-2">
            <p className="text-sm font-bold text-on-error-container text-center">
              {error}
            </p>
          </div>
        )}

        {success && !isVerified && (
          <div className="mb-6 p-4 bg-tertiary-container rounded-2xl border border-tertiary/20 animate-in fade-in slide-in-from-top-2">
            <p className="text-sm font-bold text-on-tertiary-container text-center">
              {success}
            </p>
          </div>
        )}

        {/* OTP Input */}
        <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={isVerifyingOTP}
              className="w-12 h-14 text-center text-2xl font-bold bg-surface-container rounded-xl border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 text-on-surface transition-all outline-none disabled:opacity-50"
            />
          ))}
        </div>

        {/* Timer/Info */}
        <p className="text-center text-sm font-medium text-on-surface-variant mb-8">
          {countdown > 0 ? (
            <>Code expires in <span className="font-bold text-primary">{countdown}s</span></>
          ) : (
            'Code expires in 5 minutes'
          )}
        </p>

        {/* Verify Button */}
        <button
          onClick={() => handleVerify()}
          disabled={isVerifyingOTP || otp.some(digit => !digit)}
          className="w-full py-4 bg-primary text-on-primary rounded-full text-lg font-bold shadow-md hover:shadow-primary/20 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-4"
        >
          {isVerifyingOTP ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Verifying...
            </>
          ) : (
            'Verify Email'
          )}
        </button>

        {/* Resend Button */}
        <div className="text-center">
          <button
            onClick={handleResend}
            disabled={!canResend || isSendingOTP}
            className="text-sm font-bold text-primary hover:underline disabled:text-on-surface-variant disabled:no-underline disabled:cursor-not-allowed inline-flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={16} className={isSendingOTP ? 'animate-spin' : ''} />
            {isSendingOTP ? 'Sending...' : canResend ? 'Resend code' : `Resend in ${countdown}s`}
          </button>
        </div>

        {/* Security Note */}
        <div className="mt-8 p-4 bg-surface-container/50 rounded-xl border border-outline-variant/30">
          <p className="text-[11px] font-bold text-on-surface-variant/70 text-center leading-relaxed">
            🔒 Never share this code with anyone. Kirenz will never ask for your verification code.
          </p>
        </div>
      </div>
    </div>
  );
}
