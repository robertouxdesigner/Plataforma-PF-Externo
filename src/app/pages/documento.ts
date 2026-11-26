import { Component, OnDestroy, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { codeOf, days, typeIcon } from '../shared/data';
import { Icon } from '../shared/icon';
import { Paper } from '../shared/paper';
import { Modals, Store } from '../shared/store';

@Component({
  selector: 'pf-documento',
  imports: [Icon, Paper, RouterLink],
  host: { style: 'display:block' },
  template: `
    @if (x(); as x) {
      <nav class="crumb" aria-label="Navegação"><a routerLink="/carteira">Carteira</a><img src="documento/crumb.svg" width="18" height="18" alt=""><span>{{ x.name }}</span></nav>
      @if (st().k === 'bad' && x.id === 'cr') {
        <div class="msg bad"><pf-icon name="alert" /><span class="t"><b>Este CR está vencido desde {{ v().val }}.</b> O documento não comprova mais o registro. Solicite a revalidação para continuar com as atividades autorizadas.</span><button type="button" class="btn danger" (click)="modals.open('reval')">Solicitar revalidação</button></div>
      }
      @if (st().k === 'warn') {
        <div class="msg"><pf-icon name="clock" /><span class="t">Este documento vence em {{ days(v().val) }} dias ({{ v().val }}).</span></div>
      }
      @if (x.blocked) {
        <div class="msg lock"><pf-icon name="lock" /><span class="t"><b>Documento bloqueado pela PF.</b> Comunicação de extravio em 12/08/2026. Procure a unidade da PF para regularizar.</span></div>
      }
      <div class="dochead" [class.is-hidden]="oculto()">
        <div class="dtitle">
          <div class="line"><h1>{{ x.kind }}</h1><span class="tag" [class]="st().k">{{ st().t }}</span></div>
          <span class="mono num">Nº {{ x.num }}</span>
        </div>
        <div class="dbtns">
          <a class="btn out" routerLink="/carteira"><img src="documento/back.svg" width="18" height="18" alt="">Voltar</a>
          @if (!oculto()) { <button type="button" class="btn out" (click)="modals.open('more', x)" aria-label="Mais opções"><img src="documento/more.svg" width="18" height="18" alt=""></button> }
        </div>
      </div>
      <div class="dgrid">
        <div class="dpaper">
          @if (oculto()) {
            <p class="hidden-msg" role="status">Documento oculto da sua lista de carteiras.<br>Clique em <button type="button" (click)="s.toggleHidden(x.id)">“Mostrar documento”</button> para exibi-lo novamente.</p>
            <div class="faded" aria-hidden="true" inert><pf-paper [doc]="x" /></div>
          } @else {
            <pf-paper [doc]="x" />
          }
        </div>
        <div>
          <div class="panel"><h4>Ações</h4><div class="pb acts4">
            <button type="button" class="act" (click)="modals.open('export', x)"><img src="documento/export.svg" width="22" height="22" alt="">Exportar</button>
            <button type="button" class="act" (click)="s.copy(x.num, 'Número do documento copiado')"><img src="documento/copy.svg" width="22" height="22" alt="">Copiar número</button>
            @if (x.prot) { <button type="button" class="act" (click)="s.openOrigin(x)"><img src="documento/origin.svg" width="22" height="22" alt="">Ver solicitação de Origem</button> }
            <button type="button" class="act" [attr.aria-pressed]="oculto()" (click)="s.toggleHidden(x.id)">@if (oculto()) { <img src="documento/eye.svg" width="22" height="22" alt=""> } @else { <img src="documento/eye-off.svg" width="22" height="22" alt=""> }{{ oculto() ? 'Mostrar documento' : 'Ocultar documento' }}</button></div></div>
          <div class="panel"><h4>Informações</h4><div class="pb" style="padding-block:4px">
            <div class="kv"><span>Emissão</span><b class="mono">{{ v().em }}</b></div><div class="kv"><span>Validade</span><b class="mono">{{ v().val }}</b></div>
            @for (f of x.fields; track f[0]) { <div class="kv"><span>{{ f[0] }}</span><b>{{ f[1] }}</b></div> }
            <div class="kv"><span>Origem</span><b>{{ x.integ ? 'Integração · sistema de passaportes' : 'Emitido pela Plataforma PF' }}</b></div>
            @if (x.prot) { <div class="kv"><span>Solicitação de origem</span><b><button type="button" class="lnk mono" (click)="s.openOrigin(x)">{{ x.prot }}</button></b></div> }</div></div>
        </div>
      </div>
    }
  `,
})
export class Documento implements OnDestroy {
  id = input.required<string>();
  s = inject(Store);
  modals = inject(Modals);
  private router = inject(Router);
  oculto = computed(() => this.s.hidden().has(this.id()));
  days = days;
  typeIcon = typeIcon;

  x = computed(() => this.s.docs().find(d => d.id === this.id()));
  v = computed(() => this.s.view(this.x()!));
  st = computed(() => this.s.status(this.x()!));
  hs = computed(() => this.s.hist(this.id()));
  code = computed(() => codeOf(this.x()!));
  salt = signal('');
  seed = computed(() => this.code() + this.salt());
  pct = signal(100);
  noTrans = signal(false);
  private t = 60;
  private timer = setInterval(() => {
    this.t--;
    this.pct.set((this.t / 60) * 100);
    if (this.t <= 0) {
      this.t = 60;
      this.salt.set(String(Math.random()));
      this.noTrans.set(true);
      this.pct.set(100);
      requestAnimationFrame(() => this.noTrans.set(false));
    }
  }, 1000);

  constructor() {
    effect(() => { if (!this.x()) this.router.navigateByUrl('/carteira'); });
  }
  ngOnDestroy() { clearInterval(this.timer); }
}
