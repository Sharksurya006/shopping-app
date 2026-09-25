import { useEffect, useState } from 'react'; import { Link } from 'react-router-dom'; import { Minus, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../store'; import { products } from '../data/products'; import { couponService, COUPONS } from '../services'; import { inr } from '../utils'; import { EmptyState } from '../components/ui';
export const useTotals = () => {
	const cart = useStore(s => s.cart), coupon = useStore(s => s.coupon); const lines = cart.map(c => ({ ...products.find(p => p.id === c.id), qty: c.qty })); const sub = lines.reduce((a, l) => a + l.price * l.qty, 0);
	const disc = coupon ? (coupon.pct ? sub * coupon.pct / 100 : coupon.flat) : 0, ship = sub > 999 || !sub ? 0 : 99, tax = Math.round((sub - disc) * .05); return { lines, sub, disc, ship, tax, total: sub - disc + ship + tax }
};
export default function Cart() {
	const { lines, sub, disc, ship, tax, total } = useTotals(); const { setQty, removeFromCart, toggleWish, setCoupon } = useStore(); const [code, setCode] = useState(''), [msg, setMsg] = useState(''); useEffect(() => { document.title = 'Your bag | NAYARA' }, []);
	const apply = async () => { try { setCoupon(await couponService.apply(code, sub)); setMsg('Coupon applied') } catch (e) { setMsg(e.message) } };
	if (!lines.length) return <EmptyState title="Your bag is empty" text="Find a saree you love." cta={<Link to="/shop" className="btn btn-solid">Shop sarees</Link>} />;
	return <div className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-[1fr_360px] gap-10"><section><h1 className="font-display text-3xl mb-6">Shopping bag</h1>
		{lines.map(l => <div key={l.id} className="flex gap-4 py-4 border-b border-line"><img src={l.images[0]} alt={l.name} className="w-24 aspect-[3/4] object-cover" loading="lazy" />
			<div className="flex-1 text-sm"><Link to={`/product/${l.id}`} className="font-medium">{l.name}</Link><div className="mt-1"><b>{inr(l.price)}</b> <s className="text-mute">{inr(l.mrp)}</s></div>
				<div className="flex items-center gap-3 mt-3"><button aria-label="Decrease" onClick={() => setQty(l.id, l.qty - 1)}><Minus size={16} /></button>{l.qty}<button aria-label="Increase" onClick={() => setQty(l.id, l.qty + 1)}><Plus size={16} /></button></div>
				<div className="flex gap-4 mt-3 text-xs text-mute"><button onClick={() => { toggleWish(l.id); removeFromCart(l.id) }}>Move to wishlist</button><button aria-label="Remove" onClick={() => removeFromCart(l.id)}><Trash2 size={14} /></button></div></div></div>)}</section>
		<aside className="border border-line p-6 h-fit bg-surface text-sm grid gap-3"><div className="flex gap-2"><input className="input" placeholder="Coupon code" value={code} onChange={e => setCode(e.target.value)} /><button className="btn btn-line" onClick={apply}>Apply</button></div>{msg && <p className="text-mute text-xs">{msg}</p>}
			<p className="text-xs text-mute">Available: {COUPONS.map(c => c.code).join(', ')}</p>
			{[['Subtotal', inr(sub)], ['Discount', '−' + inr(disc)], ['Shipping', ship ? inr(ship) : 'Free'], ['Tax (5%)', inr(tax)]].map(([k, v]) => <div key={k} className="flex justify-between"><span className="text-mute">{k}</span>{v}</div>)}
			<div className="flex justify-between font-semibold text-base border-t border-line pt-3"><span>Total</span>{inr(total)}</div><Link to="/checkout" className="btn btn-solid">Proceed to checkout</Link></aside></div>
}
