import {useState} from 'react';import {Link} from 'react-router-dom';import {useForm} from 'react-hook-form';import {useStore} from '../store';import {useTotals} from './Cart';import {inr} from '../utils';
import {orderService} from '../services';import PaymentPanel from '../components/PaymentPanel';import DeliveryStatus from '../components/DeliveryStatus';
const STEPS=['Address','Delivery','Payment','Confirmation'];
export default function Checkout(){const [step,setStep]=useState(0),[order,setOrder]=useState(null),[speed,setSpeed]=useState('Standard'),[addr,setAddr]=useState(null);
const {register,handleSubmit,formState:{errors}}=useForm(),t=useTotals(),clear=useStore(s=>s.clearCart),addOrder=useStore(s=>s.addOrder),user=useStore(s=>s.user);
const total=t.total+(speed==='Express'?199:0);
const onPaid=async(result,method)=>{const o=await orderService.create({items:t.lines,total,pay:method,txnId:result.txnId,speed,address:addr});addOrder(o);clear();setOrder(o);setStep(3)};
return <div className="max-w-2xl mx-auto px-4 py-10"><ol className="flex justify-between text-xs mb-8" aria-label="Checkout steps">{STEPS.map((s,i)=><li key={s} aria-current={i===step} className={i<=step?'font-semibold text-plum':'text-mute'}>{i+1}. {s}</li>)}</ol>
{step===0&&<form onSubmit={handleSubmit(d=>{setAddr(d);setStep(1)})} className="grid gap-3"><h1 className="font-display text-2xl">Delivery address</h1>
{[['name','Full name'],['mobile','Mobile'],['line','Address'],['pin','Pincode'],['city','City']].map(([k,l])=><div key={k}><input className="input" placeholder={l} aria-label={l} aria-invalid={!!errors[k]} {...register(k,{required:`${l} is required`})}/>{errors[k]&&<p role="alert" className="text-xs text-error mt-1">{errors[k].message}</p>}</div>)}
<button className="btn btn-solid">Continue</button></form>}
{step===1&&<div className="grid gap-3"><h1 className="font-display text-2xl">Delivery</h1>{[['Standard','3–5 days · Free'],['Express','1–2 days · ₹199']].map(([k,d])=><label key={k} className="border border-line p-4 flex gap-3"><input type="radio" name="d" checked={speed===k} onChange={()=>setSpeed(k)}/>{k} <span className="text-mute">{d}</span></label>)}<button className="btn btn-solid" onClick={()=>setStep(2)}>Continue</button></div>}
{step===2&&<div className="grid gap-3"><h1 className="font-display text-2xl">Payment</h1><PaymentPanel amount={total} onSuccess={onPaid}/></div>}
{step===3&&order&&<div className="py-6"><div className="text-center"><h1 className="font-display text-3xl">Thank you</h1><p className="mt-2 text-mute">Order {order.id} is confirmed.</p></div>
<div className="mt-8"><DeliveryStatus email={user?.email} mobile={addr?.mobile}/></div>
<Link to="/shop" className="btn btn-solid mt-6 mx-auto w-fit block">Continue shopping</Link></div>}</div>}
