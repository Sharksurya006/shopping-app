import { useState, useEffect, useRef } from 'react'; import { useForm } from 'react-hook-form'; import { Link, useNavigate, useLocation } from 'react-router-dom'; import { motion } from 'framer-motion'; import { Logo } from '../components/Navbar'; import { authService, otpService } from '../services'; import { useStore } from '../store';
const Shell = ({ title, children }) => <div className="min-h-[70vh] grid place-items-center px-4 py-10"><div className="w-full max-w-sm grid gap-4"><div className="text-center"><Logo /></div><h1 className="font-display text-2xl text-center">{title}</h1>{children}</div></div>;
const Err = ({ e }) => e ? <p role="alert" className="text-xs text-error -mt-2">{e.message}</p> : null;
const mask = (s = '', type) => type === 'email' ? s.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 4)) + c) : s.replace(/^(\d{2})(\d+)(\d{4})$/, (_, a, b, c) => a + '*'.repeat(b.length) + c);
export function Signup() {
	const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm(), nav = useNavigate(), setUser = useStore(s => s.setUser);
	return <Shell title="Create your account"><form className="grid gap-3" onSubmit={handleSubmit(async d => { const user = await authService.signup(d); setUser(user); await otpService.send(d.email); nav('/verify-otp', { state: { email: d.email, mobile: d.mobile, next: '/account' } }) })}>
		<input className="input" placeholder="Full name" aria-label="Full name" {...register('name', { required: 'Enter your name' })} /><Err e={errors.name} />
		<input className="input" type="email" placeholder="Email" aria-label="Email" {...register('email', { required: 'Enter your email', pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' } })} /><Err e={errors.email} />
		<input className="input" inputMode="numeric" placeholder="Mobile" aria-label="Mobile" {...register('mobile', { required: 'Enter your mobile', pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a 10-digit mobile number' } })} /><Err e={errors.mobile} />
		<input className="input" type="password" placeholder="Password" aria-label="Password" {...register('password', { required: 'Create a password', minLength: { value: 8, message: 'At least 8 characters' } })} /><Err e={errors.password} />
		<input className="input" type="password" placeholder="Confirm password" aria-label="Confirm password" {...register('confirm', { validate: v => v === watch('password') || 'Passwords do not match' })} /><Err e={errors.confirm} />
		<div className="grid grid-cols-2 gap-2"><input type="date" className="input" aria-label="Date of birth" {...register('dob')} /><select className="input" aria-label="Gender" {...register('gender')}><option value="">Gender</option><option>Female</option><option>Male</option><option>Other</option></select></div>
		<label className="text-xs flex gap-2"><input type="checkbox" {...register('terms', { required: 'Accept the terms to continue' })} />I agree to the Terms and Privacy Policy</label><Err e={errors.terms} />
		<button className="btn btn-solid" disabled={isSubmitting}>Create account</button><p className="text-xs text-center text-mute">Have an account? <Link className="underline" to="/login">Login</Link></p></form></Shell>
}
export function Otp() {
	const loc = useLocation(), nav = useNavigate(); const { email = '', mobile = '', next = '/account' } = loc.state || {};
	const [d, setD] = useState(Array(6).fill('')), [t, setT] = useState(30), [err, setErr] = useState(''), [shake, setShake] = useState(false), [verifying, setVerifying] = useState(false), refs = useRef([]);
	useEffect(() => { if (t <= 0) return; const id = setTimeout(() => setT(t - 1), 1000); return () => clearTimeout(id) }, [t]);
	const set = (i, v) => { if (!/^\d?$/.test(v)) return; const n = [...d]; n[i] = v; setD(n); if (v && i < 5) refs.current[i + 1].focus() };
	const verify = async () => {
		const code = d.join(''); if (code.length < 6) { setErr('Enter all 6 digits'); setShake(true); setTimeout(() => setShake(false), 400); return }
		setVerifying(true); const { otpService } = await import('../services'); const ok = await otpService.verify(code); setVerifying(false);
		if (ok) nav(next); else { setErr('Incorrect code, try again'); setShake(true); setTimeout(() => setShake(false), 400); setD(Array(6).fill('')); refs.current[0]?.focus() }
	};
	return <Shell title="Verify your account"><p className="text-sm text-mute text-center">Enter the 6-digit code sent to {mobile && <b>{mask(mobile, 'mobile')}</b>}{mobile && email && ' and '}{email && <b>{mask(email, 'email')}</b>}. <Link to="/signup" className="underline">Change details</Link></p>
		<motion.div animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}} transition={{ duration: .4 }} className="flex gap-2 justify-center">{d.map((v, i) => <input key={i} ref={el => refs.current[i] = el} value={v} onChange={e => set(i, e.target.value)} onKeyDown={e => e.key === 'Backspace' && !v && i > 0 && refs.current[i - 1].focus()} inputMode="numeric" maxLength={1} aria-label={`Digit ${i + 1}`} className="input !w-11 text-center" />)}</motion.div>
		{err && <p role="alert" className="text-xs text-error text-center">{err}</p>}
		<button className="btn btn-solid" disabled={verifying} onClick={verify}>{verifying ? 'Verifying…' : 'Verify'}</button>
		<button className="text-xs text-mute" disabled={t > 0} onClick={() => { setT(30); otpService.send(email || mobile) }}>{t > 0 ? `Resend code in ${t}s` : 'Resend code'}</button>
		<p className="text-[11px] text-mute text-center">Simulated delivery — no SMS or email provider is connected in this build; any 6 digits are accepted.</p></Shell>
}
export function Forgot() {
	const [s, setS] = useState(0), [v, setV] = useState('');
	const steps = [<><input className="input" placeholder="Email or mobile" aria-label="Email or mobile" value={v} onChange={e => setV(e.target.value)} /><button className="btn btn-solid" disabled={!v} onClick={() => setS(1)}>Send code</button></>,
	<><input className="input" inputMode="numeric" maxLength={6} placeholder="6-digit code" aria-label="OTP" /><button className="btn btn-solid" onClick={() => setS(2)}>Verify</button></>,
	<><input className="input" type="password" placeholder="New password" aria-label="New password" /><button className="btn btn-solid" onClick={() => setS(3)}>Reset password</button></>,
	<><p className="text-center text-mute text-sm">Your password has been reset.</p><Link to="/login" className="btn btn-solid">Back to login</Link></>];
	return <Shell title="Forgot password">{steps[s]}</Shell>
}
