import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BASE, typeIcon } from '../shared/data';
import { Icon } from '../shared/icon';
import { Store, Toasts } from '../shared/store';

@Component({
  selector: 'pf-historico',
  imports: [Icon, RouterLink],
  host: { style: 'display:block' },
  template: `
    @if (x(); as x) {
      <nav class="crumb" aria-label="Navegação"><a routerLink="/carteira">Carteira</a><pf-icon name="right" />
        @if (inWallet()) { <a [routerLink]="['/documento', x.id]">{{ x.name }}</a><pf-icon name="right" /> }
        <span>Histórico</span></nav>
      <div class="dhead"><span class="ty"><pf-icon [name]="typeIcon(x)" /></span><div class="tt"><h1>Histórico · {{ x.kind }}</h1><span class="mono">Nº {{ x.num }}</span></div>
        <span class="tag" [class]="st().k">{{ st().t }}</span>
        <div class="hb">
          @if (inWallet()) { <a class="btn out" [routerLink]="['/documento', x.id]"><pf-icon name="back" />Voltar ao documento</a> }
          @else { <a class="btn out" routerLink="/carteira"><pf-icon name="back" />Voltar</a> }
        </div></div>
      <div class="hsum">
        <div class="stat"><div class="h">ÚLTIMA ATUALIZAÇÃO</div><div class="b" style="padding-block:14px"><div class="n mono" style="font-size:22px;margin:0">{{ hs()[0]?.when ?? '—' }}</div></div></div>
        <div class="stat"><div class="h">REGISTROS</div><div class="b" style="padding-block:14px"><div class="n" style="font-size:22px;margin:0">{{ hs().length }}</div></div></div>
        <div class="stat"><div class="h">DOCUMENTOS ANEXOS</div><div class="b" style="padding-block:14px"><div class="n" style="font-size:22px;margin:0">{{ anexos() }}</div></div></div>
      </div>
      @if (id() === 'cr' && s.expired()) {
        <div class="msg bad"><pf-icon name="alert" /><span class="t"><b>Nenhum CR vigente.</b> O último CR venceu em 07/10/2025.</span></div>
      }
      <div class="tl">
        @for (e of hs(); track e.t; let i = $index) {
          <div class="ti" [class.cur]="e.cur" [class.blk]="e.blk" [class.open]="open().has(i)">
            <button type="button" (click)="toggle(i)" [attr.aria-expanded]="open().has(i)"><div class="tt"><b>{{ e.t }}</b><small class="mono">{{ e.when }} · Protocolo {{ e.prot }}</small></div><span class="tag" [class]="e.k">{{ e.st }}</span><pf-icon name="chev" /></button>
            <div class="tbd"><p>{{ e.txt }}</p>
              @for (dd of e.docs; track dd[0]) {
                <button type="button" class="docrow" (click)="toast.show('Download iniciado: ' + dd[0] + '.pdf')"><span class="fi">PDF</span><div>{{ dd[0] }}<small>{{ dd[1] }}</small></div><pf-icon name="export" /></button>
              } @empty { <p>Sem documentos anexos.</p> }
            </div>
          </div>
        }
      </div>
    }
  `,
})
export class Historico {
  id = input.required<string>();
  s = inject(Store);
  toast = inject(Toasts);
  private router = inject(Router);
  typeIcon = typeIcon;
  open = signal(new Set<number>([0]));

  x = computed(() => this.s.docs().find(d => d.id === this.id()) ?? BASE.find(d => d.id === this.id()));
  inWallet = computed(() => this.s.docs().some(d => d.id === this.id()));
  st = computed(() => this.s.status(this.x()!));
  hs = computed(() => this.s.hist(this.id()));
  anexos = computed(() => this.hs().reduce((a, e) => a + e.docs.length, 0));

  constructor() {
    effect(() => { this.id(); this.open.set(new Set([0])); });
    effect(() => { if (!this.x()) this.router.navigateByUrl('/carteira'); });
  }
  toggle(i: number) {
    this.open.update(o => { const n = new Set(o); n.has(i) ? n.delete(i) : n.add(i); return n; });
  }
}
