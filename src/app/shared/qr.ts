import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

export function qrSvg(seed: string): string {
  const N = 25;
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  h = h || 7;
  const rnd = () => { h ^= h << 13; h >>>= 0; h ^= h >> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
  let r = '';
  const fp = (x: number, y: number) =>
    `<rect x="${x}" y="${y}" width="7" height="7" fill="#0d1626"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#0d1626"/>`;
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const inF = (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
      if (!inF && rnd() > 0.52) r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="#0d1626"/>`;
    }
  r += fp(0, 0) + fp(N - 7, 0) + fp(0, N - 7) + `<rect x="10" y="10" width="5" height="5" fill="#fff"/><image href="logo.png" x="10.5" y="10.3" width="4" height="4.4"/>`;
  return `<svg viewBox="0 0 ${N} ${N}" width="100%" height="100%" shape-rendering="crispEdges" role="img" aria-label="QR Code"><rect width="${N}" height="${N}" fill="#fff"/>${r}</svg>`;
}

@Component({
  selector: 'pf-qr',
  host: { '[innerHTML]': 'html()', style: 'display:block;width:100%;height:100%' },
  template: '',
})
export class Qr {
  seed = input.required<string>();
  private s = inject(DomSanitizer);
  html = computed(() => this.s.bypassSecurityTrustHtml(qrSvg(this.seed())));
}
