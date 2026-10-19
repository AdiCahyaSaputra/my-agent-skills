import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import {mkdir,safeHttpUrl,writeJson} from '../src/core.js';
const articleUrl=process.argv[2];
if (!articleUrl){console.error('Usage: npm run research -- https://example.com/article');process.exit(1);}
const u=safeHttpUrl(articleUrl);
const response=await fetch(u,{headers:{'User-Agent':'Mozilla/5.0 (compatible; ArticleToPPTX/1.0)'},signal:AbortSignal.timeout(20000)});
if(!response.ok)throw Error(`Article HTTP ${response.status}`);
const html=await response.text();
const $=cheerio.load(html);
$('script,style,nav,footer,header,aside,form,noscript,iframe').remove();
const title=$('meta[property="og:title"]').attr('content') || $('h1').first().text().trim() || $('title').text().trim();
const description=$('meta[name="description"]').attr('content')||'';
const candidates=['article','main','[role="main"]','.post-content','.entry-content','.article-content'];
let content=$('body');for(const s of candidates){const found=$(s).first();if(found.length&&found.text().trim().length>content.text().trim().length*.20){content=found;break;}}
const paragraphs:string[]=[];
content.find('h1,h2,h3,h4,p,li,blockquote').each((_,el)=>{const str=$(el).text().replace(/\s+/g,' ').trim();if(str.length>20&& !paragraphs.includes(str))paragraphs.push(str);});
const images:{url:string;alt:string;caption:string;origin:string;permission:string}[]=[];
content.find('img').each((_,el)=>{const raw=$(el).attr('data-src')||$(el).attr('src')||$(el).attr('data-lazy-src');if(!raw)return;try{const im=new URL(raw,u).toString();if(!im.startsWith('http'))return;images.push({url:im,alt:$(el).attr('alt')||'',caption:$(el).closest('figure').find('figcaption').text().trim(),origin:'original',permission:'needs-review'});}catch{}});
mkdir('research');
fs.writeFileSync('research/article.md',`# ${title}\n\nSource: ${articleUrl}\n\n${description}\n\n${paragraphs.join('\n\n')}\n`);
writeJson('research/image-candidates.json',images);
writeJson('research/article-metadata.json',{title,description,url:articleUrl,fetchedAt:new Date().toISOString(),paragraphCount:paragraphs.length,imageCount:images.length});
console.log(`Extracted ${paragraphs.length} text blocks, ${images.length} images. Review research/article.md and candidate images; do not assume any usage rights.`);
