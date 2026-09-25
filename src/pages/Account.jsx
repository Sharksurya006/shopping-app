import { useState } from 'react'; import { Link, NavLink, useParams, useNavigate } from 'react-router-dom'; import { useStore } from '../store'; import { NOTES, COUPON_ROWS } from '../data/extra'; import { OrdersTable, useOrders } from './Orders';
const TABS = [['overview', 'Overview'], ['profile', 'Profile'], ['orders', 'Orders'], ['addresses', 'Addresses'], ['payment-methods', 'Payment methods'], ['coupons', 'Coupons'], ['notifications', 'Notifications'], ['settings', 'Settings']];
const Row = ({ children }) => <div className="border border-line p-4 text-sm flex justify-between gap-4">{children}</div>;
export default function Account() {
	const { tab = 'overview' } = useParams(), nav = useNavigate(); const { user, setUser, wishlist, theme, toggleTheme } = useStore(), orders = useOrders(); const [notes, setNotes] = useState(NOTES), [addr, setAddr] = useState(['Home · 12 Temple Street, Madurai 625001 (Default)', 'Work · 4 Tech Park, Chennai 600096']);
	const body = {
		overview: <div className="grid sm:grid-cols-3 gap-3">{[['Orders', orders.length], ['Wishlist', wishlist.length], ['Coupons', COUPON_ROWS.length]].map(([k, v]) => <div key={k} className="border border-line p-4"><div className="text-xs text-mute">{k}</div><div className="text-2xl font-semibold">{v}</div></div>)}</div>,
		profile: <div className="grid gap-3 max-w-md"><Row><span className="text-mute">Name</span>{user?.name || 'Guest'}</Row><Row><span className="text-mute">Email</span>{user?.email || '—'}</Row></div>,
		orders: <OrdersTable />,
		addresses: <div className="grid gap-3">{addr.map(a => <Row key={a}>{a}<button className="underline text-xs" onClick={() => setAddr(x => x.filter(y => y !== a))}>Delete</button></Row>)}</div>,
		'payment-methods': <div className="grid gap-3"><Row>UPI · nayara@upi</Row><Row>Visa ending in 4417</Row></div>,
		coupons: <div className="grid gap-3">{COUPON_ROWS.map(c => <Row key={c.code}><b>{c.code}</b>{c.type} · min {c.min}</Row>)}</div>,
		notifications: <div className="grid gap-3"><button className="text-xs underline justify-self-start" onClick={() => setNotes(n => n.map(x => ({ ...x, read: true })))}>Mark all as read ({notes.filter(n => !n.read).length} unread)</button>{notes.map(n => <Row key={n.id}><span className={n.read ? 'text-mute' : 'font-semibold'}>{n.type}: {n.text}</span>{!n.read && <button className="text-xs underline" onClick={() => setNotes(l => l.map(x => x.id === n.id ? { ...x, read: true } : x))}>Mark read</button>}</Row>)}</div>,
		settings: <div className="grid gap-3 max-w-md"><Row>Theme: {theme}<button className="underline text-xs" onClick={toggleTheme}>Switch</button></Row><Row>Logout<button className="underline text-xs" onClick={() => { setUser(null); nav('/login') }}>Logout</button></Row></div>
	}[tab];
	return <div className="max-w-6xl mx-auto px-4 py-10 md:grid md:grid-cols-[200px_1fr] gap-10"><nav className="flex md:grid gap-1 overflow-x-auto mb-6 text-sm" aria-label="Account">{TABS.map(([k, l]) => <NavLink key={k} to={`/account/${k}`} className={() => `px-3 py-2 whitespace-nowrap ${tab === k ? 'bg-plum text-white' : 'hover:bg-hover'}`}>{l}</NavLink>)}<Link to="/wishlist" className="px-3 py-2 hover:bg-hover">Wishlist</Link></nav><div><h1 className="font-display text-3xl mb-6 capitalize">{tab.replace('-', ' ')}</h1>{body || null}</div></div>
}
