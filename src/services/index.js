// Every exported function here is the single place the UI talks to data/payments/etc.
// Each one now has two branches:
//   - USE_REAL_API is false (default — no .env configured): behaves exactly as before,
//     with the same simulated delays, IDs and success rates the UI was built against.
//   - USE_REAL_API is true (VITE_API_BASE_URL set): calls the real backend at the path
//     listed in services/endpoints.js. Full request/response shapes for each endpoint
//     are documented in /BACKEND.md.
// No component imports anything from here differently than before — this file is the
// only thing that changes when a backend is connected.
import {products} from '../data/products';
import {genTxnId} from '../utils/card';
import {http} from './http';
import {EP} from './endpoints';
import {API_BASE, USE_REAL_API, RAZORPAY_KEY} from '../config/env';
import {useStore} from '../store';

const wait=(ms=400)=>new Promise(r=>setTimeout(r,ms));

export const productService={
  list: async()=>{ if(USE_REAL_API) return http.get(EP.products.list); await wait(); return products },
  get: async id=>{ if(USE_REAL_API) return http.get(EP.products.detail(id)); await wait(250); return products.find(p=>p.id===+id) },
  search: async q=>{ if(USE_REAL_API) return http.get(EP.products.search(q)); await wait(150); return products.filter(p=>(p.name+p.color+p.occasion).toLowerCase().includes(q.toLowerCase())) },
};

export const COUPONS=[{code:'NAYARA10',pct:10,min:1999},{code:'FESTIVE500',flat:500,min:4999}];
export const couponService={
  list: async()=>{ if(USE_REAL_API) return http.get(EP.coupons.list); return COUPONS },
  apply: async(code,sub)=>{
    if(USE_REAL_API) return http.post(EP.coupons.apply,{code,subtotal:sub});
    await wait(300); const c=COUPONS.find(x=>x.code===code.toUpperCase());
    if(!c) throw new Error('Invalid coupon'); if(sub<c.min) throw new Error(`Minimum order ₹${c.min}`); return c;
  },
};

// --- Auth: on a real backend, login/signup are expected to return {user, token}.
// The token is stashed in the persisted store here so every future http.* call
// picks it up automatically — no other file needs to know it exists.
export const authService={
  login: async d=>{
    if(USE_REAL_API){ const r=await http.post(EP.auth.login,d,{auth:false}); useStore.getState().setToken(r.token); return r.user }
    await wait(); return {name:d.email.split('@')[0],email:d.email};
  },
  signup: async d=>{
    if(USE_REAL_API){ const r=await http.post(EP.auth.signup,d,{auth:false}); useStore.getState().setToken(r.token); return r.user }
    await wait(); return {name:d.name,email:d.email,mobile:d.mobile};
  },
  logout: async()=>{ if(USE_REAL_API) await http.post(EP.auth.logout,{}).catch(()=>{}); useStore.getState().setToken(null); useStore.getState().setUser(null) },
};

// --- OTP: send() stashes the backend's requestId so verify() can send it back
// without any component needing to pass it through — call sites stay unchanged.
let lastOtpRequestId=null;
export const otpService={
  send: async contact=>{
    if(USE_REAL_API){ const r=await http.post(EP.otp.send,{contact},{auth:false}); lastOtpRequestId=r.requestId; return {sent:true,contact} }
    await wait(700); return {sent:true,contact};
  },
  verify: async code=>{
    if(USE_REAL_API){ try{ await http.post(EP.otp.verify,{code,requestId:lastOtpRequestId},{auth:false}); return true }catch{ return false } }
    await wait(500); return code.length===6;
  },
};

// --- Payments: mock branch keeps today's simulated timings/decline rate untouched.
// Real branch drives an actual Razorpay Checkout once a backend + RAZORPAY key exist
// (create-order on your server -> Checkout popup -> verify signature on your server).
// Swap the loadCheckout/processViaGateway pair below for another gateway's SDK if needed.
function loadCheckoutScript(){
  return new Promise(resolve=>{
    if(window.Razorpay) return resolve(true);
    const s=document.createElement('script');
    s.src='https://checkout.razorpay.com/v1/checkout.js';
    s.onload=()=>resolve(true); s.onerror=()=>resolve(false);
    document.body.appendChild(s);
  });
}
async function processViaGateway({amount,method}){
  const order=await http.post(EP.payments.createOrder,{amount,method});
  const loaded=await loadCheckoutScript();
  if(!loaded) return {ok:false,reason:'Payment gateway failed to load'};
  return new Promise(resolve=>{
    const user=useStore.getState().user;
    const rzp=new window.Razorpay({
      key:RAZORPAY_KEY, amount:order.amount, currency:order.currency||'INR', order_id:order.id,
      name:'NAYARA', description:'Saree purchase', prefill:{name:user?.name,email:user?.email},
      theme:{color:'#4B245C'},
      handler: async response=>{
        try{
          const verified=await http.post(EP.payments.verify,{
            razorpay_order_id:response.razorpay_order_id,
            razorpay_payment_id:response.razorpay_payment_id,
            razorpay_signature:response.razorpay_signature,
          });
          resolve({ok:true,txnId:response.razorpay_payment_id,...verified});
        }catch(e){ resolve({ok:false,reason:e.message||'Payment verification failed'}) }
      },
      modal:{ondismiss:()=>resolve({ok:false,reason:'Payment cancelled'})},
    });
    rzp.open();
  });
}
export const paymentService={
  processCard: async({amount})=>{
    if(USE_REAL_API) return processViaGateway({amount,method:'card'});
    await wait(1400); const ok=Math.random()<0.92; return ok?{ok:true,txnId:genTxnId(),amount}:{ok:false,reason:'Card declined by issuing bank'};
  },
  processUpi: async({vpa,amount})=>{
    if(USE_REAL_API) return processViaGateway({amount,method:'upi'});
    await wait(2200); const ok=Math.random()<0.9; return ok?{ok:true,txnId:genTxnId(),vpa,amount}:{ok:false,reason:'Request declined in UPI app'};
  },
  processNetbanking: async({bank,amount})=>{
    if(USE_REAL_API) return processViaGateway({amount,method:'netbanking'});
    await wait(1600); return {ok:true,txnId:genTxnId(),bank,amount};
  },
  processWallet: async({wallet,amount})=>{
    if(USE_REAL_API) return processViaGateway({amount,method:'wallet'});
    await wait(1200); return {ok:true,txnId:genTxnId(),wallet,amount};
  },
  processBnpl: async({amount})=>{
    if(USE_REAL_API){ const order=await http.post(EP.payments.createOrder,{amount,method:'bnpl'}); return {ok:true,txnId:order.id,amount} }
    await wait(1800); return {ok:true,txnId:genTxnId(),amount};
  },
  processCod: async({amount})=>{
    if(USE_REAL_API) return http.post(EP.payments.cod,{amount});
    await wait(500); return {ok:true,txnId:'COD-'+Date.now().toString().slice(-8),amount};
  },
};

// --- Orders/invoice/notifications: creating an order or generating an invoice
// remembers the order so the notification calls right after (which take no
// arguments today) know which order they're about, without touching DeliveryStatus.jsx.
let lastOrderCtx=null;
export const orderService={
  create: async o=>{
    if(USE_REAL_API){ const order=await http.post(EP.orders.create,o); lastOrderCtx=order; return order }
    await wait(); const order={...o,id:'NYR'+Date.now().toString().slice(-7),date:new Date().toISOString(),status:'Confirmed'};
    lastOrderCtx=order; return order;
  },
};
export const invoiceService={
  generateInvoice: async o=>{
    lastOrderCtx=o;
    if(USE_REAL_API) return http.get(EP.invoices.get(o.id));
    await wait(); return {invoiceNo:'INV-'+o.id,...o};
  },
};
export const notificationService={
  sendEmail: async()=>{
    if(USE_REAL_API) return http.post(EP.notifications.email,{orderId:lastOrderCtx?.id});
    await wait(900); return {delivered:true,at:new Date().toISOString()};
  },
  sendWhatsApp: async()=>{
    if(USE_REAL_API) return http.post(EP.notifications.whatsapp,{orderId:lastOrderCtx?.id});
    await wait(1300); return {delivered:true,at:new Date().toISOString()};
  },
};

export const trackingService={
  getOrderTracking: async orderId=>{
    if(USE_REAL_API && orderId) return http.get(EP.orders.tracking(orderId));
    await wait(); return ['Order Placed','Payment Confirmed','Processing','Packed','Shipped','Out for Delivery','Delivered'];
  },
};

export const adminService={
  stats: async()=>{
    if(USE_REAL_API) return http.get(EP.admin.stats);
    return {revenue:1284500,orders:842,customers:3120,lowStock:products.filter(p=>p.stock<6).length};
  },
  revenue: async()=>{
    if(USE_REAL_API) return http.get(EP.admin.revenue);
    return Array.from({length:12},(_,i)=>({m:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],revenue:80000+((i*53)%9)*17000,orders:40+((i*29)%11)*8}));
  },
};

export const customerService={},wishlistService={},cartService={},reviewService={};

// True once a real backend is actually configured, in case a component wants to
// show a "connected" indicator or similar in the future. Not used anywhere today.
export const backendConnected=USE_REAL_API;
export const backendBaseUrl=API_BASE;
