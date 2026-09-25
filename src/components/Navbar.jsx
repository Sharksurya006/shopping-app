import {Link,NavLink} from 'react-router-dom';import {Search,User,Heart,ShoppingBag,Moon,Sun,Menu,X} from 'lucide-react';import {useState} from 'react';import {AnimatePresence,motion} from 'framer-motion';import {useStore} from '../store';
const NAV=[['New Arrivals','/shop'],['Sarees','/shop'],['Silk','/shop/silk-sarees'],['Cotton','/shop/cotton-sarees'],['Designer','/shop/designer-sarees'],['Wedding','/shop/wedding-sarees'],['Festive','/shop/festive-sarees'],['Best Sellers','/shop'],['Offers','/shop']];
export const Logo=()=><Link to="/" className="font-display text-2xl tracking-[0.35em] pl-[0.35em]" aria-label="NAYARA home">NAYARA</Link>;
const Count=({n})=>n>0&&<span className="absolute -top-1.5 -right-2 bg-plum text-white text-[10px] rounded-full w-4 h-4 grid place-items-center">{n}</span>;
export default function Navbar(){const [open,setOpen]=useState(false);const cart=useStore(s=>s.cart.reduce((a,c)=>a+c.qty,0)),wish=useStore(s=>s.wishlist.length),theme=useStore(s=>s.theme),toggle=useStore(s=>s.toggleTheme);
return <header className="sticky top-0 z-40 bg-bg border-b border-line">
<div className="bg-plum text-white text-center text-[11px] tracking-widest py-2">FREE SHIPPING ON ORDERS ABOVE ₹999</div>
<div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
<button className="lg:hidden" aria-label="Menu" onClick={()=>setOpen(true)}><Menu/></button><Logo/>
<nav className="hidden lg:flex gap-5 text-[13px]" aria-label="Main">{NAV.map(([l,to])=><NavLink key={l} to={to} className="hover:underline underline-offset-8">{l}</NavLink>)}</nav>
<div className="flex items-center gap-4"><Link to="/search" aria-label="Search"><Search size={20}/></Link>
<button onClick={toggle} aria-label="Toggle theme">{theme==='dark'?<Sun size={20}/>:<Moon size={20}/>}</button>
<Link to="/login" aria-label="Account" className="hidden sm:block"><User size={20}/></Link>
<Link to="/wishlist" aria-label="Wishlist" className="relative hidden sm:block"><Heart size={20}/><Count n={wish}/></Link>
<Link to="/cart" aria-label="Cart" className="relative"><ShoppingBag size={20}/><Count n={cart}/></Link></div></div>
<AnimatePresence>{open&&<motion.div initial={{x:'-100%'}} animate={{x:0}} exit={{x:'-100%'}} transition={{type:'tween',duration:.25}} className="fixed inset-0 z-50 bg-bg p-6">
<button aria-label="Close" onClick={()=>setOpen(false)}><X/></button><nav className="mt-8 grid gap-5 text-lg font-display">{NAV.map(([l,to])=><Link key={l} to={to} onClick={()=>setOpen(false)}>{l}</Link>)}</nav></motion.div>}</AnimatePresence></header>}
