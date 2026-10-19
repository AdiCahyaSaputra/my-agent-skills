import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {readStoryboard,mkdir,writeJson,safeHttpUrl,filename} from '../src/core.js';
const d=readStoryboard(process.argv[2]||'storyboard.json');mkdir('assets');
const logs=[];
for(const a of d.assets){
 if(a.origin==='generated'&&!a.file){logs.push({id:a.id,status:'missing-generated-image',note:'Use an image generation tool to create this illustration, save its path, and label it generated.'});continue;}
 if(a.file){logs.push({id:a.id,status:fs.existsSync(a.file)?'local-ok':'missing-local',file:a.file});continue;}
 if(!a.url){logs.push({id:a.id,status:'missing-url'});continue;}
 if(a.permission!=='allowed'){logs.push({id:a.id,status:'rights-not-cleared',note:'Only download after permission/reuse status is approved.'});continue;}
 try{
  safeHttpUrl(a.url);
  const res=await fetch(a.url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(20000)});
  if(!res.ok)throw Error(`HTTP ${res.status}`);
  if(!String(res.headers.get('content-type')).startsWith('image/'))throw Error('Not an image');
  const bytes=Buffer.from(await res.arrayBuffer());if(bytes.length>15_000_000)throw Error('Image exceeds 15 MB');
  const dest=path.join('assets',`${filename(a.id)}.png`);
  await sharp(bytes).rotate().png().toFile(dest);a.file=dest;
  logs.push({id:a.id,status:'downloaded',file:dest});
 }catch(e){logs.push({id:a.id,status:'error',reason:String(e)});}
}
writeJson('storyboard.json',d);writeJson('output/asset-log.json',logs);
console.log(logs);
