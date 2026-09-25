import { Link } from 'react-router-dom'; import { Instagram, Facebook, Youtube } from 'lucide-react';
const COLS = { Shop: ['New Arrivals', 'Silk', 'Cotton', 'Designer', 'Wedding', 'Festive'], 'Customer Care': ['Contact', 'Shipping', 'Returns', 'FAQs', 'Track Order'], About: ['Our Story', 'About Us', 'Careers', 'Journal'], Legal: ['Privacy Policy', 'Terms', 'Refund Policy', 'Shipping Policy'] };
export default function Footer() {
	return <footer className="border-t border-line bg-surface mt-24 pb-16 lg:pb-0"><div className="max-w-7xl mx-auto px-4 py-14 grid gap-10 md:grid-cols-5">
		<div className="md:col-span-1"><div className="font-display text-2xl tracking-[0.35em]">NAYARA</div><p className="text-mute text-sm mt-2">Draped in Elegance.</p><div className="flex gap-3 mt-4"><Instagram size={18} /><Facebook size={18} /><Youtube size={18} /></div></div>
		{Object.entries(COLS).map(([h, l]) => <div key={h}><h3 className="font-semibold text-sm mb-3">{h}</h3><ul className="grid gap-2 text-sm text-mute">{l.map(x => <li key={x}><Link to="/shop" className="hover:text-ink">{x}</Link></li>)}</ul></div>)}</div>
		<div className="border-t border-line py-6 px-4 max-w-7xl mx-auto flex flex-wrap gap-3 justify-between text-sm"><span className="text-mute">Join the NAYARA Circle</span><input className="input max-w-xs" type="email" placeholder="Your email" aria-label="Newsletter email" /></div></footer>
}
