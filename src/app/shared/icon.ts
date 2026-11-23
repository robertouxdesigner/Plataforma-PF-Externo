import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

const I = (p: string, w = 1.8) =>
  `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;

export const ICON: Record<string, string> = {
  file: I('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/>'),
  wallet: I('<path d="M4 7a2 2 0 012-2h11v3"/><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 13.5h2.5"/>'),
  export: I('<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 14v6h14v-6"/>'),
  hist: I('<path d="M3 12a9 9 0 103-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>'),
  qr: I('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v7h-4M14 21v-3"/>'),
  copy: I('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3"/>'),
  shield: I('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>'),
  mail: I('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'),
  pdf: I('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M12 11v6M9 14l3 3 3-3"/>'),
  img: I('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>'),
  link: I('<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>'),
  trash: I('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
  alert: I('<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>', 2),
  clock: I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', 2),
  lock: I('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>'),
  ok: I('<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>', 2),
  check: I('<path d="M5 12l5 5L20 7"/>', 2.4),
  search: I('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', 2),
  pencil: I('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>'),
  print: I('<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>'),
  plus: I('<path d="M12 5v14M5 12h14"/>', 2.2),
  more: I('<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>', 2.4),
  x: I('<path d="M6 6l12 12M18 6L6 18"/>', 2.2),
  menu: I('<path d="M4 6h16M4 12h16M4 18h16"/>', 2),
  back: I('<path d="M15 18l-6-6 6-6"/>', 2),
  right: I('<path d="M9 6l6 6-6 6"/>', 2),
  chev: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
  sort: I('<path d="M8 4v16M4 8l4-4 4 4M16 20V4M12 16l4 4 4-4"/>', 1.6),
  grid: I('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'),
  list: I('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>', 2.2),
  bell: I('<path d="M6 16V11a6 6 0 1112 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 004 0"/>'),
  gear: I('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>', 1.5),
  phone: I('<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>'),
  cr: I('<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="11" r="2"/><path d="M5.5 16c.6-1.6 1.7-2.3 3-2.3s2.4.7 3 2.3M14 10h4M14 13h4"/>'),
  craf: I('<path d="M3 9h15l2-2h1v4h-4l-1 2h-3l-1 5H8l1-5H5L3 11z"/>'),
  gte: I('<path d="M3 17h2l1-5h9l3 3v2h-2"/><circle cx="7.5" cy="17.5" r="1.7"/><circle cx="16.5" cy="17.5" r="1.7"/><path d="M9.5 17.5h5M6 12V7h7v5"/>'),
  aut: I('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M10 15l2 2 4-4"/>'),
  pass: I('<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10" r="3.2"/><path d="M9 17h6"/>'),
};

@Component({
  selector: 'pf-icon',
  host: { '[innerHTML]': 'html()', style: 'display:contents' },
  template: '',
})
export class Icon {
  name = input.required<string>();
  private s = inject(DomSanitizer);
  html = computed(() => this.s.bypassSecurityTrustHtml(ICON[this.name()] ?? ''));
}
