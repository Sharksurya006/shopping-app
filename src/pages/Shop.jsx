import {useEffect,useMemo,useState} from 'react';import {useParams,Link} from 'react-router-dom';import {LayoutGrid,List,SlidersHorizontal} from 'lucide-react';
import {productService} from '../services';import {CATEGORIES,slug} from '../data/products';import ProductCard from '../components/ProductCard';import {ProductSkeleton,EmptyState,ErrorState} from '../components/ui';
const SORTS={rec:['Recommended',()=>0],new:['Newest',(a,b)=>b.id-a.id],lo:['Price: Low to High',(a,b)=>a.price-b.price],hi:['Price: High to Low',(a,b)=>b.price-a.price],pop:['Most Popular',(a,b)=>b.reviews-a.reviews],rate:['Highest Rated',(a,b)=>b.rating-a.rating],disc:['Biggest Discount',(a,b)=>b.discount-a.discount]};
const FABRICS=['Silk','Cotton','Linen','Organza','Chiffon','Georgette'],PER=12;
export default function Shop(){const {category}=useParams();const [all,setAll]=useState(null),[err,setErr]=useState(false),[fab,setFab]=useState([]),[max,setMax]=useState(15000),[sort,setSort]=useState('rec'),[grid,setGrid]=useState(true),[page,setPage]=useState(1),[fopen,setFopen]=useState(false);
const load=()=>{setErr(false);productService.list().then(setAll).catch(()=>setErr(true))};useEffect(load,[]);useEffect(()=>{setPage(1);document.title='Shop Sarees | NAYARA'},[category,fab,max,sort]);
const list=useMemo(()=>(all||[]).filter(p=>(!category||slug(p.category)===category||slug(p.fabric+' sarees')===category)&&(!fab.length||fab.includes(p.fabric))&&p.price<=max).sort(SORTS[sort][1]),[all,category,fab,max,sort]);
const shown=list.slice((page-1)*PER,page*PER),pages=Math.ceil(list.length/PER);
const Filters=<div className="grid gap-6 text-sm"><div><h3 className="font-semibold mb-2">Fabric</h3>{FABRICS.map(f=><label key={f} className="flex gap-2 py-1"><input type="checkbox" checked={fab.includes(f)} onChange={()=>setFab(x=>x.includes(f)?x.filter(y=>y!==f):[...x,f])}/>{f}</label>)}</div>
<div><h3 className="font-semibold mb-2">Price up to ₹{max.toLocaleString('en-IN')}</h3><input type="range" min="1000" max="15000" step="500" value={max} onChange={e=>setMax(+e.target.value)} className="w-full accent-black dark:accent-white" aria-label="Maximum price"/></div>
<div><h3 className="font-semibold mb-2">Category</h3>{CATEGORIES.map(c=><Link key={c} to={`/shop/${slug(c)}`} className="block py-1 text-mute hover:text-ink">{c}</Link>)}</div>
<button className="btn btn-line" onClick={()=>{setFab([]);setMax(15000)}}>Clear all</button></div>;
return <div className="max-w-7xl mx-auto px-4 py-8"><h1 className="font-display text-3xl capitalize">{category?category.replace(/-/g,' '):'All sarees'}</h1>
<div className="flex items-center justify-between mt-4 mb-6 border-b border-line pb-3 text-sm"><span className="text-mute">{list.length} products</span><div className="flex items-center gap-3">
<button className="lg:hidden btn btn-line !py-2" onClick={()=>setFopen(o=>!o)}><SlidersHorizontal size={14}/>Filter</button>
<select aria-label="Sort" value={sort} onChange={e=>setSort(e.target.value)} className="input !w-auto">{Object.entries(SORTS).map(([k,[l]])=><option key={k} value={k}>{l}</option>)}</select>
<button aria-label="Grid view" onClick={()=>setGrid(true)}><LayoutGrid size={18}/></button><button aria-label="List view" onClick={()=>setGrid(false)}><List size={18}/></button></div></div>
<div className="lg:grid lg:grid-cols-[220px_1fr] gap-10"><aside className={`${fopen?'block':'hidden'} lg:block mb-6`}>{Filters}</aside><div>
{err?<ErrorState onRetry={load}/>:!all?<div className="grid grid-cols-2 md:grid-cols-3 gap-4">{Array.from({length:6},(_,i)=><ProductSkeleton key={i}/>)}</div>:
!list.length?<EmptyState title="No sarees found" text="Try clearing a filter." cta={<button className="btn btn-solid" onClick={()=>{setFab([]);setMax(15000)}}>Clear filters</button>}/>:
<div className={grid?'grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8':'grid gap-6 max-w-2xl'}>{shown.map(p=><ProductCard key={p.id} p={p}/>)}</div>}
{pages>1&&<div className="flex justify-center gap-2 mt-12">{Array.from({length:pages},(_,i)=><button key={i} onClick={()=>{setPage(i+1);scrollTo({top:0})}} aria-current={page===i+1} className={`w-9 h-9 border border-line text-sm ${page===i+1?'bg-plum text-white':'hover:bg-hover'}`}>{i+1}</button>)}</div>}</div></div></div>}
