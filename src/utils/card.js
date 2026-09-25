export const detectBrand=n=>{const d=n.replace(/\s/g,'');if(/^4/.test(d))return 'VISA';if(/^5[1-5]/.test(d)||/^2[2-7]/.test(d))return 'Mastercard';if(/^3[47]/.test(d))return 'Amex';if(/^6/.test(d))return 'RuPay';return ''};
export const formatCard=v=>v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
export const formatExpiry=v=>{const d=v.replace(/\D/g,'').slice(0,4);return d.length>2?d.slice(0,2)+'/'+d.slice(2):d};
export const luhnValid=n=>{const d=n.replace(/\s/g,'');if(d.length<13)return false;let sum=0,alt=false;for(let i=d.length-1;i>=0;i--){let x=+d[i];if(alt){x*=2;if(x>9)x-=9}sum+=x;alt=!alt}return sum%10===0};
export const validExpiry=v=>{const m=v.match(/^(\d{2})\/(\d{2})$/);if(!m)return false;const mo=+m[1],yr=2000+ +m[2];if(mo<1||mo>12)return false;const now=new Date();return yr>now.getFullYear()||(yr===now.getFullYear()&&mo>=now.getMonth()+1)};
export const genTxnId=()=>'pay_'+Math.random().toString(36).slice(2,8).toUpperCase()+Date.now().toString().slice(-6);
export const genUpiRef=()=>Array.from({length:12},()=>Math.floor(Math.random()*10)).join('');
