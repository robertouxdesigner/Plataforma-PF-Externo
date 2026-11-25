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
      <nav class="crumb" aria-label="Navegação"><a routerLink="/carteira">Carteira</a><pf-icon name="right" /><span>{{ x.name }}</span></nav>
      @if (st().k === 'bad' && x.id === 'cr') {
        <div class="msg bad"><pf-icon name="alert" /><span class="t"><b>Este CR está vencido desde {{ v().val }}.</b> O documento não comprova mais o registro. Solicite a revalidação para continuar com as atividades autorizadas.</span><button type="button" class="btn danger" (click)="modals.open('reval')">Solicitar revalidação</button></div>
      }
      @if (st().k === 'warn') {
        <div class="msg"><pf-icon name="clock" /><span class="t">Este documento vence em {{ days(v().val) }} dias ({{ v().val }}).</span></div>
      }
      @if (x.blocked) {
        <div class="msg lock"><pf-icon name="lock" /><span class="t"><b>Documento bloqueado pela PF.</b> Comunicação de extravio em 12/08/2026. Procure a unidade da PF para regularizar.</span></div>
      }
      <div class="dhead" style="margin-top:14px">
        <span class="tag" [class]="st().k">{{ st().t }}</span>
        <div class="tt"><h1>{{ x.kind }}</h1><span class="mono">Nº {{ x.num }}</span></div>
        <a class="btn out" routerLink="/carteira"><pf-icon name="back" />Voltar</a>
        <div class="hb">
          <button type="button" class="btn" (click)="modals.open('export', x)"><pf-icon name="export" />Exportar</button>
          <button type="button" class="btn out" (click)="modals.open('more', x)" aria-label="Mais opções"><pf-icon name="more" /></button></div>
      </div>
      <div class="dgrid">
        <div class="dpaper">@if (!oculto()) { <pf-paper [doc]="x" /> } @else { <p class="small">Documento oculto. Use “Mostrar documento” para exibi-lo novamente.</p> }</div>
        <div>
          <div class="panel"><h4>Ações</h4><div class="pb acts4">
            <button type="button" class="act" (click)="modals.open('export', x)"><pf-icon name="export" />Exportar</button>
            <button type="button" class="act" (click)="s.copy(x.num, 'Número do documento copiado')"><pf-icon name="copy" />Copiar número</button>
            @if (x.prot) { <button type="button" class="act" (click)="s.openOrigin(x)"><pf-icon name="file" />Ver solicitação de Origem</button> }
            <button type="button" class="act" [attr.aria-pressed]="oculto()" (click)="oculto.set(!oculto())"><pf-icon [name]="oculto() ? 'eye' : 'eyeoff'" />{{ oculto() ? 'Mostrar documento' : 'Ocultar documento' }}</button></div></div>
          <div class="panel"><h4>Informações</h4><div class="pb" style="padding-block:4px">
            <div class="kv"><span>Emissão</span><b class="mono">{{ v().em }}</b></div><div class="kv"><span>Validade</span><b class="mono">{{ v().val }}</b></div>
            @for (f of x.fields; track f[0]) { <div class="kv"><span>{{ f[0] }}</span><b>{{ f[1] }}</b></div> }
            <div class="kv"><span>Origem</span><b>{{ x.integ ? 'Integração · sistema de passaportes' : 'Emitido pela Plataforma PF' }}</b></div>
            @if (x.prot) { <div class="kv"><span>Solicitação de origem</span><b><button type="button" class="lnk mono" (click)="s.openOrigin(x)">{{ x.prot }}</button></b></div> }</div></div>
          <button type="button" class="rmv" (click)="modals.open('remove', x)"><pf-icon name="trash" />Remover da carteira</button>
          <p class="small">Remover tira o documento só da sua carteira (portal e app). Ele continua válido na Polícia Federal.</p>
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
  oculto = signal(false);
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
