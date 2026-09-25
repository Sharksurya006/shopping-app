import {useMemo,useState} from 'react';import {Link} from 'react-router-dom';import {products,CATEGORIES,slug} from '../data/products';import ProductCard from '../components/ProductCard';import {EmptyState} from '../components/ui';
const L={Color:['red','ivory','black','grey','beige','maroon'],Fabric:['silk','cotton','linen','organza','chiffon','georgette'],Occasion:['wedding','festive','casual','party','office']};
const TREND=['red silk wedding saree','cotton casual saree','kanchipuram silk','organza party saree'];
const load=()=>{try{return JSON.parse(localStorage.getItem('nayara-searches'))||[]}catch{return[]}};
export default function Search(){const [q,setQ]=useState(''),[hist,setHist]=useState(load);
const f=useMemo(()=>{const w=q.toLowerCase().split(/\s+/);return Object.fromEntries(Object.entries(L).map(([k,v])=>[k,v.find(x=>w.includes(x))]).filter(([,v])=>v))},[q]);
const res=useMemo(()=>q.trim()?products.filter(p=>Object.keys(f).length?Object.entries(f).every(([k,v])=>String(p[k.toLowerCase()]).toLowerCase()===v):p.name.toLowerCase().includes(q.toLowerCase())):[],[q,f]);
const save=v=>{setQ(v);const h=[v,...hist.filter(x=>x!==v)].slice(0,5);setHist(h);try{localStorage.setItem('nayara-searches',JSON.stringify(h))}catch{}};
return <div className="max-w-7xl mx-auto px-4 py-10"><input autoFocus className="input !py-4 text-lg" placeholder="Search sarees, e.g. red silk wedding saree" aria-label="Search" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&q&&save(q)}/>
{Object.keys(f).length>0&&<div className="flex gap-2 mt-3 text-xs">{Object.entries(f).map(([k,v])=><span key={k} className="border border-line px-2 py-1 capitalize">{k}: {v}</span>)}</div>}
{!q?<div className="grid md:grid-cols-3 gap-8 mt-8 text-sm"><div><h2 className="font-semibold mb-2">Trending</h2>{TREND.map(t=><button key={t} className="block py-1 text-mute hover:text-ink" onClick={()=>save(t)}>{t}</button>)}</div>
<div><h2 className="font-semibold mb-2">Recent searches</h2>{hist.length?hist.map(t=><button key={t} className="block py-1 text-mute hover:text-ink" onClick={()=>setQ(t)}>{t}</button>):<span className="text-mute">Nothing yet</span>}</div>
<div><h2 className="font-semibold mb-2">Popular categories</h2>{CATEGORIES.slice(0,6).map(c=><Link key={c} to={`/shop/${slug(c)}`} className="block py-1 text-mute hover:text-ink">{c}</Link>)}</div></div>
:!res.length?<EmptyState title="No results" text="Try a different color, fabric or occasion." cta={null}/>:<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">{res.map(p=><ProductCard key={p.id} p={p}/>)}</div>}</div>}
