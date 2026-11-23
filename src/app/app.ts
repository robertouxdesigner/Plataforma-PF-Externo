import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Icon } from './shared/icon';
import { ModalHost } from './shared/modal-host';
import { Modals, Store, Toasts } from './shared/store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Icon, ModalHost],
  template: `
    <header class="hdr">
      <div class="hdr-in">
        <div class="hdr-top">
          <span class="govlogo" role="img" aria-label="gov.br"></span>
          <span class="min">Ministério da Justiça e Segurança Pública</span>
          <nav class="hdr-links" aria-label="Links do governo">
            <a href="https://www.gov.br/pt-br/orgaos-do-governo" target="_blank" rel="noopener">Orgão do governo</a>
            <a href="https://www.gov.br/acessoainformacao/pt-br" target="_blank" rel="noopener">Acesso à informação</a>
            <a href="https://www4.planalto.gov.br/legislacao/" target="_blank" rel="noopener">Legislação</a>
            <a href="https://www.gov.br/governodigital/pt-br/acessibilidade-digital" target="_blank" rel="noopener">Acessibilidade</a><i></i>
          </nav>
        </div>
        <div class="hdr-bot">
          <button class="togg" type="button" aria-label="Mostrar ou ocultar menu" (click)="toggle()"><pf-icon [name]="isOpen() ? 'x' : 'menu'" /></button>
          <div class="hdr-info"><h3>Polícia Federal</h3><p>Portal PF - Requerimentos</p></div>
          <div class="user">
            <div><div class="who"><b>Carlos Eduardo M. Ribeiro</b><small>carlos.ribeiro&#64;email.com.br</small></div></div>
            <span class="sep"></span>
            <div><div class="dt mono">{{ now }}</div><button type="button" class="out" (click)="toasts.show('Sessão encerrada no protótipo. Nada foi alterado.', 'info')">Sair</button></div>
          </div>
        </div>
      </div>
    </header>

    <div class="shell">
      <aside class="side" id="side" aria-label="Menu">
        <nav>
          <a routerLink="/solicitacoes" [class.on]="!isCart()" [attr.aria-current]="!isCart() ? 'page' : null"><pf-icon name="file" />Solicitações</a>
          <a routerLink="/carteira" [class.on]="isCart()" [attr.aria-current]="isCart() ? 'page' : null"><pf-icon name="wallet" />Carteira<span class="new">NOVO</span></a>
        </nav>
      </aside>
      <div class="side-scrim" (click)="closeMenu()"></div>
      <main class="main" id="main"><div class="wrap"><router-outlet /></div></main>
    </div>

    <footer>
      <div class="foot"><div class="foot-in">
        <div class="pfb"><img src="logo.png" alt="Brasão da Polícia Federal"><div>Portal PF - Requerimentos<br>Versão 0.3.42 · protótipo Carteira</div></div>
        <div class="gov-badges"><span><i>i</i>Acesso à<br>Informação</span><span>PÁTRIA AMADA<br>BRASIL</span></div>
      </div></div>
      <div class="foot2">© Copyright Polícia Federal - PF, Diretoria de Tecnologia da Informação e Inovação - DTI</div>
    </footer>

    <details class="demo">
      <summary>Controles do protótipo</summary>
      <div>
        <button type="button" (click)="s.expired.set(!s.expired())">{{ s.expired() ? 'Voltar CR para válido' : 'Simular CR vencido' }}</button>
        <button type="button" (click)="resetAll()">Reiniciar protótipo</button>
      </div>
    </details>

    <pf-modal-host />
    <div class="toasts" aria-live="polite">
      @for (t of toasts.items(); track t.id) {
        <div class="toast" [class.info]="t.kind === 'info'" role="status"><pf-icon [name]="t.kind === 'info' ? 'file' : 'ok'" /><span>{{ t.msg }}</span>
          @if (t.undo) { <button type="button" (click)="toasts.dismiss(t.id); t.undo()">Desfazer</button> }</div>
      }
    </div>
  `,
})
export class App {
  s = inject(Store);
  toasts = inject(Toasts);
  private modals = inject(Modals);
  private router = inject(Router);
  private body = inject(DOCUMENT).body;
  private url = signal(this.router.url);
  isCart = computed(() => !this.url().startsWith('/solicitacoes') && this.url() !== '/');
  menu = signal(false);
  noside = signal(false);
  now = '14/10/2026 ' + new Date().toTimeString().slice(0, 5);

  constructor() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(e => {
      this.url.set((e as NavigationEnd).urlAfterRedirects);
      this.closeMenu();
    });
  }
  private mobile() { return matchMedia('(max-width:900px)').matches; }
  isOpen() { return this.mobile() ? this.menu() : !this.noside(); }
  toggle() {
    if (this.mobile()) this.menu.update(v => !v); else this.noside.update(v => !v);
    this.body.classList.toggle('menu', this.menu());
    this.body.classList.toggle('noside', this.noside());
  }
  closeMenu() { this.menu.set(false); this.body.classList.remove('menu'); }
  resetAll() {
    this.s.reset(); this.modals.close();
    this.router.navigateByUrl('/solicitacoes');
    this.toasts.show('Protótipo reiniciado', 'info');
  }
}
