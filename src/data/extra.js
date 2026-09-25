import {products,CATEGORIES} from './products';
export const CUS=['Aarohi Nair','Meera Iyer','Kavya Reddy','Ananya Sharma','Divya Menon','Ishita Rao','Priya Kapoor','Sneha Pillai'].map((name,i)=>({name,email:name.split(' ')[0].toLowerCase()+'@example.com',mobile:'98765'+(10000+i*137),orders:2+i%5,spend:'₹'+(6000+i*3100).toLocaleString('en-IN'),status:i%7===6?'Blocked':'Active'}));
const ST=['Confirmed','Processing','Packed','Shipped','Out for Delivery','Delivered'];
export const orders=Array.from({length:12},(_,i)=>({id:'NYR'+(2001000+i),date:`2026-09-${String(1+i).padStart(2,'0')}`,customer:CUS[i%8].name,items:[products[(i*3)%40],products[(i*5+1)%40]].slice(0,1+i%2),status:ST[i%6],pay:i%5===0?'COD':'Paid'}));
export const amt=o=>o.total??o.items.reduce((a,i)=>a+i.price*(i.qty||1),0);
export const NOTES=[['Order','Your order NYR2001003 has shipped'],['Payment','Payment received for NYR2001002'],['Delivery','Out for delivery today'],['Offers','Festive sale: up to 40% off silk'],['Wishlist','A saree in your wishlist dropped in price'],['Back in Stock','Kanchipuram Pure Silk Saree is back'],['New Collection','The Diwali edit is live']].map(([type,text],i)=>({id:i,type,text,read:i>3}));
export const COUPON_ROWS=[{code:'NAYARA10',type:'10% off',min:'₹1,999',expiry:'2026-12-31',status:'Active'},{code:'FESTIVE500',type:'₹500 off',min:'₹4,999',expiry:'2026-11-15',status:'Active'}];
export const FESTIVALS={pongal:['Pongal','Festive'],diwali:['Diwali','Festive'],onam:['Onam','Casual'],navratri:['Navratri','Party'],weddings:['Weddings','Wedding'],'festive-collections':['Festive Collections','Festive']};
export const MODS={
orders:{cols:['id','customer','date','total','pay','status'],rows:()=>orders.map(o=>({id:o.id,customer:o.customer,date:o.date,total:'₹'+amt(o).toLocaleString('en-IN'),pay:o.pay,status:o.status})),act:['Confirmed','Shipped','Delivered','Cancelled']},
customers:{cols:['name','email','mobile','orders','spend','status'],rows:()=>CUS.map(c=>({...c})),act:['Active','Blocked']},
inventory:{cols:['sku','name','stock','status'],rows:()=>products.map(p=>({sku:p.sku,name:p.name,stock:p.stock,status:p.stock<6?'Low stock':'In stock'}))},
payments:{cols:['id','customer','method','amount','status'],rows:()=>orders.map((o,i)=>({id:'TXN'+(7000+i),customer:o.customer,method:['UPI','Card','COD'][i%3],amount:'₹'+amt(o).toLocaleString('en-IN'),status:o.pay==='COD'?'Pending':'Paid'})),act:['Refunded']},
coupons:{cols:['code','type','min','expiry','status'],rows:()=>COUPON_ROWS.map(c=>({...c})),act:['Active','Expired','Delete']},
reviews:{cols:['product','customer','rating','review','status'],rows:()=>products.slice(0,8).map((p,i)=>({product:p.name,customer:CUS[i].name,rating:p.rating,review:'Beautiful drape and fabric.',status:'Pending'})),act:['Approved','Rejected','Hidden']},
banners:{cols:['title','type','position','status'],rows:()=>[['Timeless Drapes','Hero'],['Diwali Edit','Festival'],['Silk Sale','Sale'],['New Arrivals','Collection']].map(([title,type],i)=>({title,type,position:i+1,status:'Live'})),act:['Live','Paused','Delete']},
notifications:{cols:['campaign','channel','audience','schedule','status'],rows:()=>[['Diwali launch','Email','All customers'],['Cart reminder','WhatsApp','Abandoned carts'],['Back in stock','Push','Wishlisters'],['Order updates','In-app','Buyers']].map(([campaign,channel,audience],i)=>({campaign,channel,audience,schedule:`2026-10-0${i+1}`,status:'Scheduled'})),act:['Sent','Paused','Delete']},
categories:{cols:['name','products'],rows:()=>CATEGORIES.map((name,i)=>({name,products:3+i%7})),act:['Delete']},
collections:{cols:['name','products','status'],rows:()=>Object.values(FESTIVALS).map(([name],i)=>({name,products:8+i,status:'Live'})),act:['Live','Hidden']},
invoices:{cols:['invoice','order','customer','date'],rows:()=>orders.map(o=>({invoice:'INV-'+o.id,order:o.id,customer:o.customer,date:o.date}))},
reports:{cols:['report','period','status'],rows:()=>['Sales','Inventory','Returns','GST'].map(r=>({report:r,period:'Last 30 days',status:'Ready'}))}};
