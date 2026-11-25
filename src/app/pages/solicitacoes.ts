import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AG, CO, EA, SolRow } from '../shared/data';
import { Icon } from '../shared/icon';
import { Store, Toasts } from '../shared/store';

@Component({
  selector: 'pf-solicitacoes',
  imports: [Icon, RouterLink],
  host: { style: 'display:block' },
  template: `
    <div class="msg" style="background:var(--side-hover);color:var(--side-on)"><pf-icon name="wallet" /><span class="t"><b>Novo:</b> os documentos emitidos para você agora ficam reunidos na <b>Carteira</b>.</span><a class="lnk" href="#" (click)="$event.preventDefault(); drawer = true">Abrir carteira</a></div>
    @if (drawer) {
      <div class="drawer-scrim" (click)="drawer = false"></div>
      <aside class="drawer" role="dialog" aria-label="Carteira">
        <div class="drawer-head"><h2 class="page-title">Carteira</h2><button type="button" class="ab" aria-label="Fechar" (click)="drawer = false"><pf-icon name="x" /></button></div>
        <p>Os documentos emitidos para você ficam reunidos na Carteira.</p>
        <a class="btn" routerLink="/carteira" (click)="drawer = false">Ir para a Carteira</a>
      </aside>
    }
    <h2 class="page-title" style="margin-top:14px">Portal de Solicitações</h2>
    <div class="cstats three">
      <button type="button" class="cstat k-all" [class.sel]="s.solSt() === AG" [attr.aria-pressed]="s.solSt() === AG" (click)="toggle(AG)"><span class="h">MINHAS PENDÊNCIAS</span><span class="b"><span class="n">{{ s.solCount(AG) }}</span><span class="l">solicitações pendentes de ação</span></span></button>
      <button type="button" class="cstat k-proc" [class.sel]="s.solSt() === EA" [attr.aria-pressed]="s.solSt() === EA" (click)="toggle(EA)"><span class="h">EM PROCESSAMENTO</span><span class="b"><span class="n">{{ s.solCount(EA) }}</span><span class="l">solicitações dependentes da <b>PF</b></span></span></button>
      <button type="button" class="cstat k-ok" [class.sel]="s.solSt() === CO" [attr.aria-pressed]="s.solSt() === CO" (click)="toggle(CO)"><span class="h">FINALIZADAS</span><span class="b"><span class="n">{{ s.solCount(CO) }}</span><span class="l">solicitações concluídas</span></span></button>
    </div>
    <div class="searchbar">
      <div class="sgroup"><h2>Minhas solicitações</h2>
        <input class="inp" type="search" placeholder="Buscar por nome ou protocolo" maxlength="100" [value]="s.solQ()" (input)="search($event)" aria-label="Buscar solicitações"></div>
      <button type="button" class="btn" (click)="toast.show('Abrindo catálogo de serviços para nova solicitação…', 'info')"><img src="carteira/plus.svg" width="18" height="18" alt="">Iniciar nova solicitação</button></div>
    <div class="tscroll"><table class="dt"><thead><tr>
      @for (c of cols; track c[0]) {
        <th class="s" (click)="sort(c[0])" [attr.aria-sort]="s.solSort() === c[0] ? (s.solDir() > 0 ? 'ascending' : 'descending') : 'none'">{{ c[1] }}<span class="si"><pf-icon name="sort" /></span></th>
      }
      <th style="text-align:center">Ações</th></tr></thead>
      <tbody>
        @for (r of rows(); track r.prot) {
          <tr><td><div class="t1">{{ r.tit }}</div><div class="t2">{{ r.desc }}</div></td><td class="mono">{{ r.prot }}</td><td class="mono">{{ r.dt }}</td>
            <td><span class="tag" [class.warning]="r.st === AG" [class.info]="r.st === EA" [class.success]="r.st === CO">{{ r.st }}</span></td>
            <td><div class="acts">
              @if (r.st === AG) {
                <button type="button" class="ab" title="Editar" aria-label="Editar" (click)="toast.show('Abrindo edição da solicitação ' + r.prot + '…', 'info')"><pf-icon name="pencil" /></button>
              }
              <button type="button" class="ab" title="Visualizar" aria-label="Visualizar" (click)="toast.show('Abrindo solicitação ' + r.prot + '…', 'info')"><pf-icon name="search" /></button>
              @if (r.doc) {
                <a class="ab" title="Ver documento na carteira" aria-label="Ver documento na carteira" [routerLink]="docLink(r)"><pf-icon name="wallet" /></a>
              } @else {
                <button type="button" class="ab" title="Imprimir" aria-label="Imprimir" disabled><pf-icon name="print" /></button>
              }
            </div></td></tr>
        } @empty {
          <tr><td colspan="5" class="empty">Nenhum resultado foi encontrado</td></tr>
        }
      </tbody></table></div>
    <div class="pager">
      <select aria-label="Itens por página" (change)="size($event)">
        @for (n of [10, 20, 50]; track n) { <option [selected]="n === s.solSize()">{{ n }}</option> }
      </select>
      <span>Exibindo {{ total() ? (page() - 1) * s.solSize() + 1 : 0 }} a {{ Math.min(page() * s.solSize(), total()) }} de {{ total() }} solicitações</span>
      <button type="button" [disabled]="page() === 1" (click)="go(1)" aria-label="Primeira página">«</button>
      <button type="button" [disabled]="page() === 1" (click)="go(page() - 1)" aria-label="Anterior">‹</button>
      @for (i of nums(); track i) { <button type="button" [class.on]="i === page()" (click)="go(i)" [attr.aria-label]="'Página ' + i">{{ i }}</button> }
      <button type="button" [disabled]="page() === pages()" (click)="go(page() + 1)" aria-label="Próxima">›</button>
      <button type="button" [disabled]="page() === pages()" (click)="go(pages())" aria-label="Última página">»</button>
    </div>
  `,
})
export class Solicitacoes {
  drawer = false;
  s = inject(Store);
  toast = inject(Toasts);
  Math = Math;
  AG = AG; EA = EA; CO = CO;
  cols: [string, string][] = [['tit', 'Solicitação'], ['prot', 'Protocolo'], ['dt', 'Data da solicitação'], ['st', 'Status']];
  pend = computed(() => this.s.sol().filter(r => r.desc === 'Pendência na documentação'));
  total = computed(() => this.s.solFiltered().length);
  pages = computed(() => Math.max(1, Math.ceil(this.total() / this.s.solSize())));
  page = computed(() => Math.min(this.s.solPage(), this.pages()));
  rows = computed(() => this.s.solFiltered().slice((this.page() - 1) * this.s.solSize(), this.page() * this.s.solSize()));
  nums = computed(() => {
    const p = this.page(), n = this.pages(), from = Math.max(1, Math.min(p - 2, n - 4)), to = Math.min(n, from + 4);
    return Array.from({ length: to - from + 1 }, (_, i) => from + i);
  });

  toggle(st: string) { this.s.solSt.set(this.s.solSt() === st ? null : st); this.s.solPage.set(1); }
  sort(k: string) {
    if (this.s.solSort() === k) this.s.solDir.update(d => d * -1);
    else { this.s.solSort.set(k); this.s.solDir.set(1); }
  }
  search(e: Event) { this.s.solQ.set((e.target as HTMLInputElement).value); this.s.solPage.set(1); }
  size(e: Event) { this.s.solSize.set(+(e.target as HTMLSelectElement).value); this.s.solPage.set(1); }
  go(p: number) { this.s.solPage.set(p); }
  docLink(r: SolRow) { return this.s.docs().some(x => x.id === r.doc) ? ['/documento', r.doc] : ['/carteira']; }
}
