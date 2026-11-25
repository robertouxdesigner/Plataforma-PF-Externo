import { NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, computed, effect, inject, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EMAIL, codeOf } from './data';
import { Icon } from './icon';
import { Qr } from './qr';
import { Modals, Store, Toasts } from './store';

const SMALL = ['share', 'qr', 'valid', 'remove', 'reval', 'link', 'linked', 'num', 'prefs'];

@Component({
  selector: 'pf-modal-host',
  imports: [Icon, Qr, NgTemplateOutlet, RouterLink],
  template: `
    <ng-template #hdr let-t><div class="mh"><h3 id="m-title">{{ t }}</h3><button type="button" class="x" (click)="m.close()" aria-label="Fechar"><pf-icon name="x" /></button></div></ng-template>
    <ng-template #opt let-ic="ic" let-t="t" let-sub="s" let-fn="fn"><button type="button" class="mopt" (click)="fn()"><span class="ic"><pf-icon [name]="ic" /></span><div><b>{{ t }}</b><small>{{ sub }}</small></div><pf-icon name="right" /></button></ng-template>

    <div class="scrim" [class.on]="m.on()" (click)="backdrop($event)">
      <div class="modal" [class.sm]="small()" role="dialog" aria-modal="true" aria-labelledby="m-title">
        @let x = m.doc();
        @switch (m.kind()) {
          @case ('export') {
            @if (x) {
              <ng-container *ngTemplateOutlet="hdr; context: { $implicit: 'Exportar documento' }" />
              <div class="mb"><p>{{ x.kind }} · <span class="mono">{{ x.num }}</span></p>
                <ng-container *ngTemplateOutlet="opt; context: { ic: 'pdf', t: 'Baixar PDF assinado', s: 'Documento oficial com assinatura digital e QR Code', fn: dl(x, 'pdf') }" />
                <ng-container *ngTemplateOutlet="opt; context: { ic: 'img', t: 'Baixar imagem (PNG)', s: 'Imagem do documento para guardar ou anexar', fn: dl(x, 'png') }" />
                <ng-container *ngTemplateOutlet="opt; context: { ic: 'link', t: 'Criar link temporário', s: 'Quem receber vê os dados por 24 horas', fn: share(x) }" />
                <ng-container *ngTemplateOutlet="opt; context: { ic: 'mail', t: 'Enviar por e-mail', s: 'Envia o PDF para o e-mail cadastrado no gov.br', fn: mail() }" /></div>
              <div class="mf"><button type="button" class="btn out" (click)="m.close()">Cancelar</button></div>
            }
          }
          @case ('share') {
            <ng-container *ngTemplateOutlet="hdr; context: { $implicit: 'Link temporário' }" />
            <div class="mb"><p>O link mostra tipo, número, validade e situação do documento. CPF e foto ficam ocultos. Expira em 24 horas.</p>
              <div class="boxed" style="padding:10px 12px"><div class="mono" style="word-break:break-all;font-size:13px">{{ m.seed() }}</div></div></div>
            <div class="mf"><button type="button" class="btn out" (click)="m.close()">Fechar</button><button type="button" class="btn" (click)="s.copy(m.seed(), 'Link copiado. Válido por 24 horas.'); m.close()"><pf-icon name="copy" />Copiar link</button></div>
          }
          @case ('qr') {
            @if (x) {
              <ng-container *ngTemplateOutlet="hdr; context: { $implicit: 'QR Code de autenticidade' }" />
              <div class="mb"><div class="center"><b style="font-weight:500">{{ x.kind }}</b><div class="mono" style="color:var(--muted);font-size:12.5px">Nº {{ x.num }}</div>
                <div class="qrlarge"><pf-qr [seed]="codeOf(x) + qrSalt()" /></div><div class="mono" style="font-size:12.5px">{{ codeOf(x) }}</div>
                <p class="cd">Código renova em {{ qrT() }} s</p><p style="color:var(--muted);font-size:12.5px;margin:0">Apresente ao agente de fiscalização ou peça que ele leia o código com o app PF Digital.</p></div></div>
              <div class="mf"><button type="button" class="btn out" (click)="s.copy(codeOf(x), 'Código do QR copiado')"><pf-icon name="copy" />Copiar código</button><button type="button" class="btn" (click)="m.close()">Fechar</button></div>
            }
          }
          @case ('valid') {
            @if (x) {
              @let st = s.status(x);
              @let c = st.k === 'ok' ? 'ok' : st.k === 'lock' ? 'lock' : st.k === 'warn' ? 'warn' : 'bad';
              <ng-container *ngTemplateOutlet="hdr; context: { $implicit: 'Validação do documento' }" />
              <div class="mb"><div class="bigicon" [style.background]="'var(--' + c + '-bg)'" [style.color]="'var(--' + c + ')'"><pf-icon [name]="st.k === 'ok' ? 'ok' : 'alert'" /></div>
                <h3 style="margin:0 0 6px;font-weight:500;font-size:17px">{{ st.k === 'ok' ? 'Documento autêntico e válido' : 'Documento autêntico · ' + st.t }}</h3>
                <p>Consulta feita na base da Polícia Federal em 14/10/2026. Assinatura digital conferida.</p>
                <div class="boxed"><div class="kv"><span>Documento</span><b>{{ x.kind }}</b></div><div class="kv"><span>Número</span><b class="mono">{{ x.num }}</b></div><div class="kv"><span>Situação</span><b>{{ st.t }}</b></div></div></div>
              <div class="mf"><button type="button" class="btn" (click)="m.close()">Concluir</button></div>
            }
          }
          @case ('more') {
            @if (x) {
              <ng-container *ngTemplateOutlet="hdr; context: { $implicit: x.kind }" />
              @if (m.seed() === 'card') {
                <div class="mb"><p class="mono" style="margin-top:-6px">Nº {{ s.hidden().has(x.id) ? '••••••' : x.num }}</p>
                  <ng-container *ngTemplateOutlet="opt; context: { ic: 'export', t: 'Exportar', s: 'PDF, imagem, link temporário ou e-mail', fn: to('export', x) }" />
                  <ng-container *ngTemplateOutlet="opt; context: { ic: 'copy', t: 'Copiar número', s: 'Para colar em formulários', fn: cp(x.num, 'Número do documento copiado') }" />
                  @if (x.prot) {
                    <ng-container *ngTemplateOutlet="opt; context: { ic: 'file', t: 'Ver solicitação de Origem', s: 'Abre o pedido ' + x.prot + ' em Solicitações', fn: origin(x) }" />
                  }
                  <ng-container *ngTemplateOutlet="opt; context: { ic: s.hidden().has(x.id) ? 'eye' : 'eyeoff', t: s.hidden().has(x.id) ? 'Mostrar documento' : 'Ocultar documento', s: 'Esconde ou exibe os dados do documento', fn: hide(x) }" />
                </div>
              } @else {
              <div class="mb"><p class="mono" style="margin-top:-6px">Nº {{ x.num }}</p>
                <ng-container *ngTemplateOutlet="opt; context: { ic: 'copy', t: 'Copiar número do documento', s: 'Para colar em formulários', fn: cp(x.num, 'Número copiado') }" />
                <ng-container *ngTemplateOutlet="opt; context: { ic: 'qr', t: 'Copiar código do QR Code', s: 'Copia o código de validação', fn: cp(codeOf(x), 'Código do QR copiado') }" />
                <ng-container *ngTemplateOutlet="opt; context: { ic: 'shield', t: 'Validar documento', s: 'Confere autenticidade e situação na base da PF', fn: to('valid', x) }" />
                <ng-container *ngTemplateOutlet="opt; context: { ic: 'hist', t: 'Ver histórico', s: 'Emissões, renovações e eventos deste documento', fn: nav(['/historico', x.id]) }" />
                @if (x.prot) {
                  <ng-container *ngTemplateOutlet="opt; context: { ic: 'file', t: 'Ver solicitação de origem', s: 'Abre o pedido ' + x.prot + ' em Solicitações', fn: origin(x) }" />
                }
                <ng-container *ngTemplateOutlet="opt; context: { ic: 'trash', t: 'Remover da carteira', s: 'Pede confirmação antes de remover', fn: to('remove', x) }" /></div>
              }
            }
          }
          @case ('remove') {
            @if (x) {
              <ng-container *ngTemplateOutlet="hdr; context: { $implicit: 'Remover ' + art(x.type) + ' da carteira?' }" />
              <div class="mb"><div class="bigicon" style="background:var(--bad-bg);color:var(--bad)"><pf-icon name="trash" /></div>
                <p>{{ x.kind }} (<span class="mono">{{ x.num }}</span>) deixa de aparecer na sua carteira no portal e no app PF Digital. O documento continua válido na Polícia Federal e pode ser adicionado de novo em <b>Adicionar documento</b>.</p>
                <label class="check"><input type="checkbox" [checked]="rmOk()" (change)="rmOk.set($any($event.target).checked)"> Entendi que não terei o QR Code deste documento no celular.</label></div>
              <div class="mf"><button type="button" class="btn out" (click)="m.close()">Cancelar</button><button type="button" class="btn danger" [disabled]="!rmOk()" (click)="s.removeDoc(x)">Remover da carteira</button></div>
            }
          }
          @case ('reval') {
            <ng-container *ngTemplateOutlet="hdr; context: { $implicit: 'Revalidação de CR' }" />
            <div class="mb"><p>Você será levado ao serviço <b>Revalidação de Certificado de Registro (CR)</b>. Os dados do CR atual já vêm preenchidos.</p>
              <div class="boxed"><div class="kv"><span>Documentos necessários</span><b>4</b></div><div class="kv"><span>Taxa (GRU)</span><b>R$ 25,00</b></div><div class="kv"><span>Prazo de análise</span><b>até 30 dias</b></div></div></div>
            <div class="mf"><button type="button" class="btn out" (click)="m.close()">Agora não</button><button type="button" class="btn" (click)="s.startReval()">Iniciar solicitação</button></div>
          }
          @case ('link') {
            <ng-container *ngTemplateOutlet="hdr; context: { $implicit: 'Vincular celular' }" />
            <div class="mb"><div class="center"><p>No celular, abra o app <b>PF Digital</b>, toque em <b>Adicionar</b> › <b>Ler QR Code do Portal PF</b> e aponte para o código abaixo.</p>
              <div class="qrlarge" style="width:220px;height:220px"><pf-qr [seed]="m.seed()" /></div><p class="cd">Código válido por {{ lkLabel() }}</p></div></div>
            <div class="mf"><button type="button" class="btn out" (click)="m.close()">Cancelar</button><button type="button" class="btn" (click)="m.open('linked')">Simular leitura no celular</button></div>
          }
          @case ('linked') {
            <ng-container *ngTemplateOutlet="hdr; context: { $implicit: 'Celular vinculado' }" />
            <div class="mb"><div class="result"><pf-icon name="ok" /><div><b>Celular vinculado à sua conta</b><small>{{ s.docs().length }} documentos sincronizados com o app PF Digital</small></div></div>
              <div class="boxed">@for (d of s.docs(); track d.id) { <div class="kv"><span>{{ d.short }}</span><b class="mono">{{ d.num }}</b></div> }</div></div>
            <div class="mf"><a class="btn" routerLink="/carteira" (click)="m.close()">Ir para a carteira</a></div>
          }
          @case ('num') {
            <ng-container *ngTemplateOutlet="hdr; context: { $implicit: 'Buscar pelo número' }" />
            <div class="mb"><p>Só aparecem documentos vinculados ao seu CPF.</p>
              <form id="nf" (submit)="$event.preventDefault(); findNum(inNum.value)"><div class="field"><label for="in-num">Número do documento</label><input #inNum class="inp" id="in-num" [value]="s.removed()[0]?.doc?.num ?? '010.008.170-32'"></div></form></div>
            <div class="mf"><button type="button" class="btn out" (click)="m.close()">Cancelar</button><button type="submit" form="nf" class="btn"><pf-icon name="search" />Buscar</button></div>
          }
          @case ('third') {
            <ng-container *ngTemplateOutlet="hdr; context: { $implicit: 'Validar documento de terceiro' }" />
            <div class="mb"><p>Digite o código que aparece abaixo do QR Code do documento.</p>
              <form id="tf" (submit)="$event.preventDefault(); tfRes.set(rx.test(inCode.value.trim()))"><div class="field"><label for="in-code">Código de validação</label><input #inCode class="inp" id="in-code" value="PF-CR-02177490-9C41B2"></div></form>
              @if (tfRes() === true) {
                <div class="result"><pf-icon name="ok" /><div><b>CR autêntico · Válido</b><small>Consulta na base da PF · 14/10/2026</small></div></div>
                <div class="boxed"><div class="kv"><span>Titular</span><b>J*** P***** S*****</b></div><div class="kv"><span>Nº do CR</span><b class="mono">021.774.903-11</b></div>
                  <div class="kv"><span>Validade</span><b class="mono">22/05/2029</b></div><div class="kv"><span>Atividades</span><b>Caçador excepcional</b></div></div>
                <p class="small">Dados pessoais aparecem mascarados, conforme a LGPD.</p>
              } @else if (tfRes() === false) {
                <div class="msg bad"><pf-icon name="alert" /><span class="t">Código inválido. Confira o formato PF-TIPO-NÚMERO-CÓDIGO, como aparece abaixo do QR Code.</span></div>
              }</div>
            <div class="mf"><button type="button" class="btn out" (click)="m.close()">Fechar</button><button type="submit" form="tf" class="btn"><pf-icon name="shield" />Validar</button></div>
          }
          @case ('notif') {
            <ng-container *ngTemplateOutlet="hdr; context: { $implicit: 'Avisos da carteira' }" />
            <div class="mb">
              @for (n of s.notifs(); track n.id; let i = $index) {
                <button type="button" class="nt" [class.unread]="m.seed() === 'unread' && i < 3" (click)="nav(['/documento', n.id])()"><span class="dot" [style.background]="'var(--' + n.k + '-bg)'" [style.color]="'var(--' + n.k + ')'"><pf-icon [name]="n.ic" /></span><div><b>{{ n.t }}</b><p>{{ n.p }}</p><small>{{ n.w }}</small></div></button>
              }
            </div>
          }
          @case ('prefs') {
            <ng-container *ngTemplateOutlet="hdr; context: { $implicit: 'Preferências de aviso' }" />
            <div class="mb">
              <div class="setting"><div><b>Vencimento: 90, 30 e 7 dias antes</b><small>Aviso no portal e no app PF Digital</small></div><label class="sw"><input #p1 type="checkbox" [checked]="s.prefs().n90" aria-label="Avisos de vencimento"><span></span></label></div>
              <div class="setting"><div><b>Documento bloqueado</b><small>Avisar quando a PF bloquear um documento</small></div><label class="sw"><input #p2 type="checkbox" [checked]="s.prefs().blk" aria-label="Avisos de bloqueio"><span></span></label></div>
              <div class="setting"><div><b>Enviar também por e-mail</b><small>{{ email }}</small></div><label class="sw"><input #p3 type="checkbox" [checked]="s.prefs().mail" aria-label="Avisos por e-mail"><span></span></label></div>
              <div class="setting"><div><b>Simular CR vencido</b><small>Controle do protótipo: mostra o alerta fixo de vencimento</small></div><label class="sw"><input type="checkbox" [checked]="s.expired()" (change)="s.expired.set($any($event.target).checked)" aria-label="Simular CR vencido"><span></span></label></div></div>
            <div class="mf"><button type="button" class="btn" (click)="s.prefs.set({ n90: p1.checked, blk: p2.checked, mail: p3.checked }); m.close(); toast.show('Preferências salvas')">Salvar</button></div>
          }
        }
      </div>
    </div>
  `,
})
export class ModalHost implements OnDestroy {
  m = inject(Modals);
  s = inject(Store);
  toast = inject(Toasts);
  private router = inject(Router);
  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  codeOf = codeOf;
  email = EMAIL;
  rx = /^PF-[A-Z]+-\w+-\w+$/;

  small = computed(() => SMALL.includes(this.m.kind()));
  rmOk = signal(false);
  tfRes = signal<boolean | null>(null);
  qrT = signal(60);
  qrSalt = signal('');
  lkT = signal(300);
  lkLabel = computed(() => Math.floor(this.lkT() / 60) + ':' + String(this.lkT() % 60).padStart(2, '0'));
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    effect(() => {
      this.m.tick();
      untracked(() => {
        this.stop();
        const k = this.m.kind();
        if (!this.m.on()) return;
        this.rmOk.set(false);
        this.tfRes.set(null);
        if (k === 'qr') {
          this.qrT.set(60); this.qrSalt.set('');
          this.timer = setInterval(() => {
            this.qrT.update(n => n - 1);
            if (this.qrT() <= 0) { this.qrT.set(60); this.qrSalt.set(String(Math.random())); }
          }, 1000);
        } else if (k === 'link') {
          this.lkT.set(300);
          this.timer = setInterval(() => { this.lkT.update(n => n - 1); if (this.lkT() <= 0) this.stop(); }, 1000);
        }
        setTimeout(() => {
          const f = this.el.nativeElement.querySelector<HTMLElement>('.mb button,.mb input,.mf button');
          (f ?? this.el.nativeElement.querySelector<HTMLElement>('.x'))?.focus();
        }, 30);
      });
    });
  }
  ngOnDestroy() { this.stop(); }
  private stop() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }

  @HostListener('document:keydown.escape') esc() { this.m.close(); }
  backdrop(e: MouseEvent) { if ((e.target as HTMLElement).classList.contains('scrim')) this.m.close(); }

  art(t: string) { return t === 'CR' ? 'o CR' : t === 'PASS' ? 'o passaporte' : t === 'GTE' ? 'a guia' : t === 'AUT' ? 'a autorização' : 'o CRAF'; }
  to = (k: any, x: any) => () => this.m.open(k, x);
  cp = (t: string, msg: string) => () => { this.s.copy(t, msg); this.m.close(); };
  nav = (cmd: any[]) => () => { this.m.close(); this.router.navigate(cmd); };
  origin = (x: any) => () => this.s.openOrigin(x);
  hide = (x: any) => () => { this.s.toggleHidden(x.id); this.m.close(); };
  dl = (x: any, ext: string) => () => { this.m.close(); this.toast.show('Download iniciado: ' + x.type + '_' + x.num.replace(/\W/g, '') + '.' + ext); };
  mail = () => () => { this.m.close(); this.toast.show('PDF enviado para ' + EMAIL); };
  share = (x: any) => () => this.m.open('share', x, 'https://servicos.pf.gov.br/v/' + Math.random().toString(36).slice(2, 10));
  findNum(v: string) {
    v = v.trim();
    const i = this.s.removed().findIndex(r => r.doc.num === v);
    this.m.close();
    if (i >= 0) { const d = this.s.restore(i); this.toast.show(d.kind + ' adicionado à carteira'); }
    else if (this.s.docs().some(x => x.num === v)) this.toast.show('Este documento já está na sua carteira', 'info');
    else this.toast.show('Nenhum documento com esse número no seu CPF', 'info');
  }
}
