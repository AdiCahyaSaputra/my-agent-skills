import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {defaultTheme, themes} from '../src/themes.js';

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const presets = {default:defaultTheme,...themes};
const payload = JSON.stringify(presets).replace(/</g, '\\u003c');
const html = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Article-to-PPTX theme preview</title>
<style>
:root{color-scheme:light;font-family:"SF Pro",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--foreground,#252525);--ui-border:var(--border,#9a9a9a);--ui-muted:var(--muted-foreground,#666)}
*{box-sizing:border-box}body{margin:0;background:transparent}main{max-width:1120px;margin:auto}h1{font-size:27px;letter-spacing:-.7px;margin:0 0 8px;font-weight:650}p{line-height:1.5;margin:0}header{padding:22px 0 18px}header p{max-width:72ch;color:var(--ui-muted);font-size:14px}.toolbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px}label{font-size:13px}select,button{font:inherit;color:inherit;background:transparent;border:1px solid var(--ui-border);border-radius:6px;padding:8px 10px}select{color-scheme:light dark}button{cursor:pointer}button:hover{border-color:currentColor}button:focus-visible,select:focus-visible{outline:3px solid #648df3;outline-offset:3px}.toolbar label{display:flex;align-items:center;gap:8px}.toolbar .grow{flex:1}.viewer{border:1px solid var(--ui-border);overflow:hidden;border-radius:8px}.viewer svg{display:block;width:100%;height:auto}.details{display:flex;gap:14px;align-items:center;flex-wrap:wrap;padding:12px 0 8px}.details h2{margin:0;font-size:19px;font-weight:600}.swatches{display:flex;gap:5px}.swatch{width:18px;height:18px;border-radius:50%;border:1px solid #8888}.hint{font-size:12px;color:var(--ui-muted)}code{font-family:ui-monospace,monospace;font-size:12px}.config{display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:4px 0 18px}.config button{font-size:12px;padding:5px 9px}#status{font-size:12px;color:var(--ui-muted)}.gallery{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px 14px;margin:12px 0 24px}.tile{border:0;padding:0;text-align:left;border-radius:0;min-width:0}.tile svg{display:block;width:100%;height:auto;border:1px solid var(--ui-border);border-radius:5px}.tile[aria-pressed=true] svg{outline:3px solid #648df3;outline-offset:2px}.tile span{display:block;margin-top:9px;font-size:13px}.tile small{display:block;font-size:11px;color:var(--ui-muted);margin-top:3px}.section-title{font-size:15px;font-weight:600;margin:10px 0}footer{font-size:12px;color:var(--ui-muted);line-height:1.5;padding-bottom:20px}@media(min-width:1000px){.gallery{grid-template-columns:repeat(4,minmax(0,1fr))}}@media(max-width:480px){h1{font-size:23px}.gallery{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 10px}.toolbar{gap:8px}.toolbar label{flex:1}select{max-width:100%;font-size:12px}.toolbar .grow{display:none}.config code{overflow-wrap:anywhere}}
</style>
</head>
<body>
<main>
<header><h1>Choose the look for your next deck</h1><p>Compare the original theme and 10 new presets using the same content. Select a thumbnail for a larger view, then switch between slide layouts.</p></header>
<div class="toolbar">
<label>Theme <select id="theme" aria-label="Theme"></select></label>
<label>Slide <select id="layout" aria-label="Slide layout"><option value="cover">Cover</option><option value="process">Process</option><option value="split">Image + explanation</option></select></label>
<span class="grow"></span><button id="previous" aria-label="Previous theme">Previous</button><button id="next" aria-label="Next theme">Next</button>
</div>
<div class="viewer" id="viewer" aria-label="Selected slide preview"></div>
<div class="details"><h2 id="name"></h2><div class="swatches" id="swatches" aria-label="Theme colors"></div></div>
<p id="description" class="hint"></p>
<div class="config"><code id="config"></code><button id="copy">Copy theme setting</button><span id="status" role="status" aria-live="polite"></span></div>
<h2 class="section-title">Compare all themes</h2>
<div class="gallery" id="gallery" aria-label="Theme comparison"></div>
<footer>This page previews the builder's palette, cover geometry, framing, image placement and process direction. The sample illustration is conceptual. PowerPoint remains the final check for font substitution and text wrapping. Choosing here does not save a deck preference or approve a storyboard.</footer>
</main>
<script>
const themes=__THEME_DATA__;
const descriptions={default:'Original palette, red accent and left-hand headline.', 'editorial-cream':'Warm paper, lower-left headline and narrow accent rule.', 'swiss-signal':'Rigid grid, numbered rail and red geometric marker.', 'midnight-lab':'Navy field, cyan corner ticks and a right-hand headline.', 'nord-field':'Cool blue, centered headline and vertical process timeline.', 'botanical-paper':'Sage paper, inset frame and right-hand illustration.', 'bauhaus-study':'Red circle, blue-black bar and a low headline.', 'terminal-mint':'Mint on dark green, status rail and vertical process timeline.', 'rose-archive':'Plum and blush, right-aligned headline and left illustration.', 'amber-dispatch':'Amber masthead, wide headline and bottom-right illustration.', 'cobalt-atlas':'Coordinate ticks, narrow title column and vertical process timeline.'};
const ids=Object.keys(themes),themeSelect=document.querySelector('#theme'),layoutSelect=document.querySelector('#layout');
let selected='default';
const name=id=>id==='default'?'Original default':id.split('-').map(word=>word[0].toUpperCase()+word.slice(1)).join(' ');
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const unit=n=>n*96;
function shape({x,y,w,h,color}){return '<rect x="'+unit(x)+'" y="'+unit(y)+'" width="'+unit(w)+'" height="'+unit(h)+'" fill="#'+color+'"/>'}
function line({x,y,w,h=0,color,width=1,arrow=false}){return '<line x1="'+unit(x)+'" y1="'+unit(y)+'" x2="'+unit(x+w)+'" y2="'+unit(y+h)+'" stroke="#'+color+'" stroke-width="'+(width*4/3)+'"'+(arrow?' marker-end="url(#arrow-'+drawingId+')"':'')+'/>'}
let drawingId=0;
function text({value,x,y,w,h,size=22,color,bold=false,align='left'}){return '<foreignObject x="'+unit(x)+'" y="'+unit(y)+'" width="'+unit(w)+'" height="'+unit(h)+'"><div xmlns="http://www.w3.org/1999/xhtml" style="height:100%;display:flex;align-items:center;justify-content:'+(align==='right'?'flex-end':align==='center'?'center':'flex-start')+';font-family:SF Pro,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;font-size:'+(size*4/3)+'px;line-height:1.15;font-weight:'+(bold?700:400)+';color:#'+color+';text-align:'+align+';white-space:pre-line">'+escape(value)+'</div></foreignObject>'}
function frame(id,t){const accent=t.accent,border=t.border;switch(id){
case 'editorial-cream':return shape({x:.64,y:.22,w:1.3,h:.06,color:accent});
case 'swiss-signal':return shape({x:.3,y:.42,w:.23,h:.23,color:accent})+line({x:1.55,y:.42,w:0,h:6.4,color:border});
case 'midnight-lab':return line({x:.25,y:.25,w:1.1,color:accent,width:2})+line({x:.25,y:.25,w:0,h:.7,color:accent,width:2})+line({x:12,y:7.05,w:1.05,color:accent,width:2});
case 'nord-field':return shape({x:0,y:7.28,w:13.333,h:.22,color:t.surface});
case 'botanical-paper':return '<rect x="28.8" y="26.88" width="1222.08" height="648" fill="none" stroke="#'+border+'" stroke-width="1.33"/>';
case 'bauhaus-study':return '<circle cx="1223" cy="42.24" r="18.24" fill="#'+accent+'"/>'+shape({x:0,y:7.28,w:3.2,h:.22,color:t.primary});
case 'terminal-mint':return shape({x:.25,y:.3,w:.12,h:6.6,color:border})+text({value:'>',x:.52,y:7.02,w:.3,h:.25,size:14,color:accent});
case 'rose-archive':return line({x:.3,y:.3,w:1.4,color:accent,width:3})+line({x:12.95,y:5.8,w:0,h:1.1,color:accent,width:3});
case 'amber-dispatch':return shape({x:0,y:0,w:13.333,h:.18,color:accent});
case 'cobalt-atlas':{let result='';for(let x=.3;x<13.333;x+=.5)result+=line({x,y:7.1,w:0,h:.12,color:border});for(let y=.25;y<6.9;y+=.5)result+=line({x:13.03,y,w:.12,color:border});return result;}
default:return shape({x:0,y:0,w:.12,h:7.5,color:accent});}}
function illustration(t,c){const scale=Math.min(unit(c.w)/430,unit(c.h)/330),x=unit(c.x)+(unit(c.w)-430*scale)/2,y=unit(c.y)+(unit(c.h)-330*scale)/2;
return '<g transform="translate('+x+','+y+') scale('+scale+')"><rect x="70" y="15" width="210" height="265" rx="8" fill="#'+t.surface+'" stroke="#'+t.border+'" stroke-width="2"/><rect x="100" y="52" width="105" height="15" fill="#'+t.accent+'"/><path d="M100 100H248M100 124H230M100 148H248M100 172H210" stroke="#'+t.primary+'" stroke-width="5" opacity=".55"/><rect x="190" y="210" width="210" height="105" rx="8" fill="#'+t.bg+'" stroke="#'+t.accent+'" stroke-width="3"/><circle cx="230" cy="261" r="16" fill="#'+t.accent+'"/><path d="M270 249H365M270 271H340" stroke="#'+t.primary+'" stroke-width="5"/><path d="M298 130H342V190" fill="none" stroke="#'+t.accent+'" stroke-width="4"/><path d="M330 177L342 192L354 177" fill="none" stroke="#'+t.accent+'" stroke-width="4"/></g>';}
function svg(id,layout){drawingId++;const t=themes[id],c=t.cover;let content=shape({x:0,y:0,w:13.333,h:7.5,color:t.bg})+frame(id,t);
if(layout==='cover'){
if(id==='swiss-signal')content+=shape({x:10.8,y:.9,w:1.6,h:.7,color:t.accent});
if(id==='bauhaus-study')content+='<circle cx="153.6" cy="153.6" r="76.8" fill="#'+t.accent+'"/>'+shape({x:3,y:.8,w:.25,h:2,color:t.primary});
if(id==='amber-dispatch')content+=shape({x:.8,y:4.12,w:11.7,h:.07,color:t.accent});
const align=id==='nord-field'?'center':id==='rose-archive'?'right':'left';
content+=text({value:'Dari artikel ke\ncerita visual',x:c.x,y:c.y,w:c.w,h:c.h,size:c.size,bold:true,color:t.primary,align});
content+=text({value:'Satu gagasan. Bukti yang jelas.',x:c.x,y:c.y+c.h+.15,w:c.w,h:.9,size:22,color:t.fg,align});
content+=illustration(t,{x:c.imageX,y:c.imageY,w:c.imageW,h:c.imageH});
}else{
content+=text({value:layout==='process'?'Alur kerja yang bisa ditelusuri':'Visual membantu menjelaskan gagasan',x:.64,y:.43,w:11.65,h:1,size:33,bold:true,color:t.primary});
content+=line({x:.64,y:1.57,w:11.98,color:t.border});
if(layout==='process'){
const steps=['Riset sumber','Setujui alur','Bangun slide','Verifikasi bukti'],vertical=['nord-field','terminal-mint','cobalt-atlas'].includes(id),gap=vertical?.17:.36,width=vertical?11.9:(11.96-gap*3)/4,height=vertical?.82:2.8;
steps.forEach((step,j)=>{const x=vertical?.64:.64+j*(width+gap),y=vertical?1.9+j*(height+gap):2.44;
content+=shape({x,y,w:width,h:height,color:t.surface});
content+=text({value:String(j+1).padStart(2,'0'),x:x+.2,y:y+.12,w:.55,h:.48,size:22,bold:true,color:t.accent});
content+=text({value:step,x:x+(vertical?1:.2),y:y+(vertical?.1:.9),w:width-(vertical?1.2:.4),h:vertical?height-.2:1.6,size:vertical?20:17,color:t.fg});
if(j<3)content+=line(vertical?{x:x+.47,y:y+height,w:0,h:gap,color:t.accent,width:2,arrow:true}:{x:x+width,y:y+height/2,w:gap,color:t.accent,width:2,arrow:true});
});
}else{
const left=['midnight-lab','rose-archive','cobalt-atlas'].includes(id),x=left?7.1:.64;
['Pilih ilustrasi yang relevan','Pertahankan konteks sumber','Simpan atribusi dan referensi'].forEach((value,j)=>{content+=shape({x,y:2.03+j*.75,w:.08,h:.08,color:t.accent})+text({value,x:x+.28,y:1.88+j*.75,w:5.12,h:.7,size:21,color:t.fg});});
content+=illustration(t,{x:left?.64:6.45,y:1.88,w:6.06,h:4.9});
}}
content+=text({value:'01',x:12.2,y:7.05,w:.48,h:.2,size:9,color:t.fg,align:'right'});
return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" role="img" aria-label="'+escape(name(id)+' '+layout+' preview')+'"><defs><marker id="arrow-'+drawingId+'" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5Z" fill="#'+t.accent+'"/></marker></defs>'+content+'</svg>';
}
for(const id of ids){const option=document.createElement('option');option.value=id;option.textContent=name(id);themeSelect.append(option);}
function render(){const t=themes[selected],layout=layoutSelect.value;themeSelect.value=selected;document.querySelector('#viewer').innerHTML=svg(selected,layout);document.querySelector('#name').textContent=name(selected);document.querySelector('#description').textContent=descriptions[selected];document.querySelector('#config').textContent='"theme": '+JSON.stringify({preset:selected});document.querySelector('#swatches').innerHTML=['bg','fg','accent','surface'].map(key=>'<span class="swatch" style="background:#'+t[key]+'" title="'+key+' #'+t[key]+'" aria-label="'+key+' #'+t[key]+'"></span>').join('');document.querySelector('#status').textContent='';
const gallery=document.querySelector('#gallery');gallery.replaceChildren();for(const id of ids){const button=document.createElement('button');button.className='tile';button.type='button';button.setAttribute('aria-pressed',String(selected===id));button.setAttribute('aria-label','Preview '+name(id));button.innerHTML=svg(id,layout)+'<span>'+escape(name(id))+'</span><small>'+escape(id)+'</small>';button.addEventListener('click',()=>{selected=id;render()});gallery.append(button);}}
themeSelect.addEventListener('change',()=>{selected=themeSelect.value;render()});layoutSelect.addEventListener('change',render);
function move(delta){selected=ids[(ids.indexOf(selected)+delta+ids.length)%ids.length];render()}
document.querySelector('#previous').addEventListener('click',()=>move(-1));document.querySelector('#next').addEventListener('click',()=>move(1));
document.querySelector('#copy').addEventListener('click',async()=>{const value=JSON.stringify({theme:{preset:selected}},null,2);try{await navigator.clipboard.writeText(value);document.querySelector('#status').textContent='Theme setting copied.'}catch{document.querySelector('#status').textContent='Select and copy the theme setting above.'}});
render();
</script>
</body>
</html>`;

const output = path.join(skillRoot, 'theme-preview.html');
fs.writeFileSync(output, html.replace('__THEME_DATA__', payload));
process.stdout.write(`Created ${output}\n`);
