// import { useState } from 'react'; import { motion, AnimatePresence } from 'framer-motion'; import { ShieldCheck, Loader2, CheckCircle2, XCircle, Smartphone, Landmark, Wallet, Truck, Clock3 } from 'lucide-react';
// import { paymentService } from '../services'; import { formatCard, formatExpiry, detectBrand, luhnValid, validExpiry, genUpiRef } from '../utils/card';
// import { inr } from '../utils';
// const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank'], WALLETS = ['NayaraPay Wallet', 'PayZapp', 'Mobikwik'];
// const METHODS = [['upi', 'UPI', Smartphone], ['card', 'Credit / Debit Card', ShieldCheck], ['netbanking', 'Net Banking', Landmark], ['wallet', 'Wallet', Wallet], ['cod', 'Cash on Delivery', Truck], ['bnpl', 'Buy Now Pay Later', Clock3]];
// export default function PaymentPanel({ amount, onSuccess }) {
//   const [method, setMethod] = useState('upi');
//   const [card, setCard] = useState({ num: '', name: '', exp: '', cvv: '' });
//   const [vpa, setVpa] = useState(''); const [bank, setBank] = useState(BANKS[0]); const [wallet, setWallet] = useState(WALLETS[0]);
//   const [stage, setStage] = useState('idle');// idle | validating | processing | authorizing | success | failed
//   const [err, setErr] = useState(''); const [result, setResult] = useState(null);
//   const cardErrors = () => { if (!luhnValid(card.num)) return 'Enter a valid card number'; if (!card.name.trim()) return 'Enter the name on card'; if (!validExpiry(card.exp)) return 'Enter a valid, non-expired MM/YY'; if (!/^\d{3,4}$/.test(card.cvv)) return 'Enter a valid CVV'; return '' };
//   const vpaErrors = () => /^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(vpa) ? '' : 'Enter a valid UPI ID, e.g. name@bank';
//   const pay = async () => {
//     setErr('');
//     if (method === 'card') { const e = cardErrors(); if (e) { setErr(e); return } }
//     if (method === 'upi') { const e = vpaErrors(); if (e) { setErr(e); return } }
//     setStage('processing');
//     try {
//       let r;
//       if (method === 'card') r = await paymentService.processCard({ amount });
//       else if (method === 'upi') { setStage('authorizing'); r = await paymentService.processUpi({ vpa, amount }); if (r.ok) r.ref = genUpiRef() }
//       else if (method === 'netbanking') r = await paymentService.processNetbanking({ bank, amount });
//       else if (method === 'wallet') r = await paymentService.processWallet({ wallet, amount });
//       else if (method === 'bnpl') r = await paymentService.processBnpl({ amount });
//       else r = await paymentService.processCod({ amount });
//       if (!r.ok) { setStage('failed'); setResult(r); return }
//       setStage('success'); setResult(r); setTimeout(() => onSuccess(r, method), 700);
//     } catch { setStage('failed'); setResult({ reason: 'Network error — please try again' }) }
//   };
//   const busy = stage === 'processing' || stage === 'authorizing';
//   return <div className="grid gap-4">
//     <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{METHODS.map(([k, l, Icon]) => <button key={k} type="button" disabled={busy} onClick={() => { setMethod(k); setErr(''); setStage('idle') }} className={`border p-3 text-xs flex flex-col items-center gap-1.5 ${method === k ? 'border-plum bg-lavender/40 text-ink' : 'border-line text-mute hover:bg-hover'}`}><Icon size={18} />{l}</button>)}</div>

//     <AnimatePresence mode="wait">
//       {stage === 'success' ?
//         <motion.div key="ok" initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} className="border border-success/40 bg-success/10 p-6 text-center grid gap-2">
//           <CheckCircle2 className="mx-auto text-success" size={36} /><p className="font-medium">Payment successful</p>
//           <p className="text-xs text-mute">Ref {result?.txnId}{result?.ref ? ` · UPI ${result.ref}` : ''}</p></motion.div>
//         : stage === 'failed' ?
//           <motion.div key="fail" initial={{ x: -6, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="border border-error/40 bg-error/10 p-6 text-center grid gap-2">
//             <XCircle className="mx-auto text-error" size={32} /><p className="font-medium">Payment failed</p><p className="text-xs text-mute">{result?.reason}</p>
//             <button className="btn btn-line justify-self-center mt-1" onClick={() => { setStage('idle'); setErr('') }}>Try again</button></motion.div>
//           : busy ?
//             <motion.div key="busy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-line p-8 text-center grid gap-3">
//               <Loader2 className="mx-auto animate-spin text-plum" size={28} />
//               <p className="text-sm">{stage === 'authorizing' ? 'Approve the request in your UPI app…' : 'Processing your payment securely…'}</p>
//               {stage === 'authorizing' && <p className="text-xs text-mute">Waiting for confirmation from {vpa}</p>}</motion.div>
//             : <motion.div key={method} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="border border-line p-4 grid gap-3">
//               {method === 'card' && <>
//                 <div className="relative"><input className="input pr-14" placeholder="Card number" inputMode="numeric" aria-label="Card number" value={card.num} onChange={e => setCard({ ...card, num: formatCard(e.target.value) })} />{detectBrand(card.num) && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-mute">{detectBrand(card.num)}</span>}</div>
//                 <input className="input" placeholder="Name on card" aria-label="Name on card" value={card.name} onChange={e => setCard({ ...card, name: e.target.value })} />
//                 <div className="grid grid-cols-2 gap-3"><input className="input" placeholder="MM/YY" aria-label="Expiry" inputMode="numeric" value={card.exp} onChange={e => setCard({ ...card, exp: formatExpiry(e.target.value) })} /><input className="input" placeholder="CVV" aria-label="CVV" inputMode="numeric" maxLength={4} value={card.cvv} onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '') })} /></div></>}
//               {method === 'upi' && <input className="input" placeholder="yourname@bank" aria-label="UPI ID" value={vpa} onChange={e => setVpa(e.target.value)} />}
//               {method === 'netbanking' && <select className="input" aria-label="Bank" value={bank} onChange={e => setBank(e.target.value)}>{BANKS.map(b => <option key={b}>{b}</option>)}</select>}
//               {err && <p role="alert" className="text-xs text-error">{err}</p>}
//               <button className="btn btn-solid" onClick={pay}>{method === 'cod' ? `Place order · ${inr(amount)}` : `Pay ${inr(amount)}`}</button>
//               <p className="text-[11px] text-mute flex items-center gap-1"><ShieldCheck size={12} />Simulated checkout — no live payment gateway is connected in this build.</p>
//             </motion.div>}
//     </AnimatePresence>
//   </div>
// }
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  Smartphone,
  Landmark,
  QrCode,
} from 'lucide-react';

import { paymentService } from '../services';
import {
  formatCard,
  formatExpiry,
  detectBrand,
  luhnValid,
  validExpiry,
  genUpiRef,
} from '../utils/card';

import { inr } from '../utils';

const BANKS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
];

const METHODS = [
  ['upi', 'UPI', Smartphone],
  ['card', 'Credit / Debit Card', ShieldCheck],
  ['netbanking', 'Net Banking', Landmark],
];

/* ---------------- UPI LOGOS ---------------- */

const GPayLogo = () => (
  <div className="w-9 h-9 rounded-full bg-white border border-line flex items-center justify-center shadow-sm">
    <svg viewBox="0 0 48 48" className="w-7 h-7">
      <path
        fill="#4285F4"
        d="M24 9.5c4.1 0 7.1 1.6 9.3 3.7l6.8-6.8C36 2.8 30.7.5 24 .5 14.8.5 6.9 5.8 3 13.5l7.9 6.1C12.8 13.8 17.9 9.5 24 9.5z"
      />
      <path
        fill="#34A853"
        d="M3 13.5A23.5 23.5 0 0 0 .5 24c0 3.8.9 7.3 2.5 10.5l7.9-6.1A14.2 14.2 0 0 1 9.5 24c0-1.5.2-3 .6-4.4L3 13.5z"
      />
      <path
        fill="#FBBC05"
        d="M24 47.5c6.5 0 12-2.1 16-5.8l-7.8-6.1c-2.1 1.4-4.8 2.3-8.2 2.3-6.1 0-11.2-4.2-13.1-9.9L3 34.5c3.9 7.7 11.8 13 21 13z"
      />
      <path
        fill="#EA4335"
        d="M47.5 24c0-1.6-.2-3.2-.6-4.7H24v9.1h13.2c-.6 3-2.3 5.5-5 7.2l7.8 6.1c4.6-4.2 7.5-10.4 7.5-17.7z"
      />
    </svg>
  </div>
);

const PhonePeLogo = () => (
  <div className="w-9 h-9 rounded-full bg-[#5f259f] flex items-center justify-center shadow-sm relative overflow-hidden">
    <svg viewBox="0 0 48 48" className="w-7 h-7 relative z-10">
      {/* Outer ring suggesting the PhonePe roundel */}
      <circle
        cx="24"
        cy="24"
        r="17"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.5"
      />

      {/* Stylized "P" monogram */}
      <path
        fill="#ffffff"
        d="M19 12h9c5 0 8.5 3.2 8.5 7.8 0 4.6-3.5 7.7-8.5 7.7h-4.5V36H19V12z"
      />
      <path
        fill="#5f259f"
        d="M23.5 16h4.2c2.6 0 4.3 1.5 4.3 3.8 0 2.3-1.7 3.7-4.3 3.7h-4.2V16z"
      />
    </svg>
  </div>
);

const PaytmLogo = () => (
  <div className="w-9 h-9 rounded-full bg-white border border-line flex items-center justify-center shadow-sm">
    <div className="font-bold text-[10px] tracking-tight">
      <span className="text-[#00BAF2]">pay</span>
      <span className="text-[#002970]">tm</span>
    </div>
  </div>
);

/* ---------------- BANK LOGOS ---------------- */

const BankLogo = ({ bank }) => {
  if (bank === 'State Bank of India') {
    return (
      <div className="w-10 h-10 rounded-full bg-white border border-line flex items-center justify-center">
        <svg viewBox="0 0 48 48" className="w-8 h-8">
          <circle
            cx="24"
            cy="24"
            r="18"
            fill="none"
            stroke="#1d4ed8"
            strokeWidth="3"
          />
          <circle
            cx="24"
            cy="24"
            r="4"
            fill="#1d4ed8"
          />
          <path
            d="M13 24h22"
            stroke="#1d4ed8"
            strokeWidth="2"
          />
        </svg>
      </div>
    );
  }

  if (bank === 'HDFC Bank') {
    return (
      <div className="w-10 h-10 rounded-lg bg-white border border-line flex items-center justify-center">
        <svg viewBox="0 0 48 48" className="w-8 h-8">
          <rect
            x="4"
            y="4"
            width="40"
            height="40"
            rx="5"
            fill="#ffffff"
            stroke="#d71920"
            strokeWidth="2"
          />
          <rect
            x="8"
            y="8"
            width="13"
            height="13"
            fill="#d71920"
          />
          <rect
            x="27"
            y="8"
            width="13"
            height="13"
            fill="#1f4e9e"
          />
          <rect
            x="8"
            y="27"
            width="13"
            height="13"
            fill="#1f4e9e"
          />
          <rect
            x="27"
            y="27"
            width="13"
            height="13"
            fill="#d71920"
          />
        </svg>
      </div>
    );
  }

  if (bank === 'ICICI Bank') {
    return (
      <div className="w-10 h-10 rounded-lg bg-white border border-line flex items-center justify-center">
        <svg viewBox="0 0 48 48" className="w-8 h-8">
          <path
            d="M8 24L24 7l16 17-16 17L8 24z"
            fill="#f58220"
          />
          <path
            d="M17 17h14v14H17z"
            fill="#ffffff"
          />
          <path
            d="M20 20h8v8h-8z"
            fill="#f58220"
          />
        </svg>
      </div>
    );
  }

  if (bank === 'Axis Bank') {
    return (
      <div className="w-10 h-10 rounded-lg bg-white border border-line flex items-center justify-center">
        <svg viewBox="0 0 48 48" className="w-8 h-8">
          <path
            d="M24 5L5 43h10l9-18 9 18h10L24 5z"
            fill="#a71930"
          />
          <path
            d="M18 30h12"
            stroke="#ffffff"
            strokeWidth="3"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-lg bg-white border border-line flex items-center justify-center">
      <svg viewBox="0 0 48 48" className="w-8 h-8">
        <rect
          x="5"
          y="5"
          width="38"
          height="38"
          rx="8"
          fill="#ed1c24"
        />
        <path
          d="M15 32L24 13l9 19"
          fill="none"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default function PaymentPanel({
  amount,
  onSuccess,
}) {
  const [method, setMethod] = useState('upi');

  const [card, setCard] = useState({
    num: '',
    name: '',
    exp: '',
    cvv: '',
  });

  const [vpa, setVpa] = useState('');

  const [bank, setBank] = useState(BANKS[0]);

  const [stage, setStage] = useState('idle');
  // idle | validating | processing | authorizing | success | failed

  const [err, setErr] = useState('');
  const [result, setResult] = useState(null);

  const cardErrors = () => {
    if (!luhnValid(card.num))
      return 'Enter a valid card number';

    if (!card.name.trim())
      return 'Enter the name on card';

    if (!validExpiry(card.exp))
      return 'Enter a valid, non-expired MM/YY';

    if (!/^\d{3,4}$/.test(card.cvv))
      return 'Enter a valid CVV';

    return '';
  };

  const vpaErrors = () =>
    /^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(vpa)
      ? ''
      : 'Enter a valid UPI ID, e.g. name@bank';

  const pay = async () => {
    setErr('');

    if (method === 'card') {
      const e = cardErrors();

      if (e) {
        setErr(e);
        return;
      }
    }

    if (method === 'upi') {
      const e = vpaErrors();

      if (e) {
        setErr(e);
        return;
      }
    }

    setStage('processing');

    try {
      let r;

      if (method === 'card') {
        r = await paymentService.processCard({
          amount,
        });
      } else if (method === 'upi') {
        setStage('authorizing');

        r = await paymentService.processUpi({
          vpa,
          amount,
        });

        if (r.ok) r.ref = genUpiRef();
      } else {
        r =
          await paymentService.processNetbanking({
            bank,
            amount,
          });
      }

      if (!r.ok) {
        setStage('failed');
        setResult(r);
        return;
      }

      setStage('success');
      setResult(r);

      setTimeout(
        () => onSuccess(r, method),
        700
      );
    } catch {
      setStage('failed');

      setResult({
        reason:
          'Network error — please try again',
      });
    }
  };

  const busy =
    stage === 'processing' ||
    stage === 'authorizing';

  return (
    <div className="grid gap-4">

      {/* PAYMENT METHODS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {METHODS.map(([k, l, Icon]) => (
          <button
            key={k}
            type="button"
            disabled={busy}
            onClick={() => {
              setMethod(k);
              setErr('');
              setStage('idle');
            }}
            className={`border p-3 text-xs flex flex-col items-center gap-1.5 rounded-lg transition ${
              method === k
                ? 'border-plum bg-lavender/40 text-ink'
                : 'border-line text-mute hover:bg-hover'
            }`}
          >
            <Icon size={18} />

            {l}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* SUCCESS */}
        {stage === 'success' ? (
          <motion.div
            key="ok"
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="border border-success/40 bg-success/10 p-6 text-center grid gap-2"
          >
            <CheckCircle2
              className="mx-auto text-success"
              size={36}
            />

            <p className="font-medium">
              Payment successful
            </p>

            <p className="text-xs text-mute">
              Ref {result?.txnId}
              {result?.ref
                ? ` · UPI ${result.ref}`
                : ''}
            </p>
          </motion.div>

        ) : stage === 'failed' ? (

          /* FAILED */
          <motion.div
            key="fail"
            initial={{
              x: -6,
              opacity: 0,
            }}
            animate={{
              x: 0,
              opacity: 1,
            }}
            className="border border-error/40 bg-error/10 p-6 text-center grid gap-2"
          >
            <XCircle
              className="mx-auto text-error"
              size={32}
            />

            <p className="font-medium">
              Payment failed
            </p>

            <p className="text-xs text-mute">
              {result?.reason}
            </p>

            <button
              className="btn btn-line justify-self-center mt-1"
              onClick={() => {
                setStage('idle');
                setErr('');
              }}
            >
              Try again
            </button>
          </motion.div>

        ) : busy ? (

          /* PROCESSING */
          <motion.div
            key="busy"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="border border-line p-8 text-center grid gap-3"
          >
            <Loader2
              className="mx-auto animate-spin text-plum"
              size={28}
            />

            <p className="text-sm">
              {stage === 'authorizing'
                ? 'Approve the request in your UPI app…'
                : 'Processing your payment securely…'}
            </p>

            {stage === 'authorizing' && (
              <p className="text-xs text-mute">
                Waiting for confirmation from{' '}
                {vpa}
              </p>
            )}
          </motion.div>

        ) : (

          /* PAYMENT FORM */
          <motion.div
            key={method}
            initial={{
              opacity: 0,
              y: 6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="border border-line p-4 grid gap-3 rounded-lg"
          >

            {/* CARD */}
            {method === 'card' && (
              <>
                <div className="relative">
                  <input
                    className="input pr-14"
                    placeholder="Card number"
                    inputMode="numeric"
                    aria-label="Card number"
                    value={card.num}
                    onChange={(e) =>
                      setCard({
                        ...card,
                        num: formatCard(
                          e.target.value
                        ),
                      })
                    }
                  />

                  {detectBrand(card.num) && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-mute">
                      {detectBrand(card.num)}
                    </span>
                  )}
                </div>

                <input
                  className="input"
                  placeholder="Name on card"
                  aria-label="Name on card"
                  value={card.name}
                  onChange={(e) =>
                    setCard({
                      ...card,
                      name: e.target.value,
                    })
                  }
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="input"
                    placeholder="MM/YY"
                    aria-label="Expiry"
                    inputMode="numeric"
                    value={card.exp}
                    onChange={(e) =>
                      setCard({
                        ...card,
                        exp: formatExpiry(
                          e.target.value
                        ),
                      })
                    }
                  />

                  <input
                    className="input"
                    placeholder="CVV"
                    aria-label="CVV"
                    inputMode="numeric"
                    maxLength={4}
                    value={card.cvv}
                    onChange={(e) =>
                      setCard({
                        ...card,
                        cvv: e.target.value.replace(
                          /\D/g,
                          ''
                        ),
                      })
                    }
                  />
                </div>
              </>
            )}

            {/* UPI */}
            {method === 'upi' && (
              <div className="grid gap-4">

                {/* UPI APPS */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-ink">
                      Pay using UPI
                    </p>

                    <span className="text-[10px] text-mute">
                      Secure & instant
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      className="border border-line rounded-lg p-3 flex flex-col items-center justify-center gap-2 hover:bg-hover transition"
                    >
                      <GPayLogo />

                      <span className="text-[10px] font-medium text-ink">
                        Google Pay
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      className="border border-line rounded-lg p-3 flex flex-col items-center justify-center gap-2 hover:bg-hover transition"
                    >
                      <PhonePeLogo />

                      <span className="text-[10px] font-medium text-ink">
                        PhonePe
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      className="border border-line rounded-lg p-3 flex flex-col items-center justify-center gap-2 hover:bg-hover transition"
                    >
                      <PaytmLogo />

                      <span className="text-[10px] font-medium text-ink">
                        Paytm
                      </span>
                    </button>
                  </div>
                </div>

                {/* QR CODE */}
                <div className="border border-line rounded-xl p-5 bg-white">

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-lavender/40 flex items-center justify-center">
                      <QrCode
                        size={19}
                        className="text-plum"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-ink">
                        Scan & Pay
                      </p>

                      <p className="text-[11px] text-mute">
                        Scan with any UPI app
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">

                    {/* QR VISUAL */}
                    <div className="relative bg-white border-2 border-ink rounded-xl p-3">

                      <div className="w-[150px] h-[150px] grid grid-cols-9 grid-rows-9 gap-[2px]">

                        {Array.from({
                          length: 81,
                        }).map((_, i) => {
                          const x = i % 9;
                          const y = Math.floor(
                            i / 9
                          );

                          const finder =
                            (x < 3 && y < 3) ||
                            (x > 5 && y < 3) ||
                            (x < 3 && y > 5);

                          const filled =
                            finder
                              ? true
                              : (i * 17 +
                                  i * i +
                                  7) %
                                  3 !==
                                0;

                          return (
                            <div
                              key={i}
                              className={
                                filled
                                  ? 'bg-black'
                                  : 'bg-white'
                              }
                            />
                          );
                        })}

                        {/* Finder patterns */}
                        <div className="absolute top-3 left-3 w-[42px] h-[42px] border-[6px] border-black bg-white" />

                        <div className="absolute top-3 right-3 w-[42px] h-[42px] border-[6px] border-black bg-white" />

                        <div className="absolute bottom-3 left-3 w-[42px] h-[42px] border-[6px] border-black bg-white" />

                      </div>

                    </div>

                    <div className="text-center mt-3">
                      <p className="text-xs font-semibold text-ink">
                        NAYARA
                      </p>

                      <p className="text-[11px] text-mute mt-0.5">
                        Scan to pay {inr(amount)}
                      </p>
                    </div>

                  </div>
                </div>

                {/* DIVIDER */}
                <div className="flex items-center gap-3">
                  <div className="h-px bg-line flex-1" />

                  <span className="text-[10px] text-mute">
                    OR
                  </span>

                  <div className="h-px bg-line flex-1" />
                </div>

                {/* UPI ID */}
                <div>
                  <label className="text-xs font-medium text-ink block mb-2">
                    Enter UPI ID
                  </label>

                  <input
                    className="input"
                    placeholder="yourname@bank"
                    aria-label="UPI ID"
                    value={vpa}
                    onChange={(e) =>
                      setVpa(e.target.value)
                    }
                  />
                </div>
              </div>
            )}

            {/* NET BANKING */}
            {method === 'netbanking' && (
              <div className="grid gap-3">

                <div>
                  <p className="text-sm font-medium text-ink">
                    Select your bank
                  </p>

                  <p className="text-[11px] text-mute mt-1">
                    Choose your bank to continue
                    securely
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">

                  {BANKS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setBank(b);
                        setErr('');
                      }}
                      className={`
                        border rounded-lg p-3
                        flex items-center gap-3
                        text-left transition
                        ${
                          bank === b
                            ? 'border-plum bg-lavender/40'
                            : 'border-line hover:bg-hover'
                        }
                      `}
                    >
                      <BankLogo bank={b} />

                      <span className="text-[11px] font-medium text-ink leading-tight">
                        {b}
                      </span>
                    </button>
                  ))}

                </div>

                <div className="text-[11px] text-mute border border-line rounded-lg p-3">
                  Selected bank:{' '}
                  <span className="font-medium text-ink">
                    {bank}
                  </span>
                </div>
              </div>
            )}

            {/* ERROR */}
            {err && (
              <p
                role="alert"
                className="text-xs text-error"
              >
                {err}
              </p>
            )}

            {/* PAY BUTTON */}
            <button
              className="btn btn-solid"
              onClick={pay}
            >
              {`Pay ${inr(amount)}`}
            </button>

            {/* SIMULATION NOTICE */}
            <p className="text-[11px] text-mute flex items-center gap-1">
              <ShieldCheck size={12} />
              Simulated checkout — no live payment
              gateway is connected in this build.
            </p>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}