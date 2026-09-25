import {memo,useState} from 'react';import {Link} from 'react-router-dom';import {Heart,ShoppingBag,Star} from 'lucide-react';import {motion} from 'framer-motion';
import {useStore} from '../store';import {inr} from '../utils';import {Badge} from './ui';
function ProductCard({p}){const wished=useStore(s=>s.wishlist.includes(p.id)),toggle=useStore(s=>s.toggleWish),add=useStore(s=>s.addToCart);const [h,setH]=useState(false);
return <article className="group" onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}>
<div className="relative aspect-[3/4] overflow-hidden bg-surface border border-line">
<Link to={`/product/${p.id}`} aria-label={p.name}><img src={p.images[h?1:0]} alt={p.name} loading="lazy" className="w-full h-full object-cover transition duration-500 group-hover:scale-105"/></Link>
<div className="absolute top-2 left-2 flex flex-col gap-1">{p.isNew&&<Badge>New</Badge>}{p.best&&<Badge>Bestseller</Badge>}</div>
<motion.button whileTap={{scale:.8}} onClick={()=>toggle(p.id)} aria-pressed={wished} aria-label="Toggle wishlist" className="absolute top-2 right-2 p-2 bg-bg/90 border border-line"><Heart size={16} fill={wished?'rgb(var(--rose))':'none'} stroke={wished?'rgb(var(--rose))':'currentColor'}/></motion.button>
<button onClick={()=>add(p.id)} className="btn btn-solid absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 focus:translate-y-0"><ShoppingBag size={14}/>Add to bag</button></div>
<div className="pt-3 text-sm"><Link to={`/product/${p.id}`} className="font-medium line-clamp-1">{p.name}</Link>
<div className="text-mute text-xs mt-0.5 flex items-center gap-2">{p.fabric}<span className="inline-flex items-center gap-0.5"><Star size={11} fill="currentColor"/>{p.rating} ({p.reviews})</span></div>
<div className="mt-1 flex items-baseline gap-2"><b>{inr(p.price)}</b><s className="text-mute text-xs">{inr(p.mrp)}</s><span className="text-xs text-mute">{p.discount}% off</span></div>
{p.stock<6&&<div className="text-xs text-red-600/80 mt-1">Only {p.stock} left</div>}</div></article>}
export default memo(ProductCard);
