import { useState } from 'react'; import { motion, AnimatePresence } from 'framer-motion'; import { ShieldCheck, Loader2, CheckCircle2, XCircle, Smartphone, Landmark, Wallet, Truck, Clock3 } from 'lucide-react';
import { paymentService } from '../services'; import { formatCard, formatExpiry, detectBrand, luhnValid, validExpiry, genUpiRef } from '../utils/card';
import { inr } from '../utils';
const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank'], WALLETS = ['NayaraPay Wallet', 'PayZapp', 'Mobikwik'];
const METHODS = [['upi', 'UPI', Smartphone], ['card', 'Credit / Debit Card', ShieldCheck], ['netbanking', 'Net Banking', Landmark], ['wallet', 'Wallet', Wallet], ['cod', 'Cash on Delivery', Truck], ['bnpl', 'Buy Now Pay Later', Clock3]];
export default function PaymentPanel({ amount, onSuccess }) {
  const [method, setMethod] = useState('upi');
  const [card, setCard] = useState({ num: '', name: '', exp: '', cvv: '' });
  const [vpa, setVpa] = useState(''); const [bank, setBank] = useState(BANKS[0]); const [wallet, setWallet] = useState(WALLETS[0]);
  const [stage, setStage] = useState('idle');// idle | validating | processing | authorizing | success | failed
  const [err, setErr] = useState(''); const [result, setResult] = useState(null);
  const cardErrors = () => { if (!luhnValid(card.num)) return 'Enter a valid card number'; if (!card.name.trim()) return 'Enter the name on card'; if (!validExpiry(card.exp)) return 'Enter a valid, non-expired MM/YY'; if (!/^\d{3,4}$/.test(card.cvv)) return 'Enter a valid CVV'; return '' };
  const vpaErrors = () => /^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(vpa) ? '' : 'Enter a valid UPI ID, e.g. name@bank';
  const pay = async () => {
    setErr('');
    if (method === 'card') { const e = cardErrors(); if (e) { setErr(e); return } }
    if (method === 'upi') { const e = vpaErrors(); if (e) { setErr(e); return } }
    setStage('processing');
    try {
      let r;
      if (method === 'card') r = await paymentService.processCard({ amount });
      else if (method === 'upi') { setStage('authorizing'); r = await paymentService.processUpi({ vpa, amount }); if (r.ok) r.ref = genUpiRef() }
      else if (method === 'netbanking') r = await paymentService.processNetbanking({ bank, amount });
      else if (method === 'wallet') r = await paymentService.processWallet({ wallet, amount });
      else if (method === 'bnpl') r = await paymentService.processBnpl({ amount });
      else r = await paymentService.processCod({ amount });
      if (!r.ok) { setStage('failed'); setResult(r); return }
      setStage('success'); setResult(r); setTimeout(() => onSuccess(r, method), 700);
    } catch { setStage('failed'); setResult({ reason: 'Network error — please try again' }) }
  };
  const busy = stage === 'processing' || stage === 'authorizing';
  return <div className="grid gap-4">
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{METHODS.map(([k, l, Icon]) => <button key={k} type="button" disabled={busy} onClick={() => { setMethod(k); setErr(''); setStage('idle') }} className={`border p-3 text-xs flex flex-col items-center gap-1.5 ${method === k ? 'border-plum bg-lavender/40 text-ink' : 'border-line text-mute hover:bg-hover'}`}><Icon size={18} />{l}</button>)}</div>

    <AnimatePresence mode="wait">
      {stage === 'success' ?
        <motion.div key="ok" initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} className="border border-success/40 bg-success/10 p-6 text-center grid gap-2">
          <CheckCircle2 className="mx-auto text-success" size={36} /><p className="font-medium">Payment successful</p>
          <p className="text-xs text-mute">Ref {result?.txnId}{result?.ref ? ` · UPI ${result.ref}` : ''}</p></motion.div>
        : stage === 'failed' ?
          <motion.div key="fail" initial={{ x: -6, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="border border-error/40 bg-error/10 p-6 text-center grid gap-2">
            <XCircle className="mx-auto text-error" size={32} /><p className="font-medium">Payment failed</p><p className="text-xs text-mute">{result?.reason}</p>
            <button className="btn btn-line justify-self-center mt-1" onClick={() => { setStage('idle'); setErr('') }}>Try again</button></motion.div>
          : busy ?
            <motion.div key="busy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-line p-8 text-center grid gap-3">
              <Loader2 className="mx-auto animate-spin text-plum" size={28} />
              <p className="text-sm">{stage === 'authorizing' ? 'Approve the request in your UPI app…' : 'Processing your payment securely…'}</p>
              {stage === 'authorizing' && <p className="text-xs text-mute">Waiting for confirmation from {vpa}</p>}</motion.div>
            : <motion.div key={method} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="border border-line p-4 grid gap-3">
              {method === 'card' && <>
                <div className="relative"><input className="input pr-14" placeholder="Card number" inputMode="numeric" aria-label="Card number" value={card.num} onChange={e => setCard({ ...card, num: formatCard(e.target.value) })} />{detectBrand(card.num) && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-mute">{detectBrand(card.num)}</span>}</div>
                <input className="input" placeholder="Name on card" aria-label="Name on card" value={card.name} onChange={e => setCard({ ...card, name: e.target.value })} />
                <div className="grid grid-cols-2 gap-3"><input className="input" placeholder="MM/YY" aria-label="Expiry" inputMode="numeric" value={card.exp} onChange={e => setCard({ ...card, exp: formatExpiry(e.target.value) })} /><input className="input" placeholder="CVV" aria-label="CVV" inputMode="numeric" maxLength={4} value={card.cvv} onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '') })} /></div></>}
              {method === 'upi' && <input className="input" placeholder="yourname@bank" aria-label="UPI ID" value={vpa} onChange={e => setVpa(e.target.value)} />}
              {method === 'netbanking' && <select className="input" aria-label="Bank" value={bank} onChange={e => setBank(e.target.value)}>{BANKS.map(b => <option key={b}>{b}</option>)}</select>}
              {method === 'wallet' && <select className="input" aria-label="Wallet" value={wallet} onChange={e => setWallet(e.target.value)}>{WALLETS.map(w => <option key={w}>{w}</option>)}</select>}
              {method === 'cod' && <p className="text-sm text-mute">Pay {inr(amount)} in cash when your order is delivered.</p>}
              {method === 'bnpl' && <p className="text-sm text-mute">Split {inr(amount)} into 3 interest-free installments.</p>}
              {err && <p role="alert" className="text-xs text-error">{err}</p>}
              <button className="btn btn-solid" onClick={pay}>{method === 'cod' ? `Place order · ${inr(amount)}` : `Pay ${inr(amount)}`}</button>
              <p className="text-[11px] text-mute flex items-center gap-1"><ShieldCheck size={12} />Simulated checkout — no live payment gateway is connected in this build.</p>
            </motion.div>}
    </AnimatePresence>
  </div>
}
