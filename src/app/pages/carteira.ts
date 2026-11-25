import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CPF, HIDDEN } from '../shared/data';
import { Icon } from '../shared/icon';
import { Modals, Store, Toasts } from '../shared/store';

@Component({
  selector: 'pf-carteira',
  imports: [Icon, RouterLink],
  host: { style: 'display:block' },
  template: `
    @let cr = crDoc();
    @if (cr && s.status(cr).k === 'bad') {
      <div class="msg bad"><pf-icon name="alert" /><span class="t"><b>Seu CR está vencido desde 07/10/2025.</b> Os CRAFs e guias vinculados podem perder a validade.</span><a class="lnk" routerLink="/documento/cr">Ver CR</a></div>
    }
    @for (x of locked(); track x.id) {
      <div class="msg lock"><img src="carteira/lock.svg" width="18" height="18" alt=""><span class="t">O {{ x.short }} nº {{ x.num }} está bloqueado pela PF. Procure a unidade da PF para regularizar.</span><a class="lnk" [routerLink]="['/documento', x.id]">Ver documento</a></div>
    }
    <div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap;margin-top:14px">
      <div style="flex:1;min-width:240px"><h2 class="page-title">Carteira</h2><p class="page-sub">Documentos emitidos pela Polícia Federal para o CPF <span class="mono">{{ cpf }}</span>. Eles também aparecem no app PF Digital.</p></div>
      <div style="display:flex;gap:8px">
        <button type="button" class="btn out bell" (click)="notif()"><img src="carteira/bell.svg" width="18" height="18" alt="">Avisos@if (unread()) {<span class="bd">{{ unread() }}</span>}</button>
      </div>
    </div>
    <div class="cstats">
      <button type="button" class="cstat k-all" [class.sel]="s.st() === 'todos'" [attr.aria-pressed]="s.st() === 'todos'" (click)="s.st.set('todos')"><span class="h">MINHAS PENDÊNCIAS</span><span class="b"><span class="n">{{ s.docs().length }}</span><span class="l">solicitações pendentes<br>de ação</span></span></button>
      <button type="button" class="cstat k-ok" [class.sel]="s.st() === 'validos'" [attr.aria-pressed]="s.st() === 'validos'" (click)="s.st.set('validos')"><span class="h">VÁLIDOS</span><span class="b"><span class="n">{{ s.count('ok') }}</span><span class="l">Documentos em vigor</span></span></button>
      <button type="button" class="cstat k-warn" [class.sel]="s.st() === 'atencao'" [attr.aria-pressed]="s.st() === 'atencao'" (click)="s.st.set('atencao')"><span class="h">PRECISAM DE ATENÇÃO</span><span class="b"><span class="n">{{ s.count('warn') + s.count('bad') }}</span><span class="l">Vencidos ou a vencer<br>em 30 dias</span></span></button>
      <button type="button" class="cstat k-lock" [class.sel]="s.st() === 'bloqueados'" [attr.aria-pressed]="s.st() === 'bloqueados'" (click)="s.st.set('bloqueados')"><span class="h">PRECISAM DE ATENÇÃO</span><span class="b"><span class="n">{{ s.count('lock') }}</span><span class="l">bloqueados<br>pela PF</span></span></button>
    </div>
    <div class="tbar"><h2>Meus documentos</h2>
      <input class="inp" type="search" placeholder="Buscar por nome ou número" [value]="s.q()" (input)="s.q.set(val($event))" aria-label="Buscar documentos">
      <span class="grow"></span>
      <a class="btn" routerLink="/adicionar"><img src="carteira/plus.svg" width="18" height="18" alt="">Adicionar documento</a></div>
    <p class="filter-label">Filtro:</p>
    <div class="filter-row">
      <div class="chips">
        @for (c of cats; track c) { <button type="button" class="chip" [class.on]="s.cat() === c" [attr.aria-pressed]="s.cat() === c" (click)="s.cat.set(c)">{{ c }}</button> }
      </div>
        <div class="seg" role="group" aria-label="Modo de exibição">
          <button type="button" [class.on]="s.viewMode() === 'cards'" [attr.aria-pressed]="s.viewMode() === 'cards'" (click)="s.setView('cards')"><img src="carteira/grid.svg" width="18" height="18" alt="">Cartões</button>
          <button type="button" [class.on]="s.viewMode() === 'lista'" [attr.aria-pressed]="s.viewMode() === 'lista'" (click)="s.setView('lista')"><img src="carteira/list.svg" width="18" height="18" alt="">Lista</button>
        </div>
    </div>

    @if (!s.cartList().length) {
      <div class="empty">{{ s.cat() === HIDDEN && !s.hidden().size ? 'Nenhuma carteira oculta.' : 'Nenhum documento encontrado com esses filtros.' }}<br><button type="button" class="lnk" style="margin-top:8px" (click)="clear()">Limpar filtros</button></div>
    } @else if (s.viewMode() === 'cards') {
      <div class="cgrid">
        @for (x of s.cartList(); track x.id) {
          <article class="ccard">
            <div class="cbody">
              <a class="cart" [routerLink]="['/documento', x.id]" [attr.aria-label]="'Visualizar ' + x.kind + ' nº ' + x.num">
                <img class="shield" src="carteira/shield.svg" width="209.794" height="129.205" alt="">
                <img class="idc" src="carteira/id-card.svg" width="43" height="30.8297" alt="">
                <img class="shield on-hover" src="carteira/shield-hover.svg" width="209.781" height="129.203" alt="">
                <img class="idc on-hover" src="carteira/id-card-hover.svg" width="43" height="30.8281" alt="">
                <span class="pill" [class]="s.status(x).k">{{ s.status(x).t }}</span>
              </a>
              <small>{{ x.short }}</small>
              <b>{{ x.name }}</b>
              <span class="mono num">Nº {{ x.num }}</span>
              <span class="valid">Validade: <span class="mono">{{ s.view(x).val }}</span></span>
            </div>
            <img class="line" src="carteira/line.svg" width="288" height="1" alt="">
            <div class="cacts">
              <button type="button" (click)="modals.open('export', x)"><span class="up"><img src="carteira/upload.svg" width="11.6499" height="11.6667" alt=""></span>Exportar</button>
              <button type="button" class="more" (click)="modals.open('more', x, 'card')" aria-label="Mais opções"><img src="carteira/more.svg" width="15" height="15" alt=""></button>
            </div>
          </article>
        }
      </div>
    } @else {
      <div class="tscroll"><table class="dt"><thead><tr><th>Documento</th><th>Número</th><th>Emissão</th><th>Validade</th><th>Situação</th><th style="text-align:center">Ações</th></tr></thead><tbody>
        @for (x of s.cartList(); track x.id) {
          <tr><td><div class="t1">{{ x.name }}</div><div class="t2">{{ x.kind }}{{ x.integ ? ' · Integração' : '' }}</div></td><td class="mono">{{ x.num }}</td><td class="mono">{{ s.view(x).em }}</td><td class="mono">{{ s.view(x).val }}</td>
            <td><span class="tag" [class]="s.status(x).k">{{ s.status(x).t }}</span></td>
            <td><div class="acts">
              <a class="ab" title="Visualizar" aria-label="Visualizar" [routerLink]="['/documento', x.id]"><pf-icon name="search" /></a>
              <button type="button" class="ab" title="Exportar" aria-label="Exportar" (click)="modals.open('export', x)"><pf-icon name="export" /></button>
              <button type="button" class="ab" title="QR Code" aria-label="QR Code" (click)="modals.open('qr', x)"><pf-icon name="qr" /></button>
              <a class="ab" title="Histórico" aria-label="Histórico" [routerLink]="['/historico', x.id]"><pf-icon name="hist" /></a>
              @if (s.hidden().has(x.id)) {
                <button type="button" class="ab" title="Reexibir Carteira" aria-label="Reexibir Carteira" (click)="reshow(x.id)"><pf-icon name="eye" /></button>
              }
              <button type="button" class="ab" title="Remover da carteira" aria-label="Remover da carteira" (click)="modals.open('remove', x)"><pf-icon name="trash" /></button>
            </div></td></tr>
        }
      </tbody></table></div>
    }
  `,
})
export class Carteira {
  s = inject(Store);
  modals = inject(Modals);
  cpf = CPF;
  HIDDEN = HIDDEN;
  cats = ['Todos', 'Armas e munições', 'Viagem', HIDDEN];
  crDoc = computed(() => this.s.docs().find(x => x.id === 'cr'));
  locked = computed(() => this.s.docs().filter(x => this.s.status(x).k === 'lock'));
  unread = computed(() => (this.s.read() ? 0 : 3));
  private toast = inject(Toasts);
  reshow(id: string) { this.s.toggleHidden(id); this.toast.show('Carteira reexibida'); }
  val(e: Event) { return (e.target as HTMLInputElement).value; }
  clear() { this.s.q.set(''); this.s.cat.set('Todos'); this.s.st.set('todos'); }
  notif() { this.modals.open('notif', undefined, this.s.read() ? 'read' : 'unread'); this.s.read.set(true); }
}
