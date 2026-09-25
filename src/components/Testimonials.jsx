import {useEffect,useRef} from 'react';import {Swiper,SwiperSlide} from 'swiper/react';import {Autoplay} from 'swiper/modules';import 'swiper/css';import {Star,Quote} from 'lucide-react';
import {TESTIMONIALS} from '../data/testimonials';
export default function Testimonials(){
return <section className="bg-surface border-y border-line py-16 mt-24" aria-label="Customer ratings">
<div className="max-w-7xl mx-auto px-4"><h2 className="font-display text-3xl text-center mb-2">Loved by NAYARA customers</h2>
<p className="text-mute text-sm text-center mb-10">Real words from real drapes</p>
<Swiper modules={[Autoplay]} autoplay={{delay:4000,disableOnInteraction:false,pauseOnMouseEnter:true}} speed={900} loop spaceBetween={20} slidesPerView={1.1} breakpoints={{640:{slidesPerView:2},1024:{slidesPerView:3}}}>
{TESTIMONIALS.map(t=><SwiperSlide key={t.name}><figure className="bg-card border border-line p-6 h-full flex flex-col gap-4">
<Quote className="text-gold" size={22}/>
<blockquote className="text-sm leading-relaxed flex-1">"{t.text}"</blockquote>
<div className="flex items-center gap-1 text-gold" aria-label={`${t.rating} out of 5 stars`}>{Array.from({length:5},(_,i)=><Star key={i} size={14} fill={i<t.rating?'currentColor':'none'}/>)}</div>
<figcaption className="text-xs text-mute">{t.name} · {t.city}</figcaption></figure></SwiperSlide>)}
</Swiper></div></section>}
