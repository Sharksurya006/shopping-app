import {img} from '../utils';
export const CATEGORIES=['Silk Sarees','Cotton Sarees','Linen Sarees','Banarasi','Kanchipuram','Organza','Chiffon','Georgette','Designer Sarees','Wedding Sarees','Festive Sarees','Printed Sarees','Handloom Sarees','Lightweight Sarees'];
export const slug=s=>s.toLowerCase().replace(/\s+/g,'-');
const F=[['Kanchipuram Pure Silk','Silk','Kanchipuram'],['Banarasi Tissue Silk','Silk','Banarasi'],['Handloom Cotton','Cotton','Handloom Sarees'],['Organza Floral','Organza','Organza'],['Designer Wedding Silk','Silk','Wedding Sarees'],['Linen Textured','Linen','Linen Sarees'],['Chiffon Printed','Chiffon','Chiffon'],['Georgette Festive','Georgette','Festive Sarees']];
const COL=['Red','Ivory','Black','Grey','Beige','Maroon'],OCC=['Wedding','Festive','Casual','Party','Office'];
export const products=Array.from({length:40},(_,i)=>{const [n,fabric,category]=F[i%8],mrp=Math.round((2400+(i*731)%11000)/100)*100-1,discount=10+(i*7)%40,price=Math.round(mrp*(1-discount/100));
return{id:i+1,sku:'NYR-'+(1000+i),name:`${n} Saree`,fabric,category,color:COL[i%6],occasion:OCC[i%5],mrp,price,discount,rating:+(3.8+(i%12)/10).toFixed(1),reviews:20+(i*37)%400,stock:i%9===0?3:5+(i*3)%40,isNew:i%4===0,best:i%5===1,length:'6.3 m',images:[img('nyr'+i),img('nyr-b'+i)]}});
