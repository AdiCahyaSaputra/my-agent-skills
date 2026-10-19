import fs from 'node:fs';
import path from 'node:path';
import pptxgen from 'pptxgenjs';
import {readStoryboard,assertApproved,mkdir,Slide,Asset} from '../src/core.js';
const d=readStoryboard(process.argv[2]||'storyboard.json');assertApproved(d);
const pptx=new pptxgen();pptx.layout='LAYOUT_WIDE';pptx.author='Article to PPTX skill';pptx.subject=d.project.articleUrl||'Source-first illustrative presentation';pptx.title=d.project.title;pptx.lang='en-US';
const T={primary:d.project.theme?.primary||'243A5A',accent:d.project.theme?.accent||'DC2626',bg:d.project.theme?.background||'F8F7F3',fg:d.project.theme?.foreground||'1F2937',font:d.project.theme?.fontFace||'SF Pro'};
pptx.theme={headFontFace:T.font,bodyFontFace:T.font,lang:'en-US'};
const W=13.333,H=7.5,M=.64;
const imgById=new Map<string,Asset>(d.assets.map(a=>[a.id,a]));
function text(sl:any,value:string,x:number,y:number,w:number,h:number,size=22,bold=false,color=T.fg,opts:any={}){sl.addText(value,{x,y,w,h,fontFace:T.font,fontSize:size,bold,color,margin:0,breakLine:false,fit:'shrink',valign:'mid',...opts});}
function base(sl:any,slide:Slide,index:number){sl.background={color:T.bg};sl.addShape(pptx.ShapeType.rect,{x:0,y:0,w:.12,h:H,line:{color:T.accent},fill:{color:T.accent}});text(sl,String(index+1).padStart(2,'0'),12.2,7.05,.48,.20,9,false,'697586',{align:'right'});if(slide.type!=='cover'&&slide.type!=='closing'){text(sl,slide.title,M,.43,12,1.0,33,true,T.primary);sl.addShape(pptx.ShapeType.line,{x:M,y:1.57,w:11.98,h:0,line:{color:'D6D9DE',width:1}});}}
function bullets(sl:any,lines:string[],x:number,y:number,w:number,h:number,size=21){if(!lines.length)return;const height=Math.min(.75,h/lines.length);lines.slice(0,7).forEach((s,i)=>{sl.addShape(pptx.ShapeType.ellipse,{x,y:y+i*height+.13,w:.11,h:.11,line:{color:T.accent},fill:{color:T.accent}});text(sl,s,x+.28,y+i*height,w-.28,height-.05,size);});}
function image(sl:any,id:string|undefined,x:number,y:number,w:number,h:number){if(!id)return false;const a=imgById.get(id);if(!a?.file||!fs.existsSync(a.file))return false;sl.addImage({path:path.resolve(a.file),x,y,w,h,sizingContain:true});return true;}
function notes(s:Slide){const refs=[...(s.claimIds||[]).map(id=>{const c=d.claims.find(x=>x.id===id);return c?`Claim ${id}: ${c.sourceUrl||'UNVERIFIED'}`:`Claim ${id}: missing`;}),...(s.imageId?[`Image ${s.imageId}: ${imgById.get(s.imageId)?.sourceUrl||'generated / source missing'}`]:[])];return [s.speakerNotes||'',...refs].filter(Boolean).join('\n');}
for(let i=0;i<d.slides.length;i++){
 const s=d.slides[i],sl=pptx.addSlide();base(sl,s,i);
 const bodyY=1.88;
 switch(s.type){
 case 'cover': text(sl,s.title,M,1.6,7.2,2.2,48,true,T.primary);if(s.subtitle)text(sl,s.subtitle,M,4.1,7,1,23);image(sl,s.imageId,8.1,1.25,4.5,4.95);break;
 case 'closing':text(sl,s.title,M,2,12,1.5,46,true,T.primary,{align:'center'});if(s.subtitle)text(sl,s.subtitle,1.2,4,10.9,.9,22,false,T.fg,{align:'center'});break;
 case 'image':if(!image(sl,s.imageId,M,1.83,12.05,4.93))text(sl,'[Visual missing: '+(s.imageId||'no image ID')+']',M,2,11,3,20,false,'B45309');if(s.subtitle)text(sl,s.subtitle,M,6.84,11.9,.24,13);break;
 case 'split':if(s.imageId){bullets(sl,s.bullets||[],M,bodyY,5.4,4.9);if(!image(sl,s.imageId,6.45,bodyY,6.06,4.9))text(sl,'[Image pending]',7,3,4,1,18);}else{bullets(sl,s.left||s.bullets||[],M,bodyY,5.75,4.9);bullets(sl,s.right||[],7,bodyY,5.65,4.9);}break;
 case 'process':{const steps=(s.steps||[]).slice(0,5);if(!steps.length)throw Error('process slide requires steps: '+s.id);const gap=.16,width=(11.96-gap*(steps.length-1))/steps.length;steps.forEach((step,j)=>{const x=M+j*(width+gap);sl.addShape(pptx.ShapeType.roundRect,{x,y:2.44,w:width,h:2.8,rectRadius:.1,fill:{color:'E8ECF1'},line:{color:'D5DCE5',width:1}});text(sl,String(j+1).padStart(2,'0'),x+.24,2.7,width-.4,.55,24,true,T.accent);text(sl,step,x+.24,3.38,width-.48,1.35,Math.max(15,21-steps.length));});break;}
 case 'comparison':text(sl,s.subtitle||'Comparison',M,1.85,12,.5,18);bullets(sl,s.left||[],M,2.62,5.6,3.7);sl.addShape(pptx.ShapeType.line,{x:6.58,y:2.3,w:0,h:3.94,line:{color:'C7CFD8',width:2}});bullets(sl,s.right||[],7.03,2.62,5.5,3.7);break;
 case 'quote':text(sl,'“',M,1.8,2,1.2,88,true,T.accent);text(sl,s.quote||s.body||'',1.6,2.35,10.3,2.4,31,true,T.primary);if(s.subtitle)text(sl,s.subtitle,1.6,5.45,10,.55,16);break;
 default:if(s.imageId){text(sl,s.body||s.subtitle||'',M,2.05,5.3,3.9,27,true);image(sl,s.imageId,6.45,1.85,6.05,4.8);}else{if(s.body)text(sl,s.body,M,2.2,11.8,2.1,31,true);bullets(sl,s.bullets||[],M,4.05,11.2,2.35,20);}
 }
 const note=notes(s);if(note)sl.addNotes(note);
}
mkdir('output');await pptx.writeFile({fileName:'output/presentation.pptx'});console.log(`Created output/presentation.pptx (${d.slides.length} slides)`);
