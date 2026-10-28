import fs from 'node:fs';
import path from 'node:path';
import pptxgen from 'pptxgenjs';
import {readStoryboard, assertApproved, mkdir, type Slide} from '../src/core.js';
import {resolveTheme} from '../src/themes.js';

const d = readStoryboard(process.argv[2] || 'storyboard.json');
assertApproved(d);

const T = resolveTheme(d.project.theme);
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Article to PPTX skill';
pptx.subject = d.project.articleUrl || 'Source-first illustrative presentation';
pptx.title = d.project.title;
pptx.theme = {headFontFace:T.font, bodyFontFace:T.font};

const W = 13.333, H = 7.5, M = .64;
const imgById = new Map(d.assets.map(a => [a.id, a]));
type Page = ReturnType<typeof pptx.addSlide>;
type TextOptions = Parameters<Page['addText']>[1];

function text(sl: Page, {value, x, y, w, h, size = 22, bold = false, color = T.fg, ...opts}: {
  value:string; x:number; y:number; w:number; h:number; size?:number; bold?:boolean; color?:string;
} & TextOptions) {
  sl.addText(value, {x,y,w,h,fontFace:T.font,fontSize:size,bold,color,margin:0,fit:'shrink',valign:'middle',lang:'id-ID',...opts});
}

function rect(sl: Page, {x,y,w,h,color = T.accent}: {x:number;y:number;w:number;h:number;color?:string}) {
  sl.addShape(pptx.ShapeType.rect, {x,y,w,h,line:{color,transparency:100},fill:{color}});
}

function line(sl: Page, {x,y,w,h = 0,color = T.border,width = 1,arrow = false}: {
  x:number;y:number;w:number;h?:number;color?:string;width?:number;arrow?:boolean;
}) {
  sl.addShape(pptx.ShapeType.line, {x,y,w,h,line:{color,width,...(arrow ? {endArrowType:'triangle'} : {})}});
}

function frame(sl: Page) {
  switch (T.id) {
    case 'editorial-cream': rect(sl,{x:M,y:.22,w:1.3,h:.06}); break;
    case 'swiss-signal':
      rect(sl,{x:.3,y:.42,w:.23,h:.23});
      line(sl,{x:1.55,y:.42,w:0,h:6.4});
      break;
    case 'midnight-lab':
      line(sl,{x:.25,y:.25,w:1.1,color:T.accent,width:2});
      line(sl,{x:.25,y:.25,w:0,h:.7,color:T.accent,width:2});
      line(sl,{x:12,y:7.05,w:1.05,color:T.accent,width:2});
      break;
    case 'nord-field': rect(sl,{x:0,y:7.28,w:W,h:.22,color:T.surface}); break;
    case 'botanical-paper':
      sl.addShape(pptx.ShapeType.rect,{x:.3,y:.28,w:12.73,h:6.75,fill:{color:T.bg,transparency:100},line:{color:T.border,width:1}});
      break;
    case 'bauhaus-study':
      sl.addShape(pptx.ShapeType.ellipse,{x:12.55,y:.25,w:.38,h:.38,line:{transparency:100},fill:{color:T.accent}});
      rect(sl,{x:0,y:7.28,w:3.2,h:.22,color:T.primary});
      break;
    case 'terminal-mint':
      rect(sl,{x:.25,y:.3,w:.12,h:6.6,color:T.border});
      text(sl,{value:'>',x:.52,y:7.02,w:.3,h:.25,size:14,color:T.accent});
      break;
    case 'rose-archive':
      line(sl,{x:.3,y:.3,w:1.4,color:T.accent,width:3});
      line(sl,{x:12.95,y:5.8,w:0,h:1.1,color:T.accent,width:3});
      break;
    case 'amber-dispatch': rect(sl,{x:0,y:0,w:W,h:.18}); break;
    case 'cobalt-atlas':
      for (let x=.3;x<W;x+=.5) line(sl,{x,y:7.1,w:0,h:.12});
      for (let y=.25;y<6.9;y+=.5) line(sl,{x:13.03,y,w:.12});
      break;
    default: rect(sl,{x:0,y:0,w:.12,h:H});
  }
}

function base(sl: Page, {slide,index}: {slide:Slide;index:number}) {
  sl.background = {color:T.bg};
  frame(sl);
  text(sl,{value:String(index+1).padStart(2,'0'),x:12.2,y:7.05,w:.48,h:.2,size:9,color:T.fg,align:'right'});

  const needsTitle = slide.type !== 'cover' && slide.type !== 'closing';
  if (needsTitle) {
    text(sl,{value:slide.title,x:M,y:.43,w:11.65,h:1,size:33,bold:true,color:T.primary});
    line(sl,{x:M,y:1.57,w:11.98});
  }
}

function bullets(sl: Page, {lines,x,y,w,h,size = 21}: {lines:string[];x:number;y:number;w:number;h:number;size?:number}) {
  if (!lines.length) return;

  const height = Math.min(.75,h/lines.length);
  lines.slice(0,7).forEach((value,i) => {
    rect(sl,{x,y:y+i*height+.15,w:.08,h:.08});
    text(sl,{value,x:x+.28,y:y+i*height,w:w-.28,h:height-.05,size});
  });
}

function image(sl: Page, {id,x,y,w,h}: {id:string|undefined;x:number;y:number;w:number;h:number}) {
  if (!id) return false;

  const a = imgById.get(id);
  if (!a?.file || !fs.existsSync(a.file)) throw Error(`Missing image file: ${id}`);

  sl.addImage({path:path.resolve(a.file),x,y,w,h,sizing:{type:'contain',w,h}});
  return true;
}

function notes(s: Slide) {
  const refs = (s.claimIds || []).map(id => {
    const claim = d.claims.find(c => c.id === id);
    return claim ? `Claim ${id}: ${claim.sourceUrl || 'UNVERIFIED'}` : `Claim ${id}: missing`;
  });

  if (s.imageId) refs.push(`Image ${s.imageId}: ${imgById.get(s.imageId)?.sourceUrl || 'generated / source missing'}`);

  return [s.speakerNotes || '',...refs].filter(Boolean).join('\n');
}

function cover(sl: Page, s: Slide) {
  const c = T.cover;
  if (T.id === 'swiss-signal') rect(sl,{x:10.8,y:.9,w:1.6,h:.7});
  if (T.id === 'bauhaus-study') {
    sl.addShape(pptx.ShapeType.ellipse,{x:.8,y:.8,w:1.6,h:1.6,line:{transparency:100},fill:{color:T.accent}});
    rect(sl,{x:3,y:.8,w:.25,h:2,color:T.primary});
  }
  if (T.id === 'amber-dispatch') rect(sl,{x:.8,y:4.12,w:11.7,h:.07});

  const align = T.id === 'nord-field' ? 'center' : T.id === 'rose-archive' ? 'right' : 'left';
  text(sl,{value:s.title,x:c.x,y:c.y,w:c.w,h:c.h,size:c.size,bold:true,color:T.primary,align});
  if (s.subtitle) text(sl,{value:s.subtitle,x:c.x,y:c.y+c.h+.15,w:c.w,h:.9,size:22,align});

  image(sl,{id:s.imageId,x:c.imageX,y:c.imageY,w:c.imageW,h:c.imageH});
}

function processSlide(sl: Page, s: Slide) {
  const steps = (s.steps || []).slice(0,5);
  if (!steps.length) throw Error(`Process slide requires steps: ${s.id}`);

  const vertical = ['nord-field','terminal-mint','cobalt-atlas'].includes(T.id);
  const gap = vertical ? .17 : .36;
  const width = vertical ? 11.9 : (11.96-gap*(steps.length-1))/steps.length;
  const height = vertical ? Math.min(.82,(4.8-gap*(steps.length-1))/steps.length) : 2.8;

  steps.forEach((step,j) => {
    const x = vertical ? M : M+j*(width+gap);
    const y = vertical ? 1.9+j*(height+gap) : 2.44;
    rect(sl,{x,y,w:width,h:height,color:T.surface});
    text(sl,{value:String(j+1).padStart(2,'0'),x:x+.2,y:y+.12,w:.55,h:.48,size:22,bold:true,color:T.accent});
    text(sl,{value:step,x:x+(vertical ? 1 : .2),y:y+(vertical ? .1 : .9),w:width-(vertical ? 1.2 : .4),h:vertical ? height-.2 : 1.6,size:vertical ? 20 : Math.max(15,21-steps.length)});

    if (j < steps.length-1) {
      line(sl,vertical ? {x:x+.47,y:y+height,w:0,h:gap,color:T.accent,width:2,arrow:true}
        : {x:x+width,y:y+height/2,w:gap,h:0,color:T.accent,width:2,arrow:true});
    }
  });
}

for (const [index,s] of d.slides.entries()) {
  const sl = pptx.addSlide();
  base(sl,{slide:s,index});

  switch (s.type) {
    case 'cover': cover(sl,s); break;
    case 'closing':
      text(sl,{value:s.title,x:M,y:2,w:12,h:1.5,size:46,bold:true,color:T.primary,align:'center'});
      if (s.subtitle) text(sl,{value:s.subtitle,x:1.2,y:4,w:10.9,h:.9,size:22,align:'center'});
      break;
    case 'image':
      if (!image(sl,{id:s.imageId,x:M,y:1.83,w:12.05,h:4.93})) throw Error(`Image slide requires imageId: ${s.id}`);
      if (s.subtitle) text(sl,{value:s.subtitle,x:M,y:6.84,w:11.9,h:.24,size:13});
      break;
    case 'split': {
      if (s.imageId) {
        const imageLeft = ['midnight-lab','rose-archive','cobalt-atlas'].includes(T.id);
        bullets(sl,{lines:s.bullets || [],x:imageLeft ? 7.1 : M,y:1.88,w:5.4,h:4.9});
        image(sl,{id:s.imageId,x:imageLeft ? M : 6.45,y:1.88,w:6.06,h:4.9});
      } else {
        bullets(sl,{lines:s.left || s.bullets || [],x:M,y:1.88,w:5.75,h:4.9});
        bullets(sl,{lines:s.right || [],x:7,y:1.88,w:5.65,h:4.9});
      }
      break;
    }
    case 'process': processSlide(sl,s); break;
    case 'comparison':
      if (s.subtitle) text(sl,{value:s.subtitle,x:M,y:1.85,w:12,h:.5,size:18});
      bullets(sl,{lines:s.left || [],x:M,y:2.62,w:5.6,h:3.7});
      line(sl,{x:6.58,y:2.3,w:0,h:3.94,width:2});
      bullets(sl,{lines:s.right || [],x:7.03,y:2.62,w:5.5,h:3.7});
      break;
    case 'quote':
      text(sl,{value:'“',x:M,y:1.8,w:2,h:1.2,size:88,bold:true,color:T.accent});
      text(sl,{value:s.quote || s.body || '',x:1.6,y:2.35,w:10.3,h:2.4,size:31,bold:true,color:T.primary});
      if (s.subtitle) text(sl,{value:s.subtitle,x:1.6,y:5.45,w:10,h:.55,size:16});
      break;
    case 'statement':
      if (s.imageId) {
        text(sl,{value:s.body || s.subtitle || '',x:M,y:2.05,w:5.3,h:3.9,size:27,bold:true});
        image(sl,{id:s.imageId,x:6.45,y:1.85,w:6.05,h:4.8});
      } else {
        if (s.body) text(sl,{value:s.body,x:M,y:2.2,w:11.8,h:2.1,size:31,bold:true});
        bullets(sl,{lines:s.bullets || [],x:M,y:4.45,w:11.2,h:2.1,size:20});
      }
      break;
    default: {
      const unsupported: never = s.type;
      throw Error(`Unsupported slide type: ${unsupported}`);
    }
  }

  const note = notes(s);
  if (note) sl.addNotes(note);
}

mkdir('output');
await pptx.writeFile({fileName:'output/presentation.pptx'});
process.stdout.write(`Created output/presentation.pptx (${d.slides.length} slides, theme ${T.id})\n`);
