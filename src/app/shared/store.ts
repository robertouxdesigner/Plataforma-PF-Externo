import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AG, BASE, Doc, HIDDEN, HIST, HistEntry, SolRow, buildSol, d, days } from './data';

export interface Status { k: string; t: string }

@Injectable({ providedIn: 'root' })
export class Toasts {
  items = signal<{ id: number; msg: string; kind: string; undo?: () => void }[]>([]);
  private n = 0;
  show(msg: string, kind = 'ok', undo?: () => void) {
    const id = ++this.n;
    this.items.update(l => [...l, { id, msg, kind, undo }]);
    setTimeout(() => this.dismiss(id), undo ? 6000 : 3200);
  }
  dismiss(id: number) { this.items.update(l => l.filter(t => t.id !== id)); }
}

export type ModalKind = 'export' | 'share' | 'qr' | 'valid' | 'more' | 'remove' | 'reval' | 'link' | 'linked' | 'num' | 'third' | 'notif' | 'prefs';

@Injectable({ providedIn: 'root' })
export class Modals {
  kind = signal<ModalKind>('export');
  on = signal(false);
  doc = signal<Doc | null>(null);
  seed = signal('');
  tick = signal(0);
  lastFocus: HTMLElement | null = null;
  open(kind: ModalKind, doc?: Doc, seed = '') {
    if (!this.on()) this.lastFocus = document.activeElement as HTMLElement;
    this.doc.set(doc ?? null);
    this.seed.set(seed);
    this.kind.set(kind);
    this.on.set(true);
    this.tick.update(n => n + 1);
  }
  close() {
    if (!this.on()) return;
    this.on.set(false);
    this.tick.update(n => n + 1);
    const f = this.lastFocus;
    if (f && document.body.contains(f)) f.focus();
  }
}

@Injectable({ providedIn: 'root' })
export class Store {
  private router = inject(Router);
  private toasts = inject(Toasts);
  private modals = inject(Modals);

  docs = signal<Doc[]>(BASE.map(x => ({ ...x })));
  removed = signal<{ doc: Doc; i: number }[]>([]);
  expired = signal(false);
  hidden = signal(new Set<string>());
  cat = signal('Todos');
  st = signal('todos');
  q = signal('');
  viewMode = signal<'cards' | 'lista'>(this.loadView());
  read = signal(false);
  prefs = signal({ n90: true, blk: true, mail: true });

  sol = signal<SolRow[]>(buildSol());
  solQ = signal('');
  solSt = signal<string | null>(null);
  solPage = signal(1);
  solSize = signal(20);
  solSort = signal<string | null>(null);
  solDir = signal(1);

  private loadView(): 'cards' | 'lista' {
    try { return localStorage.getItem('pf-cart-view') === 'lista' ? 'lista' : 'cards'; } catch { return 'cards'; }
  }
  setView(v: 'cards' | 'lista') {
    this.viewMode.set(v);
    try { localStorage.setItem('pf-cart-view', v); } catch { /* sem storage */ }
  }

  view(doc: Doc): Doc {
    return doc.id === 'cr' && this.expired() ? { ...doc, em: '15/03/2024', val: '07/10/2025' } : doc;
  }
  status(doc: Doc): Status {
    doc = this.view(doc);
    if (doc.blocked) return { k: 'lock', t: 'Bloqueado' };
    const n = days(doc.val);
    if (n < 0) return { k: 'bad', t: 'Vencido' };
    if (n <= 30) return { k: 'warn', t: 'Vence em ' + n + ' dias' };
    return { k: 'ok', t: 'Válido' };
  }
  hist(id: string): HistEntry[] {
    const h = HIST[id] ?? [];
    if (id === 'cr' && this.expired())
      return h.slice(1).map((e, i) => (i === 0 ? { ...e, st: 'Vencido', k: 'bad', cur: 0, txt: 'Validade encerrada em 07/10/2025.' } : e));
    return h;
  }

  cartList = computed(() => {
    const q = this.q().trim().toLowerCase(), cat = this.cat(), st = this.st();
    return this.docs().filter(x => {
      const s = this.status(x).k;
      // ocultos aparecem somente no filtro próprio
      if (this.hidden().has(x.id) !== (cat === HIDDEN)) return false;
      if (cat === 'Armas e munições' && x.cat !== 'arma') return false;
      if (cat === 'Viagem' && x.cat !== 'viagem') return false;
      if (st === 'validos' && s !== 'ok') return false;
      if (st === 'atencao' && !(s === 'warn' || s === 'bad')) return false;
      if (st === 'bloqueados' && s !== 'lock') return false;
      if (q && !(x.kind + ' ' + x.name + ' ' + x.num + ' ' + x.short).toLowerCase().includes(q)) return false;
      return true;
    });
  });
  count = (k: string) => this.docs().filter(x => this.status(x).k === k).length;

  solFiltered = computed(() => {
    const st = this.solSt(), q = this.solQ().trim().toLowerCase(), k = this.solSort(), dir = this.solDir();
    let l = this.sol().filter(r => (!st || r.st === st) && (!q || (r.tit + ' ' + r.prot + ' ' + r.desc + ' ' + r.st).toLowerCase().includes(q)));
    if (k) {
      l = [...l].sort((a, b) => {
        let A: string | Date = (a as any)[k], B: string | Date = (b as any)[k];
        if (k === 'dt') { A = d(A as string); B = d(B as string); }
        return (A > B ? 1 : A < B ? -1 : 0) * dir;
      });
    }
    return l;
  });
  solCount = (st: string) => this.sol().filter(r => r.st === st).length;

  notifs() {
    return [
      { k: 'warn', ic: 'clock', t: 'Autorização de aquisição vence em 12 dias', p: 'A AAQ-2026-118204 vale até 26/10/2026. Depois disso, será preciso um novo pedido.', w: 'Hoje, 08:02', id: 'aut' },
      { k: 'lock', ic: 'lock', t: 'CRAF bloqueado', p: 'O CRAF SINARM 2019/118540 foi bloqueado após comunicação de extravio.', w: '12/08/2026', id: 'craf2' },
      { k: 'ok', ic: 'file', t: 'Nova guia na carteira', p: 'A GTE nº 99351026065911 foi emitida e adicionada automaticamente.', w: '09/09/2026', id: 'gte' },
      { k: 'ok', ic: 'file', t: 'Passaporte importado', p: 'Seu passaporte FZ482917 agora aparece na carteira.', w: '01/09/2026', id: 'pass' },
    ];
  }

  copy(text: string, msg: string) {
    const done = () => this.toasts.show(msg);
    try { navigator.clipboard.writeText(text).then(done, () => { this.fallback(text); done(); }); }
    catch { this.fallback(text); done(); }
  }
  private fallback(t: string) {
    try { const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); } catch { /* ignora */ }
  }

  toggleHidden(id: string) {
    this.hidden.update(h => { const n = new Set(h); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  restore(i: number) {
    const [it] = this.removed().slice(i, i + 1);
    this.removed.update(l => l.filter((_, k) => k !== i));
    this.docs.update(l => { const c = [...l]; c.splice(Math.min(it.i, c.length), 0, it.doc); return c; });
    return it.doc;
  }
  removeDoc(x: Doc) {
    const i = this.docs().findIndex(v => v.id === x.id);
    this.docs.update(l => l.filter(v => v.id !== x.id));
    this.removed.update(l => [...l, { doc: x, i }]);
    this.modals.close();
    if (this.router.url !== '/carteira') this.router.navigateByUrl('/carteira');
    this.toasts.show(x.kind + ' removido da carteira', 'ok', () => {
      const k = this.removed().findIndex(r => r.doc === x);
      if (k >= 0) this.removed.update(l => l.filter((_, n) => n !== k));
      this.docs.update(l => { const c = [...l]; c.splice(Math.min(i, c.length), 0, x); return c; });
      this.toasts.show('Documento restaurado');
    });
  }
  openOrigin(x: Doc) {
    this.solQ.set(x.prot ?? ''); this.solSt.set(null); this.solPage.set(1);
    this.modals.close();
    this.router.navigateByUrl('/solicitacoes');
  }
  startReval() {
    this.sol.update(l => [{ tit: 'Revalidação de Certificado de Registro (CR)', desc: 'Rascunho', prot: '2026-0000000094', dt: '14/10/2026', st: AG }, ...l]);
    this.solQ.set(''); this.solSt.set(null); this.solPage.set(1);
    this.modals.close();
    this.router.navigateByUrl('/solicitacoes');
    this.toasts.show('Solicitação 2026-0000000094 criada como rascunho');
  }
  reset() {
    const v = this.viewMode();
    this.docs.set(BASE.map(x => ({ ...x }))); this.removed.set([]); this.expired.set(false); this.hidden.set(new Set());
    this.cat.set('Todos'); this.st.set('todos'); this.q.set(''); this.viewMode.set(v); this.read.set(false);
    this.prefs.set({ n90: true, blk: true, mail: true });
    this.sol.set(buildSol());
    this.solQ.set(''); this.solSt.set(null); this.solPage.set(1); this.solSize.set(20); this.solSort.set(null); this.solDir.set(1);
  }
}
