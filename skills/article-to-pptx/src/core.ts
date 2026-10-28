import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';

export type Asset = {id:string; url?:string; file?:string; origin:'original'|'external'|'generated'; creator?:string; sourceUrl?:string; license?:string; permission?:'allowed'|'needs-review'|'denied'; alt?:string; generatedPrompt?:string};
export type Claim = {id:string; text:string; sourceUrl?:string; evidence?:string; status?:'verified'|'unverified'|'contradicted'};
export type Slide = {id:string; type:'cover'|'statement'|'split'|'image'|'process'|'comparison'|'quote'|'closing'; title:string; subtitle?:string; bullets?:string[]; body?:string; left?:string[]; right?:string[]; steps?:string[]; quote?:string; imageId?:string; claimIds?:string[]; sourceIds?:string[]; speakerNotes?:string};
export type Storyboard = {project:{title:string; articleUrl?:string; audience:string; objective:string; approved:boolean; approvedAt?:string; aspectRatio?:'LAYOUT_WIDE'; theme?:{preset?:string; surface?:string; border?:string; primary?:string; accent?:string; background?:string; foreground?:string; fontFace?:string}}; assets:Asset[]; claims:Claim[]; slides:Slide[]};
export const root = process.cwd();
export function readStoryboard(file='storyboard.json'):Storyboard { const d=JSON.parse(fs.readFileSync(file,'utf8')); if (!d.project || !Array.isArray(d.slides)||!Array.isArray(d.assets)||!Array.isArray(d.claims)) throw Error('Invalid storyboard: requires project, slides, assets, claims'); return d; }
export function mkdir(p:string){fs.mkdirSync(p,{recursive:true});}
export function writeJson(p:string,d:unknown){mkdir(path.dirname(p));fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');}
export function assertApproved(d:Storyboard){if (d.project.approved !== true) throw Error('Stage 1 approval gate: set project.approved=true ONLY after the user explicitly approves the research brief/storyboard.');}
export function safeHttpUrl(url:string){const u=new URL(url);if(!['http:','https:'].includes(u.protocol))throw Error('Only HTTP(S) URLs supported'); const h=u.hostname.toLowerCase(); if(h==='localhost'||h.endsWith('.local')||h.endsWith('.internal')||net.isIP(h)&&(/^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(h)||h==='::1'||h.startsWith('fc')||h.startsWith('fd')))throw Error('Local/private URL disallowed');return u;}
export function filename(id:string){return id.replace(/[^a-z0-9_-]/gi,'_');}
