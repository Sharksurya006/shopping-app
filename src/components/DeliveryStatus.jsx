import {useEffect,useState} from 'react';import {Mail,MessageCircle,Loader2,Check} from 'lucide-react';
import {notificationService} from '../services';
const Row=({Icon,label,status,detail})=><div className="flex items-center gap-3 text-sm py-2">
  <Icon size={16} className="text-mute"/><span className="flex-1">{label}</span>
  {status==='sending'?<span className="flex items-center gap-1 text-mute text-xs"><Loader2 size={12} className="animate-spin"/>Sending…</span>
  :status==='delivered'?<span className="flex items-center gap-1 text-success text-xs"><Check size={12}/>Delivered {detail}</span>
  :<span className="text-mute text-xs">Queued</span>}</div>;
export default function DeliveryStatus({email,mobile}){
  const [mail,setMail]=useState('queued'),[wa,setWa]=useState('queued');
  useEffect(()=>{let live=true;setMail('sending');notificationService.sendEmail().then(r=>{if(live)setMail('delivered:'+new Date(r.at).toLocaleTimeString()) });
  setWa('sending');notificationService.sendWhatsApp().then(r=>{if(live)setWa('delivered:'+new Date(r.at).toLocaleTimeString())});return()=>{live=false}},[]);
  const parse=v=>v.startsWith('delivered')?['delivered',v.split(':').slice(1).join(':')]:[v,''];
  const [ms,mt]=parse(mail),[ws,wt]=parse(wa);
  return <div className="border border-line divide-y divide-line px-4">
    <Row Icon={Mail} label={`Invoice email to ${email||'your registered email'}`} status={ms} detail={mt&&`at ${mt}`}/>
    <Row Icon={MessageCircle} label={`WhatsApp update to ${mobile||'your registered number'}`} status={ws} detail={wt&&`at ${wt}`}/>
    <p className="text-[11px] text-mute py-2">Simulated delivery — no email or WhatsApp provider is connected in this build.</p></div>}
