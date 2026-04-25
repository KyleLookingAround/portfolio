import type { CustomMetaQuest } from '../types';

interface TrailWire {
  v: 1;
  t: string;
  e?: string;
  m: string[];
}

function toBase64Url(s: string): string {
  // btoa only accepts latin-1 — UTF-8 encode first so emoji and accents survive.
  const bytes = new TextEncoder().encode(s);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): string {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4;
  const binary = atob(pad ? padded + '='.repeat(4 - pad) : padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeTrail(c: Pick<CustomMetaQuest, 'title' | 'emoji' | 'memberQuestIds'>): string {
  const wire: TrailWire = { v: 1, t: c.title, m: c.memberQuestIds };
  if (c.emoji) wire.e = c.emoji;
  return toBase64Url(JSON.stringify(wire));
}

export function decodeTrail(s: string): TrailWire | null {
  try {
    const parsed: unknown = JSON.parse(fromBase64Url(s));
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      (parsed as TrailWire).v !== 1 ||
      typeof (parsed as TrailWire).t !== 'string' ||
      !Array.isArray((parsed as TrailWire).m) ||
      !(parsed as TrailWire).m.every(id => typeof id === 'string')
    ) {
      return null;
    }
    return parsed as TrailWire;
  } catch {
    return null;
  }
}

export function buildShareUrl(
  c: Pick<CustomMetaQuest, 'title' | 'emoji' | 'memberQuestIds'>
): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${window.location.origin}${base}#/import-trail?d=${encodeTrail(c)}`;
}
