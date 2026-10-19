import fs from 'node:fs';
import {readStoryboard,writeJson} from '../src/core.js';
const d=readStoryboard(process.argv[2]||'storyboard.json');
const issues:{severity:'error'|'warning';code:string;detail:string}[]=[];
const fail=(code:string,detail:string)=>issues.push({severity:'error',code,detail});
const warn=(code:string,detail:string)=>issues.push({severity:'warning',code,detail});
if(!d.project.approved)fail('APPROVAL_REQUIRED','Storyboarding has not been explicitly approved');
if(!fs.existsSync('output/presentation.pptx'))fail('PPTX_MISSING','Build the PPTX before verification');
if(!d.slides.length)fail('EMPTY_DECK','No slides in storyboard');
const claimMap=new Map(d.claims.map(c=>[c.id,c]));const assetMap=new Map(d.assets.map(a=>[a.id,a]));
for(const s of d.slides){
 if(!s.title)fail('MISSING_TITLE',`Slide ${s.id}`);
 if((s.bullets||[]).length>7)warn('DENSE_SLIDE',`${s.id}: more than 7 bullets`);
 if((s.body||'').split(/\s+/).length>55)warn('DENSE_SLIDE',`${s.id}: more than 55 words in body`);
 for(const id of s.claimIds||[]){const c=claimMap.get(id);if(!c){fail('CLAIM_MISSING',`${s.id}: ${id}`);continue;}if(c.status==='contradicted')fail('CLAIM_CONTRADICTED',`${s.id}: ${id}`);else if(c.status!=='verified'||!c.sourceUrl||!c.evidence)fail('CLAIM_UNVERIFIED',`${s.id}: ${id} requires checked source URL and supporting evidence`);}
 if(s.imageId){const a=assetMap.get(s.imageId);if(!a){fail('ASSET_UNKNOWN',`${s.id}: ${s.imageId}`);continue;}if(!a.file||!fs.existsSync(a.file))fail('ASSET_MISSING',`${s.id}: ${s.imageId}`);if(a.origin==='generated'){if(!a.generatedPrompt)warn('GENERATED_PROMPT_MISSING',a.id);}else{if(a.permission!=='allowed')fail('RIGHTS_UNCLEAR',`${a.id}: reuse permission not cleared`);if(!a.sourceUrl||!a.creator||!a.license)fail('PROVENANCE_INCOMPLETE',`${a.id}: source URL, creator, license required`);}}
 }
}
const used=new Set(d.slides.flatMap(s=>s.claimIds||[]));for(const c of d.claims){if(!used.has(c.id))warn('UNUSED_CLAIM',c.id);}
const report={generatedAt:new Date().toISOString(),articleUrl:d.project.articleUrl||null,slideCount:d.slides.length,status:issues.some(x=>x.severity==='error')?'FAIL':issues.length?'PASS_WITH_WARNINGS':'PASS',issues,manualReviewRequired:['Source URLs and evidence must be checked against the original publications by the agent or a human; a verified label alone is not proof.','Open the slide render and inspect text overlap, cropping, legibility, and illustrative accuracy.','Confirm reuse permissions and licenses independently.','Check the generated PPTX does not misrepresent AI illustrations as documentary evidence.']};
writeJson('output/verification-report.json',report);
let md=`# Verification report\n\n**Status:** ${report.status}\n\n**Slides:** ${report.slideCount}\n\n## Issues\n\n`;
md+=issues.length?issues.map(i=>`- **${i.severity.toUpperCase()} / ${i.code}**: ${i.detail}`).join('\n'):'No automated rule violations.';
md+='\n\n## Required independent checks\n\n'+report.manualReviewRequired.map(x=>'- '+x).join('\n')+'\n';
fs.writeFileSync('output/verification-report.md',md);
console.log(`${report.status}: ${issues.length} issues; see output/verification-report.md`);
if(report.status==='FAIL')process.exitCode=1;
