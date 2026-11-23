export const TODAY = new Date(2026, 9, 14);
export const NAME = 'CARLOS EDUARDO MENDES RIBEIRO';
export const CPF = '123.456.789-09';
export const EMAIL = 'carlos.ribeiro@email.com.br';

export interface Doc {
  id: string; type: string; short: string; kind: string; name: string; num: string;
  em: string; val: string; cat: string; auth: string; photo?: boolean; prot?: string;
  integ?: boolean; blocked?: boolean; fields: [string, string][];
}
export interface HistEntry {
  t: string; when: string; prot: string; st: string; k: string; cur?: number; blk?: number;
  txt: string; docs: [string, string][];
}
export interface SolRow { tit: string; desc: string; prot: string; dt: string; st: string; doc?: string }

export const d = (s: string) => { const [a, b, c] = s.split('/').map(Number); return new Date(c, b - 1, a); };
export const days = (s: string) => Math.round((+d(s) - +TODAY) / 864e5);
export const fmt = (x: Date) => String(x.getDate()).padStart(2, '0') + '/' + String(x.getMonth() + 1).padStart(2, '0') + '/' + x.getFullYear();
export const codeOf = (x: Doc) => `PF-${x.type}-${x.num.replace(/\W/g, '').slice(-8)}-${x.auth.slice(0, 6).toUpperCase()}`;
export const typeIcon = (x: Doc) => (x.type === 'CRAF' ? 'craf' : x.type.toLowerCase());

export const BASE: Doc[] = [
  { id: 'cr', type: 'CR', short: 'CR', kind: 'Certificado de Registro', name: 'Certificado de Registro', num: '010.008.170-32', em: '07/10/2025', val: '07/10/2028', cat: 'arma', auth: '5f3f5c60f22a1ed06fe7f3b235afb58a', photo: true, prot: '2025-0000000412',
    fields: [['Atividades', 'Atirador Desportivo · Colecionador'], ['Unidade de vinculação', 'SR/PF/DF'], ['Amparo legal', 'Decreto nº 11.615/2023']] },
  { id: 'craf1', type: 'CRAF', short: 'CRAF', kind: 'Certificado de Registro de Arma de Fogo', name: 'CRAF · Pistola Taurus G2C', num: 'SINARM 2025/004417', em: '14/11/2025', val: '14/11/2035', cat: 'arma', auth: 'a91c00e4b7d2f61e', prot: '2025-0000000530',
    fields: [['Espécie', 'Pistola'], ['Marca / Modelo', 'Taurus / G2C'], ['Calibre', '9 mm (permitido)'], ['Nº de série', 'ACB 482917'], ['Acervo', 'Tiro desportivo'], ['CR vinculado', '010.008.170-32']] },
  { id: 'gte', type: 'GTE', short: 'Guia', kind: 'Guia de Tráfego Especial', name: 'GTE · Treinamento de tiro', num: '99351026065911', em: '09/09/2026', val: '09/03/2027', cat: 'arma', auth: '7c2be81f04ad', prot: '2026-0000000041',
    fields: [['Origem', 'SHN Qd. 2, Asa Norte, Brasília/DF'], ['Destino', 'Clube de Tiro Planalto · CR 454751'], ['Finalidade', 'Treinamento de tiro desportivo'], ['Produtos', '1 pistola 9 mm · SINARM 2025/004417']] },
  { id: 'aut', type: 'AUT', short: 'Autorização', kind: 'Autorização para Aquisição de Arma de Fogo', name: 'Autorização de aquisição', num: 'AAQ-2026-118204', em: '28/07/2026', val: '26/10/2026', cat: 'arma', auth: 'e30f9a17bb', prot: '2026-0000000033',
    fields: [['Produto', 'Carabina calibre .22 LR'], ['Quantidade', '1 unidade'], ['Fornecedor', 'Loja credenciada pela PF'], ['Prazo', '90 dias a partir da emissão']] },
  { id: 'pass', type: 'PASS', short: 'Passaporte', kind: 'Passaporte', name: 'Passaporte comum', num: 'FZ482917', em: '03/04/2023', val: '02/04/2033', cat: 'viagem', auth: '0f88ab31', integ: true, photo: true,
    fields: [['Tipo', 'P · Comum'], ['País emissor', 'BRA'], ['Autoridade', 'DPF/BSB/DF'], ['Nascimento', '12/05/1985 · Brasília/DF']] },
  { id: 'craf2', type: 'CRAF', short: 'CRAF', kind: 'Certificado de Registro de Arma de Fogo', name: 'CRAF · Revólver Rossi', num: 'SINARM 2019/118540', em: '02/05/2019', val: '02/05/2029', cat: 'arma', auth: 'b0c4d913', blocked: true, prot: '2026-0000000052',
    fields: [['Espécie', 'Revólver'], ['Marca / Modelo', 'Rossi / RT 88'], ['Calibre', '.38 SPL'], ['Nº de série', 'RS 0091274'], ['Acervo', 'Defesa pessoal'], ['Motivo do bloqueio', 'Comunicação de extravio em 12/08/2026']] },
];

export const HIST: Record<string, HistEntry[]> = {
  cr: [
    { t: 'Revalidação do CR', when: '07/10/2025', prot: '2025-0000000412', st: 'Vigente', k: 'ok', cur: 1, txt: 'Validade renovada até 07/10/2028.',
      docs: [['Certificado de Registro', 'emitido em 07/10/2025'], ['Comprovante de pagamento (GRU)', '18/09/2025'], ['Laudo de aptidão psicológica', '02/09/2025'], ['Comprovante de capacidade técnica', '28/08/2025']] },
    { t: 'Inclusão de atividade · Colecionador', when: '15/03/2024', prot: '2024-0000000211', st: 'Substituído', k: 'mut', txt: 'Apostilamento de nova atividade ao CR.',
      docs: [['Certificado de Registro (2ª via)', 'emitido em 15/03/2024'], ['Requerimento de apostilamento', '01/03/2024']] },
    { t: 'Concessão do CR', when: '07/10/2022', prot: '2022-0000000774', st: 'Substituído', k: 'mut', txt: 'Primeira emissão do certificado.',
      docs: [['Certificado de Registro', 'emitido em 07/10/2022'], ['Certidões de antecedentes', '19/09/2022'], ['Laudo de aptidão psicológica', '10/09/2022']] },
  ],
  craf1: [
    { t: 'Registro da arma · emissão do CRAF', when: '14/11/2025', prot: '2025-0000000530', st: 'Vigente', k: 'ok', cur: 1, txt: 'Arma registrada no acervo de tiro desportivo.',
      docs: [['CRAF', 'emitido em 14/11/2025'], ['Nota fiscal da arma', '06/11/2025']] },
    { t: 'Autorização de aquisição', when: '21/08/2025', prot: '2025-0000000381', st: 'Utilizada', k: 'mut', txt: 'Autorização AAQ-2025-084113 usada na compra.',
      docs: [['Autorização para Aquisição', 'emitida em 21/08/2025']] },
  ],
  gte: [
    { t: 'Emissão da GTE', when: '09/09/2026', prot: '2026-0000000041', st: 'Vigente', k: 'ok', cur: 1, txt: 'Válida de 09/09/2026 a 09/03/2027.',
      docs: [['Guia de Tráfego Especial', 'emitida em 09/09/2026'], ['Declaração do clube de tiro', '01/09/2026']] },
    { t: 'GTE anterior · nº 99351025031870', when: '12/03/2026', prot: '2026-0000000008', st: 'Vencida', k: 'bad', txt: 'Validade encerrada em 08/09/2026.',
      docs: [['Guia de Tráfego Especial', 'emitida em 12/03/2026']] },
  ],
  aut: [
    { t: 'Autorização emitida', when: '28/07/2026', prot: '2026-0000000033', st: 'Vigente', k: 'ok', cur: 1, txt: 'Prazo de 90 dias para efetuar a compra.',
      docs: [['Autorização para Aquisição', 'emitida em 28/07/2026'], ['Declaração de efetiva necessidade', '14/07/2026']] },
    { t: 'Solicitação enviada', when: '14/07/2026', prot: '2026-0000000033', st: 'Concluída', k: 'mut', txt: 'Pedido analisado pela SR/PF/DF.', docs: [] },
  ],
  pass: [
    { t: 'Emissão do passaporte', when: '03/04/2023', prot: 'Integração · passaportes', st: 'Vigente', k: 'ok', cur: 1, txt: 'Dados importados do sistema de passaportes.',
      docs: [['Comprovante de entrega', '03/04/2023']] },
    { t: 'Passaporte anterior · FX195530', when: '10/02/2013', prot: 'Integração · passaportes', st: 'Vencido', k: 'bad', txt: 'Validade encerrada em 09/02/2023.', docs: [] },
  ],
  craf2: [
    { t: 'Bloqueio do documento', when: '12/08/2026', prot: '2026-0000000052', st: 'Bloqueado', k: 'lock', blk: 1, txt: 'Comunicação de extravio registrada pelo titular.',
      docs: [['Comunicação de extravio', '12/08/2026'], ['Boletim de ocorrência', '11/08/2026']] },
    { t: 'Renovação do CRAF', when: '02/05/2019', prot: '2019-0000000210', st: 'Substituído', k: 'mut', txt: 'Validade renovada até 02/05/2029.', docs: [['CRAF', 'emitido em 02/05/2019']] },
    { t: 'Registro da arma', when: '20/06/2014', prot: '2014-0000000045', st: 'Substituído', k: 'mut', txt: 'Primeiro registro no SINARM.', docs: [['CRAF', 'emitido em 20/06/2014']] },
  ],
};

export const AG = 'Aguardando documentação';
export const EA = 'Em análise';
export const CO = 'Concluída';

const P1: [string, string, number, string, string][] = [
  ['Credenciamento de psicólogo', 'Rascunho', 93, '08/10/2026', AG], ['Renovação de Certificado de Registro de Arma de Fogo (CRAF)', 'Pronto para análise', 92, '07/10/2026', EA],
  ['Registrar Arma de Fogo', 'Rascunho', 91, '07/10/2026', AG], ['Registrar Arma de Fogo', 'Rascunho', 90, '07/10/2026', AG],
  ['Autorização para Aquisição de Arma de Fogo', 'Rascunho', 89, '07/10/2026', AG], ['Renovação de Certificado de Registro de Arma de Fogo (CRAF)', 'Rascunho', 88, '07/10/2026', AG],
  ['Autorização de Aquisição de Arma de Fogo', 'Rascunho', 87, '07/10/2026', AG], ['Autorização para Aquisição de Arma de Fogo', 'Rascunho', 86, '07/10/2026', AG],
  ['Credenciamento de psicólogo', 'Rascunho', 85, '07/10/2026', AG], ['Credenciamento de psicólogo', 'Rascunho', 84, '07/10/2026', AG],
  ['Renovação de Certificado de Registro de Arma de Fogo (CRAF)', 'Pronto para análise', 83, '05/10/2026', EA], ['Renovação de Certificado de Registro de Arma de Fogo (CRAF)', 'Rascunho', 78, '28/09/2026', AG],
  ['Renovação de Certificado de Registro de Arma de Fogo (CRAF)', 'Rascunho', 77, '28/09/2026', AG], ['Renovação de Certificado de Registro de Arma de Fogo (CRAF)', 'Em processamento', 76, '28/09/2026', EA],
  ['Autorização para Aquisição de Arma de Fogo', 'Rascunho', 75, '28/09/2026', AG], ['Renovação de Certificado de Registro de Arma de Fogo (CRAF)', 'Rascunho', 74, '28/09/2026', AG],
  ['Renovação de Certificado de Registro de Arma de Fogo (CRAF)', 'Rascunho', 73, '28/09/2026', AG], ['Renovação de Certificado de Registro de Arma de Fogo (CRAF)', 'Rascunho', 72, '14/09/2026', AG],
  ['Renovação de Certificado de Registro de Arma de Fogo (CRAF)', 'Rascunho', 71, '14/09/2026', AG], ['Renovação de Certificado de Registro de Arma de Fogo (CRAF)', 'Rascunho', 70, '14/09/2026', AG],
];
const SVC = ['Renovação de Certificado de Registro de Arma de Fogo (CRAF)', 'Registrar Arma de Fogo', 'Autorização para Aquisição de Arma de Fogo', 'Credenciamento de psicólogo', 'Emitir Guia de Tráfego', 'Atualizar Endereço de Guarda do Acervo'];
const DONE: Record<number, [string, string, string, string]> = {
  41: ['Emitir Guia de Tráfego', 'Deferida', '09/09/2026', 'gte'],
  33: ['Autorização para Aquisição de Arma de Fogo', 'Deferida', '28/07/2026', 'aut'],
  52: ['Comunicação de Extravio de Arma de Fogo', 'Deferida', '12/08/2026', 'craf2'],
};

export function buildSol(): SolRow[] {
  const sol: SolRow[] = P1.map(r => ({ tit: r[0], desc: r[1], prot: '2026-' + String(r[2]).padStart(10, '0'), dt: r[3], st: r[4] }));
  let day = new Date(2026, 8, 12);
  for (let n = 69; n >= 17; n--) {
    if (DONE[n]) {
      const x = DONE[n];
      sol.push({ tit: x[0], desc: x[1], prot: '2026-' + String(n).padStart(10, '0'), dt: x[2], st: CO, doc: x[3] });
      continue;
    }
    day = new Date(day.getTime() - ((n * 7) % 3 + 1) * 864e5);
    const st = n % 9 === 0 ? EA : AG;
    const tit = n === 29 || n === 14 ? SVC[0] : SVC[(n * 5) % SVC.length];
    sol.push({ tit, desc: n === 29 ? 'Pendência na documentação' : st === EA ? 'Pronto para análise' : 'Rascunho', prot: '2026-' + String(n).padStart(10, '0'), dt: fmt(day), st });
  }
  sol.push({ tit: SVC[0], desc: 'Pendência na documentação', prot: '2026-0000000014', dt: '02/03/2026', st: AG });
  sol.push({ tit: 'Registrar Arma de Fogo', desc: 'Deferida', prot: '2025-0000000530', dt: '06/11/2025', st: CO, doc: 'craf1' });
  sol.push({ tit: 'Revalidação de Certificado de Registro (CR)', desc: 'Deferida', prot: '2025-0000000412', dt: '18/09/2025', st: CO, doc: 'cr' });
  return sol;
}
