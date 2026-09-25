import {create} from 'zustand';import {persist} from 'zustand/middleware';
export const useStore=create(persist(set=>({
theme:'light',toggleTheme:()=>set(s=>({theme:s.theme==='light'?'dark':'light'})),
cart:[],addToCart:(id,q=1)=>set(s=>({cart:s.cart.some(c=>c.id===id)?s.cart.map(c=>c.id===id?{...c,qty:c.qty+q}:c):[...s.cart,{id,qty:q}]})),
setQty:(id,qty)=>set(s=>({cart:qty<1?s.cart.filter(c=>c.id!==id):s.cart.map(c=>c.id===id?{...c,qty}:c)})),
removeFromCart:id=>set(s=>({cart:s.cart.filter(c=>c.id!==id)})),clearCart:()=>set({cart:[]}),
wishlist:[],toggleWish:id=>set(s=>({wishlist:s.wishlist.includes(id)?s.wishlist.filter(w=>w!==id):[...s.wishlist,id]})),
recent:[],view:id=>set(s=>({recent:[id,...s.recent.filter(r=>r!==id)].slice(0,8)})),
coupon:null,setCoupon:coupon=>set({coupon}),
user:null,setUser:user=>set({user}),
// Auth token for a future backend (sent as Authorization: Bearer <token> by src/services/http.js).
// Unused and always null while the app runs on mock services.
token:null,setToken:token=>set({token}),
orders:[],addOrder:o=>set(s=>({orders:[o,...s.orders]}))}),{name:'nayara-store'}));
