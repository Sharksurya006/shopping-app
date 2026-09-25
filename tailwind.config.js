const v=n=>`rgb(var(--${n}) / <alpha-value>)`;
export default {darkMode:'class',content:['./index.html','./src/**/*.{js,jsx}'],
theme:{extend:{colors:{bg:v('bg'),surface:v('surface'),card:v('card'),ink:v('ink'),mute:v('mute'),line:v('line'),hover:v('hover'),
plum:v('plum'),sapphire:v('sapphire'),gold:v('gold'),lavender:v('lavender'),rose:v('rose'),success:v('success'),error:v('error')},
fontFamily:{display:['"Cormorant Garamond"','serif'],sans:['Manrope','system-ui','sans-serif']}}},plugins:[]};
