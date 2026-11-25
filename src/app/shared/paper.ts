import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { CPF, Doc, NAME, codeOf } from './data';
import { Store } from './store';
import { Qr } from './qr';

@Component({
  selector: 'pf-f',
  host: { style: 'display:contents' },
  template: `<div class="p-f" [class.w2]="w2()"><small>{{ l() }}</small><b [class.mono]="mono()">{{ v() }}</b></div>`,
})
export class Field {
  l = input.required<string>();
  v = input.required<string>();
  w2 = input(false);
  mono = computed(() => /\d{2}\/\d{2}\/\d{4}|\d{3}\.|SINARM|^[A-Z]{2}\d/.test(this.v()));
}

@Component({
  selector: 'pf-paper',
  imports: [Field, Qr, NgTemplateOutlet],
  host: { style: 'display:block' },
  template: `
    <div class="paper">
      @if (st().k === 'bad') {
        <div class="stamp">VENCIDO<small>desde {{ v().val }}</small></div>
      } @else if (st().k === 'lock') {
        <div class="stamp lk">BLOQUEADO<small>desde 12/08/2026</small></div>
      }
      <div class="p-head"><img src="logo.png" alt=""><div><small>República Federativa do Brasil<br>Ministério da Justiça e Segurança Pública</small><b>POLÍCIA FEDERAL</b></div></div>
      <div class="p-title"><b>{{ doc().kind.toUpperCase() }}</b><span>Nº {{ doc().num }}</span></div>

      @switch (doc().type) {
        @case ('CR') {
          <div class="p-id"><div class="p-photo"><ng-container *ngTemplateOutlet="photo" /></div>
            <div class="p-grid one"><pf-f l="Nome completo" [v]="name" /><pf-f l="CPF" [v]="cpf" /><pf-f l="Unidade de vinculação" [v]="F()['Unidade de vinculação']" /></div></div>
          <div class="p-grid" style="margin-top:8px"><pf-f l="Nº do CR" [v]="doc().num" /><pf-f l="Validade" [v]="v().val" /><pf-f l="Emissão" [v]="v().em" /><pf-f l="Situação" [v]="st().t" /></div>
          <div class="p-bar">Atividades autorizadas</div>
          <div class="p-grid one"><pf-f l="1" v="Tiro desportivo · Atirador desportivo" /><pf-f l="2" v="Colecionamento · Colecionador" /></div>
          <div class="p-bar">Amparo legal</div>
          <div class="p-grid one"><pf-f l="Fundamento" [v]="'De acordo com o ' + F()['Amparo legal']" /></div>
        }
        @case ('CRAF') {
          <div class="p-bar">1. Identificação do proprietário</div>
          <div class="p-grid"><pf-f l="Nome" [v]="name" [w2]="true" /><pf-f l="CPF" [v]="cpf" /><pf-f l="CR" [v]="F()['CR vinculado'] || '010.008.170-32'" /></div>
          <div class="p-bar">2. Dados da arma</div>
          <div class="p-grid"><pf-f l="Espécie" [v]="F()['Espécie']" /><pf-f l="Marca / Modelo" [v]="F()['Marca / Modelo']" /><pf-f l="Calibre" [v]="F()['Calibre']" /><pf-f l="Nº de série" [v]="F()['Nº de série']" /><pf-f l="Acervo" [v]="F()['Acervo']" /><pf-f l="Situação" [v]="st().t" /></div>
          <div class="p-bar">3. Validade</div>
          <div class="p-grid"><pf-f l="Emissão" [v]="v().em" /><pf-f l="Validade" [v]="v().val" /></div>
          @if (doc().blocked) {
            <div class="p-bar">Observação</div>
            <div class="p-grid one"><pf-f l="Bloqueio" [v]="F()['Motivo do bloqueio']" /></div>
          }
        }
        @case ('GTE') {
          <div class="p-grid" style="margin-top:6px"><pf-f l="Validade" v="09/09/2026 à 09/03/2027" [w2]="true" /></div>
          <div class="p-bar">1. Identificação do proprietário</div>
          <div class="p-grid"><pf-f l="Nome" [v]="name" [w2]="true" /><pf-f l="CPF" [v]="cpf" /><pf-f l="CR" v="010.008.170-32" /></div>
          <div class="p-bar">2. Local de origem</div>
          <div class="p-grid one"><pf-f l="Endereço" [v]="F()['Origem']" /></div>
          <div class="p-bar">3. Local de destino</div>
          <div class="p-grid one"><pf-f l="Nome / Endereço" [v]="F()['Destino']" /></div>
          <div class="p-bar">4. Finalidade</div>
          <div class="p-grid one"><pf-f l="Finalidade" v="Treinamento de tiro desportivo. Arma desmuniciada; retorno assegurado." /></div>
          <div class="p-bar">5. Produtos controlados</div>
          <table class="p-table"><tr><th>Espécie</th><th>Marca</th><th>Calibre</th><th>Nº série</th><th>Qtd</th></tr><tr><td>Pistola</td><td>Taurus</td><td>9 mm</td><td class="mono">ACB 482917</td><td>1</td></tr></table>
        }
        @case ('AUT') {
          <div class="p-bar">1. Requerente</div>
          <div class="p-grid"><pf-f l="Nome" [v]="name" [w2]="true" /><pf-f l="CPF" [v]="cpf" /><pf-f l="CR" v="010.008.170-32" /></div>
          <div class="p-bar">2. Produto autorizado</div>
          <div class="p-grid"><pf-f l="Produto" [v]="F()['Produto']" [w2]="true" /><pf-f l="Quantidade" [v]="F()['Quantidade']" /><pf-f l="Fornecedor" [v]="F()['Fornecedor']" /></div>
          <div class="p-bar">3. Prazo</div>
          <div class="p-grid"><pf-f l="Emissão" [v]="v().em" /><pf-f l="Válida até" [v]="v().val" /></div>
        }
        @case ('PASS') {
          <div class="p-id"><div class="p-photo"><ng-container *ngTemplateOutlet="photo" /></div>
            <div class="p-grid"><pf-f l="Tipo" v="P" /><pf-f l="País" v="BRA" /><pf-f l="Sobrenome" v="MENDES RIBEIRO" [w2]="true" /><pf-f l="Nome" v="CARLOS EDUARDO" [w2]="true" /></div></div>
          <div class="p-grid" style="margin-top:8px"><pf-f l="Passaporte nº" [v]="doc().num" /><pf-f l="Nascimento" v="12/05/1985" /><pf-f l="Emissão" [v]="v().em" /><pf-f l="Validade" [v]="v().val" /><pf-f l="Autoridade" [v]="F()['Autoridade']" /><pf-f l="Situação" [v]="st().t" /></div>
          <div class="mrz">P&lt;BRAMENDES&lt;RIBEIRO&lt;&lt;CARLOS&lt;EDUARDO&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br>FZ482917&lt;4BRA8505123M3304026&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;06</div>
        }
      }

      <div class="p-foot">
        <div class="auth"><b>Documento assinado eletronicamente</b>{{ doc().type === 'PASS' ? 'Dados importados do sistema de passaportes' : 'SINARM · SR/PF/DF · Brasília/DF, ' + v().em }}<br>Autenticidade:<span class="mono">{{ doc().auth }}</span></div>
        <div class="q"><pf-qr [seed]="code()" /></div>
      </div>
    </div>

    <ng-template #photo>
      <img class="bg" src="documento/photo-bg.svg" width="84" height="116.297" alt="">
      <img class="person" src="documento/person.svg" width="68" height="68" alt="">
    </ng-template>
  `,
})
export class Paper {
  doc = input.required<Doc>();
  private s = inject(Store);
  name = NAME;
  cpf = CPF;
  v = computed(() => this.s.view(this.doc()));
  st = computed(() => this.s.status(this.doc()));
  F = computed(() => Object.fromEntries(this.doc().fields) as Record<string, string>);
  code = computed(() => codeOf(this.doc()));
}
