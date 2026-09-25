import { Link } from 'react-router-dom'; import { useStore } from '../store'; import { products } from '../data/products'; import ProductCard from '../components/ProductCard'; import { EmptyState } from '../components/ui';
export default function Wishlist() {
	const w = useStore(s => s.wishlist); const items = products.filter(p => w.includes(p.id));
	return <div className="max-w-7xl mx-auto px-4 py-10"><h1 className="font-display text-3xl mb-6">Wishlist</h1>{!items.length ? <EmptyState title="Nothing saved yet" text="Tap the heart on any saree to save it." cta={<Link to="/shop" className="btn btn-solid">Browse sarees</Link>} /> : <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{items.map(p => <ProductCard key={p.id} p={p} />)}</div>}</div>
}
