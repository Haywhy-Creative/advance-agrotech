import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Leaf, UserPlus, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Signup = () => {
  const { user, signUp, signInWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    pin: '',
    confirmPin: '',
    gender: '',
    village: '',
    district: '',
    state: 'California',
    cropTypes: [] as string[],
    landSize: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user && success) navigate('/detect', { replace: true });
  }, [user, success, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const { name, email, password, confirmPassword, mobile, pin, confirmPin, gender, village, district } = formData;
    if (!name || name.length < 2) return 'Please enter a valid full name.';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Please enter a valid email address.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    if (!/^\+?\d{7,15}$/.test(mobile)) return 'Please enter a valid phone number.';
    if (!/^\d{4}$/.test(pin)) return 'PIN must be exactly 4 digits.';
    if (pin !== confirmPin) return 'PINs do not match.';
    if (!gender) return 'Please select your gender.';
    if (!village || !district) return 'Village and District are required to complete setup.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      await signUp(formData.email, formData.password, {
        name: formData.name,
        fullName: formData.name,
        phone: formData.mobile,
        mobile: formData.mobile,
        pin: formData.pin,
        gender: formData.gender,
        village: formData.village,
        district: formData.district,
        state: formData.state,
        crops: formData.cropTypes,
        farmSize: formData.landSize,
        totalScans: 0,
      });
      setSuccess(true);
      navigate('/detect', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Unable to create your account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      setSuccess(true);
      navigate('/detect', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Google sign-up was cancelled.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const inputStyle =
    'w-full h-[52px] pl-11 pr-4 rounded-[16px] border border-gray-200 text-base font-semibold text-text-charcoal outline-none transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-primary-green focus:shadow-[0_0_0_4px_rgba(34,197,94,0.1)]';

  return (
    <div className="min-h-screen w-full bg-[#f0f9f1] flex flex-col items-center justify-center relative px-4 py-20 overflow-hidden font-nunito">
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-green-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-emerald-200/40 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[540px] bg-white rounded-[40px] shadow-[0_20px_50px_rgba(45,90,39,0.1)] border border-white/60 p-8 md:p-10 relative z-10"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 flex rounded-t-[40px] overflow-hidden">
          <div className="w-1/2 h-full bg-[#2d5a27]" />
          <div className="w-1/2 h-full bg-orange-400" />
        </div>

        <div className="flex flex-col items-center gap-4 mb-8 pt-4">
          <div className="w-16 h-16 bg-[#f0f9f1] rounded-2xl flex items-center justify-center border border-green-100 shadow-sm">
            <UserPlus className="w-10 h-10 text-[#2d5a27]" />
          </div>
          <h1 className="text-3xl font-bold text-[#1a2e1a] tracking-tight">Create Account</h1>
          <p className="text-gray-500 font-medium text-center leading-relaxed">
            Join 10,000+ farmers using FasalRakshak
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input name="name" value={formData.name} onChange={handleChange} placeholder="Full name" className={inputStyle} />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email address" autoComplete="email" className={inputStyle} />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} placeholder="Password (min 6)" autoComplete="new-password" className={inputStyle} />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input name="confirmPassword" type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm password" autoComplete="new-password" className={inputStyle} />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-700" aria-label="Toggle password visibility">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="relative">
              <input name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Phone number" className={`${inputStyle} pl-4`} />
            </div>
            <div className="relative">
              <input name="pin" value={formData.pin} onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="4-digit PIN" className={`${inputStyle} pl-4`} />
            </div>
            <div className="relative">
              <input name="confirmPin" value={formData.confirmPin} onChange={(e) => setFormData({ ...formData, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="Confirm PIN" className={`${inputStyle} pl-4`} />
            </div>
            <div className="relative">
              <select name="gender" value={formData.gender} onChange={handleChange} className={`${inputStyle} pl-4`}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="relative">
              <input name="village" value={formData.village} onChange={handleChange} placeholder="Village / Town" className={`${inputStyle} pl-4`} />
            </div>
            <div className="relative">
              <input name="district" value={formData.district} onChange={handleChange} placeholder="District / County" className={`${inputStyle} pl-4`} />
            </div>
            <div className="relative">
              <input name="state" value={formData.state} onChange={handleChange} placeholder="State" className={`${inputStyle} pl-4`} />
            </div>
            <div className="relative">
              <input name="landSize" value={formData.landSize} onChange={handleChange} placeholder="Farm size (acres)" className={`${inputStyle} pl-4`} />
            </div>
          </div>

          {error && (
            <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full h-16 rounded-[22px] text-white font-bold text-[18px] flex items-center justify-center gap-6 shadow-xl transition-all border border-white/10 px-10 bg-[#2d5a27] hover:bg-[#1a3818] disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-green-200 border-t-white rounded-full animate-spin" />
                <span className="tracking-tight uppercase text-sm">Creating account...</span>
              </>
            ) : (
              <span className="tracking-tight">Create Account</span>
            )}
          </motion.button>
        </form>

        <div className="flex items-center gap-4 py-6">
          <div className="flex-grow h-px bg-gray-100" />
          <span className="text-gray-400 text-[10px] uppercase font-black tracking-widest">or</span>
          <div className="flex-grow h-px bg-gray-100" />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleGoogle}
          disabled={isGoogleLoading}
          className="w-full h-16 rounded-[22px] font-bold text-lg flex items-center justify-center gap-4 transition-all shadow-md border-2 bg-white hover:bg-gray-50 text-gray-800 border-gray-100 disabled:opacity-60"
        >
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner shrink-0 scale-90">
            <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.26 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          </div>
          <span className="tracking-tight">{isGoogleLoading ? 'Opening Google...' : 'Continue with Google'}</span>
        </motion.button>

        <div className="flex items-center justify-center gap-6 pt-6">
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Safe</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center border border-orange-100 shadow-sm">
              <Zap className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Fast</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center border border-green-100 shadow-sm">
              <Leaf className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Organic</span>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-[#2d5a27] font-bold hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </motion.div>

      <footer className="mt-12 flex flex-col items-center gap-4 text-gray-400">
        <p className="text-sm font-medium">Designed for farmers, powered by AI.</p>
        <Link
          to="/"
          className="text-xs font-bold hover:text-green-700 transition-colors uppercase tracking-widest bg-white/50 px-4 py-1.5 rounded-full border border-white/50 shadow-sm flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Back to home
        </Link>
      </footer>
    </div>
  );
};

export default Signup;
