// import { useState } from 'react'; import { Link } from 'react-router-dom'; import { useForm } from 'react-hook-form'; import { useStore } from '../store'; import { useTotals } from './Cart'; import { inr } from '../utils';
// import { orderService } from '../services'; import PaymentPanel from '../components/PaymentPanel'; import DeliveryStatus from '../components/DeliveryStatus';
// const STEPS = ['Address', 'Delivery', 'Payment', 'Confirmation'];
// export default function Checkout() {
// 	const [step, setStep] = useState(0), [order, setOrder] = useState(null), [speed, setSpeed] = useState('Standard'), [addr, setAddr] = useState(null);
// 	const { register, handleSubmit, formState: { errors } } = useForm(), t = useTotals(), clear = useStore(s => s.clearCart), addOrder = useStore(s => s.addOrder), user = useStore(s => s.user);
// 	const total = t.total + (speed === 'Express' ? 199 : 0);
// 	const onPaid = async (result, method) => { const o = await orderService.create({ items: t.lines, total, pay: method, txnId: result.txnId, speed, address: addr }); addOrder(o); clear(); setOrder(o); setStep(3) };
// 	return <div className="max-w-2xl mx-auto px-4 py-10"><ol className="flex justify-between text-xs mb-8" aria-label="Checkout steps">{STEPS.map((s, i) => <li key={s} aria-current={i === step} className={i <= step ? 'font-semibold text-plum' : 'text-mute'}>{i + 1}. {s}</li>)}</ol>
// 		{step === 0 && <form onSubmit={handleSubmit(d => { setAddr(d); setStep(1) })} className="grid gap-3"><h1 className="font-display text-2xl">Delivery address</h1>
// 			{[['name', 'Full name'], ['mobile', 'Mobile'], ['line', 'Address'], ['pin', 'Pincode'], ['city', 'City']].map(([k, l]) => <div key={k}><input className="input" placeholder={l} aria-label={l} aria-invalid={!!errors[k]} {...register(k, { required: `${l} is required` })} />{errors[k] && <p role="alert" className="text-xs text-error mt-1">{errors[k].message}</p>}</div>)}
// 			<button className="btn btn-solid">Continue</button></form>}
// 		{step === 1 && <div className="grid gap-3"><h1 className="font-display text-2xl">Delivery</h1>{[['Standard', '3–5 days · Free'], ['Express', '1–2 days · ₹199']].map(([k, d]) => <label key={k} className="border border-line p-4 flex gap-3"><input type="radio" name="d" checked={speed === k} onChange={() => setSpeed(k)} />{k} <span className="text-mute">{d}</span></label>)}<button className="btn btn-solid" onClick={() => setStep(2)}>Continue</button></div>}
// 		{step === 2 && <div className="grid gap-3"><h1 className="font-display text-2xl">Payment</h1><PaymentPanel amount={total} onSuccess={onPaid} /></div>}
// 		{step === 3 && order && <div className="py-6"><div className="text-center"><h1 className="font-display text-3xl">Thank you</h1><p className="mt-2 text-mute">Order {order.id} is confirmed.</p></div>
// 			<div className="mt-8"><DeliveryStatus email={user?.email} mobile={addr?.mobile} /></div>
// 			<Link to="/shop" className="btn btn-solid mt-6 mx-auto w-fit block">Continue shopping</Link></div>}</div>
// }

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useStore } from '../store';
import { useTotals } from './Cart';
import { inr } from '../utils';

import { orderService } from '../services';
import PaymentPanel from '../components/PaymentPanel';
import DeliveryStatus from '../components/DeliveryStatus';

const STEPS = ['Address', 'Delivery', 'Payment', 'Confirmation'];

const ADDR_KEY = 'nayara-addresses';
const ADDR_LABELS = ['Home', 'Work', 'Other'];

const loadAddresses = () => {
  try {
    const raw = localStorage.getItem(ADDR_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

const saveAddresses = (list) => {
  try {
    localStorage.setItem(ADDR_KEY, JSON.stringify(list));
  } catch {
    // storage unavailable — address book just won't persist this session
  }
};

const makeAddrId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export default function Checkout() {
  const [step, setStep] = useState(0);
  const [order, setOrder] = useState(null);
  const [speed, setSpeed] = useState('Standard');
  const [addr, setAddr] = useState(null);

  // ---- Address book state (persisted in localStorage) ----
  const [addresses, setAddressesState] = useState(() => loadAddresses());

  const [mode, setMode] = useState(() =>
    addresses.length ? 'list' : 'form'
  );

  const [selectedId, setSelectedId] = useState(() => {
    const def = addresses.find((a) => a.isDefault);
    return def ? def.id : addresses[0]?.id ?? null;
  });

  const [editingId, setEditingId] = useState(null);
  const [label, setLabel] = useState('Home');
  const [isDefault, setIsDefault] = useState(addresses.length === 0);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);

  const persistAddresses = (list) => {
    setAddressesState(list);
    saveAddresses(list);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      mobile: '',
      email: '',
      line: '',
      pin: '',
      city: '',
    },
  });

  const t = useTotals(),
    clear = useStore((s) => s.clearCart),
    addOrder = useStore((s) => s.addOrder),
    user = useStore((s) => s.user);

  const total = t.total + (speed === 'Express' ? 199 : 0);

  const onPaid = async (result, method) => {
    const o = await orderService.create({
      items: t.lines,
      total,
      pay: method,
      txnId: result.txnId,
      speed,
      address: addr,
    });

    addOrder(o);
    clear();
    setOrder(o);
    setStep(3);
  };

  // ---- Address book actions ----

  const startAdd = () => {
    setEditingId(null);
    setLabel('Home');
    setIsDefault(addresses.length === 0);

    reset({
      name: '',
      mobile: '',
      email: '',
      line: '',
      pin: '',
      city: '',
    });

    setMode('form');
  };

  const startEdit = (a) => {
    setEditingId(a.id);
    setLabel(a.label || 'Home');
    setIsDefault(!!a.isDefault);

    reset({
      name: a.name || '',
      mobile: a.mobile || '',
      email: a.email || '',
      line: a.line || '',
      pin: a.pin || '',
      city: a.city || '',
    });

    setMode('form');
  };

  const onSaveAddress = (d) => {
    const id = editingId || makeAddrId();
    const makeDefault = isDefault || addresses.length === 0;

    let next = makeDefault
      ? addresses.map((a) => ({ ...a, isDefault: false }))
      : addresses;

    const newAddr = {
      id,
      name: d.name.trim().replace(/\s+/g, ' '),
      mobile: d.mobile.replace(/\D/g, ''),
      email: d.email.trim().toLowerCase(),
      line: d.line.trim().replace(/\s+/g, ' '),
      pin: d.pin.replace(/\D/g, ''),
      city: d.city.trim().replace(/\s+/g, ' '),
      label,
      isDefault: makeDefault,
    };

    next = editingId
      ? next.map((a) => (a.id === id ? newAddr : a))
      : [...next, newAddr];

    persistAddresses(next);
    setSelectedId(id);
    setMode('list');
  };

  const confirmDelete = (id) => {
    let next = addresses.filter((a) => a.id !== id);

    if (next.length && !next.some((a) => a.isDefault)) {
      next = next.map((a, i) =>
        i === 0 ? { ...a, isDefault: true } : a
      );
    }

    persistAddresses(next);
    setConfirmingDeleteId(null);

    if (selectedId === id) {
      setSelectedId(next[0]?.id ?? null);
    }

    if (!next.length) {
      setMode('form');
    }
  };

  const handleSetDefault = (id) => {
    persistAddresses(
      addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
  };

  const proceedWithAddress = () => {
    const a = addresses.find((x) => x.id === selectedId);

    if (!a) return;

    setAddr(a);
    setStep(1);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <ol
        className="flex justify-between text-xs mb-8"
        aria-label="Checkout steps"
      >
        {STEPS.map((s, i) => (
          <li
            key={s}
            aria-current={i === step ? 'step' : undefined}
            className={
              i <= step ? 'font-semibold text-plum' : 'text-mute'
            }
          >
            {i + 1}. {s}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="grid gap-4">
          <h1 className="font-display text-2xl font-bold">
            Delivery address
          </h1>

          {/* SAVED ADDRESS LIST */}
          {mode === 'list' && addresses.length > 0 && (
            <>
              <div className="grid gap-3">
                {addresses.map((a) => (
                  <div
                    key={a.id}
                    className={`border rounded-lg p-4 transition ${
                      selectedId === a.id
                        ? 'border-plum bg-lavender/30'
                        : 'border-line hover:bg-hover'
                    }`}
                  >
                    <label className="flex gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="saved-address"
                        className="mt-1"
                        checked={selectedId === a.id}
                        onChange={() => setSelectedId(a.id)}
                      />

                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-ink">
                            {a.name}
                          </span>

                          {a.label && (
                            <span className="text-[10px] uppercase tracking-wide bg-lavender/50 text-plum px-2 py-0.5 rounded-full">
                              {a.label}
                            </span>
                          )}

                          {a.isDefault && (
                            <span className="text-[10px] uppercase tracking-wide bg-success/10 text-success px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-mute mt-1">
                          {a.line}, {a.city} – {a.pin}
                        </p>

                        <p className="text-sm text-mute">
                          Mobile: {a.mobile}
                        </p>

                        {a.email && (
                          <p className="text-sm text-mute">
                            Email: {a.email}
                          </p>
                        )}
                      </div>
                    </label>

                    {/* ROW ACTIONS */}
                    {confirmingDeleteId === a.id ? (
                      <div className="flex items-center gap-3 mt-3 pl-7 text-xs">
                        <span className="text-mute">
                          Remove this address?
                        </span>

                        <button
                          type="button"
                          className="text-error font-medium"
                          onClick={() => confirmDelete(a.id)}
                        >
                          Yes, remove
                        </button>

                        <button
                          type="button"
                          className="text-mute font-medium"
                          onClick={() =>
                            setConfirmingDeleteId(null)
                          }
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-4 mt-3 pl-7 text-xs">
                        <button
                          type="button"
                          className="text-plum font-medium"
                          onClick={() => startEdit(a)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="text-error font-medium"
                          onClick={() => setConfirmingDeleteId(a.id)}
                        >
                          Remove
                        </button>

                        {!a.isDefault && (
                          <button
                            type="button"
                            className="text-mute font-medium"
                            onClick={() => handleSetDefault(a.id)}
                          >
                            Set as default
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn btn-line justify-self-start"
                onClick={startAdd}
              >
                + Add a new address
              </button>

              <button
                type="button"
                className="btn btn-solid mt-2"
                disabled={!selectedId}
                onClick={proceedWithAddress}
              >
                Deliver to this address
              </button>
            </>
          )}

          {/* ADD / EDIT FORM */}
          {mode === 'form' && (
            <form
              noValidate
              onSubmit={handleSubmit(onSaveAddress)}
              className="grid gap-3 border border-line rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-ink">
                  {editingId
                    ? 'Edit address'
                    : 'Add a new address'}
                </p>

                {addresses.length > 0 && (
                  <button
                    type="button"
                    className="text-xs text-mute"
                    onClick={() => setMode('list')}
                  >
                    Cancel
                  </button>
                )}
              </div>

              {/* FULL NAME */}
              <div>
                <input
                  type="text"
                  className="input"
                  placeholder="Full name"
                  aria-label="Full name"
                  autoComplete="name"
                  maxLength={60}
                  aria-invalid={!!errors.name}
                  {...register('name', {
                    required: 'Full name is required',

                    setValueAs: (value) =>
                      value.trim().replace(/\s+/g, ' '),

                    validate: (value) => {
                      const name = value.trim();

                      if (!name) {
                        return 'Full name is required';
                      }

                      if (name.length < 3) {
                        return 'Full name must be at least 3 characters';
                      }

                      if (name.length > 60) {
                        return 'Full name must not exceed 60 characters';
                      }

                      if (
                        !/^[A-Za-z][A-Za-z\s.'-]*$/.test(name)
                      ) {
                        return 'Full name contains invalid characters';
                      }

                      return true;
                    },
                  })}
                />

                {errors.name && (
                  <p role="alert" className="text-xs text-error mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* MOBILE */}
              <div>
                <input
                  type="tel"
                  className="input"
                  placeholder="Mobile number"
                  aria-label="Mobile number"
                  autoComplete="tel"
                  inputMode="numeric"
                  maxLength={10}
                  aria-invalid={!!errors.mobile}
                  {...register('mobile', {
                    required: 'Mobile number is required',

                    validate: (value) => {
                      const mobile = value.replace(/\D/g, '');

                      if (!mobile) {
                        return 'Mobile number is required';
                      }

                      if (!/^[6-9]\d{9}$/.test(mobile)) {
                        return 'Enter a valid 10-digit Indian mobile number';
                      }

                      if (/^(\d)\1{9}$/.test(mobile)) {
                        return 'Enter a valid mobile number';
                      }

                      return true;
                    },

                    onChange: (e) => {
                      e.target.value = e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 10);
                    },
                  })}
                />

                {errors.mobile && (
                  <p role="alert" className="text-xs text-error mt-1">
                    {errors.mobile.message}
                  </p>
                )}
              </div>

              {/* EMAIL */}
              <div>
                <input
                  type="email"
                  className="input"
                  placeholder="Email address"
                  aria-label="Email address"
                  autoComplete="email"
                  maxLength={254}
                  aria-invalid={!!errors.email}
                  {...register('email', {
                    required: 'Email address is required',

                    setValueAs: (value) =>
                      value.trim().toLowerCase(),

                    validate: (value) => {
                      const email = value.trim();

                      if (!email) {
                        return 'Email address is required';
                      }

                      if (email.length > 254) {
                        return 'Email address is too long';
                      }

                      if (email.includes('..')) {
                        return 'Enter a valid email address';
                      }

                      const emailRegex =
                        /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

                      if (!emailRegex.test(email)) {
                        return 'Enter a valid email address';
                      }

                      return true;
                    },

                    onChange: (e) => {
                      e.target.value = e.target.value
                        .trimStart()
                        .toLowerCase();
                    },
                  })}
                />

                {errors.email && (
                  <p role="alert" className="text-xs text-error mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* ADDRESS */}
              <div>
                <textarea
                  className="input min-h-[90px] resize-y"
                  placeholder="Address"
                  aria-label="Address"
                  autoComplete="street-address"
                  maxLength={250}
                  aria-invalid={!!errors.line}
                  {...register('line', {
                    required: 'Address is required',

                    setValueAs: (value) =>
                      value.trim().replace(/\s+/g, ' '),

                    validate: (value) => {
                      const address = value.trim();

                      if (!address) {
                        return 'Address is required';
                      }

                      if (address.length < 10) {
                        return 'Address must be at least 10 characters';
                      }

                      if (address.length > 250) {
                        return 'Address must not exceed 250 characters';
                      }

                      return true;
                    },
                  })}
                />

                {errors.line && (
                  <p role="alert" className="text-xs text-error mt-1">
                    {errors.line.message}
                  </p>
                )}
              </div>

              {/* PINCODE */}
              <div>
                <input
                  type="text"
                  className="input"
                  placeholder="Pincode"
                  aria-label="Pincode"
                  autoComplete="postal-code"
                  inputMode="numeric"
                  maxLength={6}
                  aria-invalid={!!errors.pin}
                  {...register('pin', {
                    required: 'Pincode is required',

                    validate: (value) => {
                      const pin = value.replace(/\D/g, '');

                      if (!/^[1-9]\d{5}$/.test(pin)) {
                        return 'Enter a valid 6-digit pincode';
                      }

                      if (/^(\d)\1{5}$/.test(pin)) {
                        return 'Enter a valid pincode';
                      }

                      return true;
                    },

                    onChange: (e) => {
                      e.target.value = e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 6);
                    },
                  })}
                />

                {errors.pin && (
                  <p role="alert" className="text-xs text-error mt-1">
                    {errors.pin.message}
                  </p>
                )}
              </div>

              {/* CITY */}
              <div>
                <input
                  type="text"
                  className="input"
                  placeholder="City"
                  aria-label="City"
                  autoComplete="address-level2"
                  maxLength={60}
                  aria-invalid={!!errors.city}
                  {...register('city', {
                    required: 'City is required',

                    setValueAs: (value) =>
                      value.trim().replace(/\s+/g, ' '),

                    validate: (value) => {
                      const city = value.trim();

                      if (!city) {
                        return 'City is required';
                      }

                      if (city.length < 2) {
                        return 'City must be at least 2 characters';
                      }

                      if (city.length > 60) {
                        return 'City must not exceed 60 characters';
                      }

                      if (!/^[A-Za-z][A-Za-z\s.'-]*$/.test(city)) {
                        return 'Enter a valid city name';
                      }

                      return true;
                    },
                  })}
                />

                {errors.city && (
                  <p role="alert" className="text-xs text-error mt-1">
                    {errors.city.message}
                  </p>
                )}
              </div>

              {/* ADDRESS LABEL */}
              <div>
                <p className="text-xs text-mute mb-1.5">
                  Save address as
                </p>

                <div className="flex gap-2">
                  {ADDR_LABELS.map((l) => (
                    <button
                      type="button"
                      key={l}
                      onClick={() => setLabel(l)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition ${
                        label === l
                          ? 'border-plum bg-lavender/40 text-ink'
                          : 'border-line text-mute hover:bg-hover'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* DEFAULT ADDRESS */}
              <label className="flex items-center gap-2 text-xs text-mute">
                <input
                  type="checkbox"
                  checked={isDefault}
                  disabled={addresses.length === 0}
                  onChange={(e) =>
                    setIsDefault(e.target.checked)
                  }
                />
                Make this my default address
              </label>

              <button
                type="submit"
                className="btn btn-solid"
              >
                {editingId
                  ? 'Save changes'
                  : 'Save & continue'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* DELIVERY */}
      {step === 1 && (
        <div className="grid gap-3">
          <h1 className="font-display text-2xl">
            Delivery
          </h1>

          {[
            ['Standard', '3–5 days · Free'],
            ['Express', '1–2 days · ₹199'],
          ].map(([k, d]) => (
            <label
              key={k}
              className="border border-line p-4 flex gap-3"
            >
              <input
                type="radio"
                name="d"
                checked={speed === k}
                onChange={() => setSpeed(k)}
              />

              {k}

              <span className="text-mute">
                {d}
              </span>
            </label>
          ))}

          <button
            type="button"
            className="btn btn-solid"
            onClick={() => setStep(2)}
          >
            Continue
          </button>
        </div>
      )}

      {/* PAYMENT */}
      {step === 2 && (
        <div className="grid gap-3">
          <h1 className="font-display text-2xl">
            Payment
          </h1>

          <PaymentPanel
            amount={total}
            onSuccess={onPaid}
          />
        </div>
      )}

      {/* CONFIRMATION */}
      {step === 3 && order && (
        <div className="py-6">
          <div className="text-center">
            <h1 className="font-display text-3xl">
              Thank you
            </h1>

            <p className="mt-2 text-mute">
              Order {order.id} is confirmed.
            </p>
          </div>

          <div className="mt-8">
            <DeliveryStatus
              email={user?.email || addr?.email}
              mobile={addr?.mobile}
            />
          </div>

          <Link
            to="/shop"
            className="btn btn-solid mt-6 mx-auto w-fit block"
          >
            Continue shopping
          </Link>
        </div>
      )}
    </div>
  );
}