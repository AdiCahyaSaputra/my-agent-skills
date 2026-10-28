import type {Storyboard} from './core.js';

export type CoverGeometry = {x:number; y:number; w:number; h:number; size:number; imageX:number; imageY:number; imageW:number; imageH:number};
export type Theme = {primary:string; accent:string; bg:string; fg:string; surface:string; border:string; font:string; cover:CoverGeometry};

export const defaultTheme: Theme = {
  primary:'243A5A', accent:'DC2626', bg:'F8F7F3', fg:'1F2937', surface:'E8ECF1', border:'C7CFD8', font:'SF Pro',
  cover:{x:.64,y:1.6,w:7.2,h:2.2,size:48,imageX:8.1,imageY:1.25,imageW:4.5,imageH:4.95}
};

export const themes = {
  'editorial-cream': {...defaultTheme, primary:'25231F', accent:'9A3412', bg:'F4EFE5', fg:'25231F', surface:'E6DCCB', border:'8A8175', cover:{x:0.8,y:2.4,w:6.6,h:2.3,size:48,imageX:8.2,imageY:1.0,imageW:4.2,imageH:5.5}},
  'swiss-signal': {...defaultTheme, primary:'171717', accent:'B91C1C', bg:'FFFFFF', fg:'171717', surface:'F0F0F0', border:'737373', cover:{x:1.8,y:0.9,w:6.2,h:2.6,size:48,imageX:8.5,imageY:2.0,imageW:4.1,imageH:4.4}},
  'midnight-lab': {...defaultTheme, primary:'E5EDFF', accent:'87BFFF', bg:'151B2B', fg:'E5EDFF', surface:'222E46', border:'627797', cover:{x:5.8,y:1.5,w:6.7,h:2.7,size:45,imageX:0.8,imageY:1.3,imageW:4.4,imageH:4.9}},
  'nord-field': {...defaultTheme, primary:'263648', accent:'285A70', bg:'ECEFF4', fg:'263648', surface:'D8E1EA', border:'8B9BAE', cover:{x:1.0,y:0.65,w:11.3,h:1.7,size:42,imageX:2.3,imageY:3.7,imageW:8.7,imageH:2.7}},
  'botanical-paper': {...defaultTheme, primary:'23372B', accent:'386641', bg:'F0F3E9', fg:'23372B', surface:'DEE7D3', border:'7D9479', cover:{x:1.2,y:1.5,w:6.0,h:2.6,size:44,imageX:8.0,imageY:1.5,imageW:3.9,imageH:4.6}},
  'bauhaus-study': {...defaultTheme, primary:'222222', accent:'A62C22', bg:'FAF4DF', fg:'222222', surface:'ECE2C4', border:'8B8062', cover:{x:0.8,y:3.5,w:7.4,h:1.9,size:44,imageX:8.6,imageY:0.8,imageW:3.6,imageH:3.6}},
  'terminal-mint': {...defaultTheme, primary:'DDF5E9', accent:'75E0AB', bg:'101D19', fg:'DDF5E9', surface:'1B3229', border:'4C7C65', cover:{x:1.5,y:1.25,w:6.0,h:2.8,size:43,imageX:8.1,imageY:1.6,imageW:4.1,imageH:4.7}},
  'rose-archive': {...defaultTheme, primary:'F5EAF2', accent:'EBACC8', bg:'211C2C', fg:'F5EAF2', surface:'362C44', border:'806C8C', cover:{x:6.6,y:2.2,w:5.8,h:2.5,size:43,imageX:0.9,imageY:0.9,imageW:5.0,imageH:5.7}},
  'amber-dispatch': {...defaultTheme, primary:'352819', accent:'9C480C', bg:'FFF6E7', fg:'352819', surface:'F3E4CE', border:'A58D6E', cover:{x:0.8,y:1.2,w:11.7,h:1.8,size:45,imageX:7.8,imageY:4.25,imageW:4.6,imageH:2.3}},
  'cobalt-atlas': {...defaultTheme, primary:'17325C', accent:'254DB4', bg:'EAF0FA', fg:'17325C', surface:'D7E2F5', border:'7C92B4', cover:{x:0.9,y:1.3,w:4.7,h:3.1,size:42,imageX:6.3,imageY:0.9,imageW:6.1,imageH:5.6}},
} satisfies Record<string, Theme>;

export function resolveTheme(input: Storyboard['project']['theme']) {
  const id = input?.preset || 'default';
  let preset: Theme = defaultTheme;

  if (id !== 'default') {
    const match = Object.entries(themes).find(([key]) => key === id);
    if (!match) throw Error(`Unknown theme preset: ${id}`);
    preset = match[1];
  }

  const color = (value: string | undefined, fallback: string) => {
    const result = (value ?? fallback).replace(/^#/, '');
    if (!/^[0-9a-f]{6}$/i.test(result)) throw Error(`Invalid theme color: ${value}`);
    return result;
  };

  return {
    ...preset, id,
    primary:color(input?.primary, preset.primary), accent:color(input?.accent, preset.accent),
    bg:color(input?.background, preset.bg), fg:color(input?.foreground, preset.fg),
    surface:color(input?.surface, preset.surface), border:color(input?.border, preset.border),
    font:input?.fontFace || preset.font
  };
}
