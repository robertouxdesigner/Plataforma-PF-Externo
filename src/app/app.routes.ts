import { Routes } from '@angular/router';
import { Solicitacoes } from './pages/solicitacoes';
import { Carteira } from './pages/carteira';
import { Documento } from './pages/documento';
import { Historico } from './pages/historico';
import { Adicionar } from './pages/adicionar';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'solicitacoes' },
  { path: 'solicitacoes', component: Solicitacoes, title: 'Solicitações · Portal PF' },
  { path: 'carteira', component: Carteira, title: 'Carteira · Portal PF' },
  { path: 'documento/:id', component: Documento, title: 'Documento · Portal PF' },
  { path: 'historico/:id', component: Historico, title: 'Histórico · Portal PF' },
  { path: 'adicionar', component: Adicionar, title: 'Adicionar documento · Portal PF' },
  { path: '**', redirectTo: 'solicitacoes' },
];
