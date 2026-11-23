import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/icon';
import { Modals, Store, Toasts } from '../shared/store';

@Component({
  selector: 'pf-adicionar',
  imports: [Icon, RouterLink],
  host: { style: 'display:block' },
  template: `
    <nav class="crumb" aria-label="Navegação"><a routerLink="/carteira">Carteira</a><pf-icon name="right" /><span>Adicionar documento</span></nav>
    <h2 class="page-title">Adicionar documento</h2>
    <p class="page-sub">Documentos emitidos pela Plataforma PF entram na carteira automaticamente. Use as opções abaixo para levar a carteira ao celular, buscar um documento pelo número, restaurar um documento removido ou conferir o documento de outra pessoa.</p>
    <div class="opts">
      <button type="button" class="opt" (click)="link()"><span class="ic"><pf-icon name="phone" /></span><b>Vincular celular</b><small>Mostra um QR Code para ler no app PF Digital e sincronizar seus documentos.</small></button>
      <button type="button" class="opt" (click)="modals.open('num')"><span class="ic"><pf-icon name="search" /></span><b>Buscar pelo número</b><small>Informe o número de um documento emitido para o seu CPF.</small></button>
      <button type="button" class="opt" (click)="modals.open('third')"><span class="ic"><pf-icon name="shield" /></span><b>Validar documento de terceiro</b><small>Confira um CR, CRAF ou guia pelo código de validação do QR Code.</small></button>
    </div>
    <h3 class="sec-t">Removidos da carteira</h3>
    @if (s.removed().length) {
      <div class="tscroll" style="margin:0"><table class="dt" style="min-width:560px"><thead><tr><th>Documento</th><th>Número</th><th>Situação</th><th style="text-align:center">Ação</th></tr></thead><tbody>
        @for (r of s.removed(); track r.doc.id; let i = $index) {
          <tr><td><div class="t1">{{ r.doc.name }}</div><div class="t2">{{ r.doc.kind }}</div></td><td class="mono">{{ r.doc.num }}</td>
            <td><span class="tag" [class]="s.status(r.doc).k">{{ s.status(r.doc).t }}</span></td>
            <td style="text-align:center"><button type="button" class="btn out" (click)="restore(i)"><pf-icon name="plus" />Adicionar</button></td></tr>
        }
      </tbody></table></div>
    } @else {
      <div class="panel"><div class="pb" style="color:var(--muted)">Nenhum documento removido. Se você remover um documento, ele aparece aqui para ser adicionado de novo.</div></div>
    }
  `,
})
export class Adicionar {
  s = inject(Store);
  modals = inject(Modals);
  private toast = inject(Toasts);
  link() { this.modals.open('link', undefined, 'vincular' + Date.now()); }
  restore(i: number) { const doc = this.s.restore(i); this.toast.show(doc.kind + ' adicionado à carteira'); }
}
