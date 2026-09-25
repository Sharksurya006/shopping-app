import {Outlet,NavLink} from 'react-router-dom';import {Home,Grid,Heart,Package,User} from 'lucide-react';import Navbar from '../components/Navbar';import Footer from '../components/Footer';
import Testimonials from '../components/Testimonials';
const T=[[Home,'Home','/'],[Grid,'Shop','/shop'],[Heart,'Wishlist','/wishlist'],[Package,'Orders','/orders'],[User,'Account','/login']];
export default function MainLayout(){return <><Navbar/><main id="main"><Outlet/></main><Testimonials/><Footer/>
<nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-bg border-t border-line grid grid-cols-5" aria-label="Mobile">{T.map(([I,l,to])=><NavLink key={l} to={to} className="flex flex-col items-center py-2 text-[10px] gap-0.5"><I size={20}/>{l}</NavLink>)}</nav></>}
