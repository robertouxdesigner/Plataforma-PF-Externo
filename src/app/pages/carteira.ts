import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CPF, days, typeIcon } from '../shared/data';
import { Icon } from '../shared/icon';
import { Paper } from '../shared/paper';
import { Modals, Store } from '../shared/store';

@Component({
  selector: 'pf-carteira',
  imports: [Icon, Paper, RouterLink],
  host: { style: 'display:block' },
  template: `
    @let cr = crDoc();
    @if (cr && s.status(cr).k === 'bad') {
      <div class="msg bad"><pf-icon name="alert" /><span class="t"><b>Seu CR está vencido desde 07/10/2025.</b> Os CRAFs e guias vinculados podem perder a validade.</span><a class="lnk" routerLink="/documento/cr">Ver CR</a></div>
    }
    @for (x of warn(); track x.id) {
      <div class="msg"><pf-icon name="clock" /><span class="t">O documento {{ x.kind }} nº {{ x.num }} vence em {{ days(s.view(x).val) }} dias ({{ s.view(x).val }}).</span><a class="lnk" [routerLink]="['/documento', x.id]">Ver documento</a></div>
    }
    @for (x of locked(); track x.id) {
      <div class="msg lock"><pf-icon name="lock" /><span class="t">O {{ x.short }} nº {{ x.num }} está bloqueado pela PF. Procure a unidade da PF para regularizar.</span><a class="lnk" [routerLink]="['/documento', x.id]">Ver documento</a></div>
    }
    <div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap;margin-top:14px">
      <div style="flex:1;min-width:240px"><h2 class="page-title">Carteira</h2><p class="page-sub">Documentos emitidos pela Polícia Federal para o CPF <span class="mono">{{ cpf }}</span>. Eles também aparecem no app PF Digital.</p></div>
      <div style="display:flex;gap:8px">
        <button type="button" class="btn out bell" (click)="notif()"><pf-icon name="bell" />Avisos@if (unread()) {<span class="bd">{{ unread() }}</span>}</button>
        <button type="button" class="btn out" (click)="modals.open('prefs')"><pf-icon name="gear" />Preferências</button>
      </div>
    </div>
    <div class="stats" style="margin-top:8px">
      <button type="button" class="stat" [class.sel]="s.st() === 'todos'" [attr.aria-pressed]="s.st() === 'todos'" (click)="s.st.set('todos')"><div class="h">TODOS OS DOCUMENTOS</div><div class="b"><div class="n">{{ s.docs().length }}</div><div class="l">documentos na carteira</div></div></button>
      <button type="button" class="stat k-ok" [class.sel]="s.st() === 'validos'" [attr.aria-pressed]="s.st() === 'validos'" (click)="s.st.set('validos')"><div class="h">VÁLIDOS</div><div class="b"><div class="n">{{ s.count('ok') }}</div><div class="l">documentos em vigor</div></div></button>
      <button type="button" class="stat k-warn" [class.sel]="s.st() === 'atencao'" [attr.aria-pressed]="s.st() === 'atencao'" (click)="s.st.set('atencao')"><div class="h">PRECISAM DE ATENÇÃO</div><div class="b"><div class="n">{{ s.count('warn') + s.count('bad') }}</div><div class="l">vencidos ou a vencer em 30 dias</div></div></button>
      <button type="button" class="stat k-lock" [class.sel]="s.st() === 'bloqueados'" [attr.aria-pressed]="s.st() === 'bloqueados'" (click)="s.st.set('bloqueados')"><div class="h">BLOQUEADOS</div><div class="b"><div class="n">{{ s.count('lock') }}</div><div class="l">bloqueados pela <b>PF</b></div></div></button>
    </div>
    <div class="tbar"><h2>Meus documentos</h2>
      <input class="inp" type="search" placeholder="Buscar por nome ou número" [value]="s.q()" (input)="s.q.set(val($event))" aria-label="Buscar documentos">
      <span class="grow"></span>
      <div class="seg" role="group" aria-label="Modo de exibição">
        <button type="button" [class.on]="s.viewMode() === 'cards'" [attr.aria-pressed]="s.viewMode() === 'cards'" (click)="s.setView('cards')"><pf-icon name="grid" />Cartões</button>
        <button type="button" [class.on]="s.viewMode() === 'lista'" [attr.aria-pressed]="s.viewMode() === 'lista'" (click)="s.setView('lista')"><pf-icon name="list" />Lista</button>
      </div>
      <a class="btn" routerLink="/adicionar"><pf-icon name="plus" />Adicionar documento</a></div>
    <div class="chips">
      @for (c of cats; track c) { <button type="button" class="chip" [class.on]="s.cat() === c" [attr.aria-pressed]="s.cat() === c" (click)="s.cat.set(c)">{{ c }}</button> }
    </div>

    @if (!s.cartList().length) {
      <div class="empty">Nenhum documento encontrado com esses filtros.<br><button type="button" class="lnk" style="margin-top:8px" (click)="clear()">Limpar filtros</button></div>
    } @else if (s.viewMode() === 'cards') {
      <div class="grid">
        @for (x of s.cartList(); track x.id) {
          <article class="dcard">
            <a class="dpeek" [routerLink]="['/documento', x.id]" [attr.aria-label]="'Visualizar ' + x.kind + ' nº ' + x.num"><div class="sc"><pf-paper [doc]="x" /></div><span class="go">Visualizar documento</span></a>
            <div class="dbody"><small>{{ x.short }}</small><b>{{ x.name }}</b><span class="mono">Nº {{ x.num }}</span>
              <div class="dmeta"><span class="tag" [class]="s.status(x).k">{{ s.status(x).t }}</span><span>Validade: <span class="mono">{{ s.view(x).val }}</span></span>@if (x.integ) {<span class="integ">Integração</span>}</div></div>
            <div class="dacts">
              <button type="button" (click)="modals.open('export', x)"><pf-icon name="export" />Exportar</button>
              <button type="button" (click)="modals.open('qr', x)"><pf-icon name="qr" />QR Code</button>
              <button type="button" (click)="modals.open('more', x)" aria-label="Mais opções"><pf-icon name="more" /></button>
            </div>
          </article>
        }
        <a class="dcard add" routerLink="/adicionar"><span class="pl"><pf-icon name="plus" /></span><b>Adicionar documento</b><small>Vincular o celular, buscar pelo número ou restaurar documentos removidos</small></a>
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
              <button type="button" class="ab" title="Remover da carteira" aria-label="Remover da carteira" (click)="modals.open('remove', x)"><pf-icon name="trash" /></button>
            </div></td></tr>
        }
      </tbody></table></div>
    }
    <div class="notebar">Exibindo {{ s.cartList().length }} de {{ s.docs().length }} documentos.
      @if (s.removed().length) { {{ s.removed().length }} {{ s.removed().length === 1 ? 'documento removido' : 'documentos removidos' }} da carteira. <a class="lnk" routerLink="/adicionar" style="text-decoration:underline">Adicionar novamente</a> }
    </div>
  `,
})
export class Carteira {
  s = inject(Store);
  modals = inject(Modals);
  cpf = CPF;
  days = days;
  typeIcon = typeIcon;
  cats = ['Todos', 'Armas e munições', 'Viagem'];
  crDoc = computed(() => this.s.docs().find(x => x.id === 'cr'));
  warn = computed(() => this.s.docs().filter(x => this.s.status(x).k === 'warn'));
  locked = computed(() => this.s.docs().filter(x => this.s.status(x).k === 'lock'));
  unread = computed(() => (this.s.read() ? 0 : 3));
  val(e: Event) { return (e.target as HTMLInputElement).value; }
  clear() { this.s.q.set(''); this.s.cat.set('Todos'); this.s.st.set('todos'); }
  notif() { this.modals.open('notif', undefined, this.s.read() ? 'read' : 'unread'); this.s.read.set(true); }
}
