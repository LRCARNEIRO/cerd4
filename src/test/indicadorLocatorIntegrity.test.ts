/**
 * indicadorLocatorIntegrity — validação EXAUSTIVA e estrutural das três
 * fontes que prometem "isto está localizável na aba X":
 *   - indicadorLocator.ts   (ABA_ESPELHO, CATEGORIA_ABAS, SUBCATEGORIA_ABAS,
 *                            ABAS_POR_CODIGO, ARQUIVO_ABAS)
 *   - indicadorSubs.ts      (SUB_INDICADORES + tambemEm)
 *   - indCodeAutoTag.ts     (usa os títulos/aliases de indicadorSubs para
 *                            carimbar o DOM real)
 *
 * Objetivo: falhar sempre que
 *   1) uma dessas estruturas apontar para uma aba (`tabValue`) que não
 *      existe de fato em Estatísticas (nenhum <TabsTrigger>/<TabsContent>
 *      real a sustenta) — "localização fantasma";
 *   2) dois sub-indicadores diferentes usarem o MESMO título/alias
 *      normalizado — "alias colidido", que faz indCodeAutoTag/KeywordSearch
 *      carimbar/lincar o bloco errado;
 *   3) o mesmo guarda-chuva aparecer com códigos IND-NNN divergentes;
 *   4) um código referenciado não seguir o formato canônico IND-NNN.
 *
 * Não requer DOM nem banco: lê o próprio código-fonte de Estatisticas.tsx
 * como oráculo das abas reais, e as estruturas de dados como sujeito de teste.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import {
  ABA_ESPELHO,
  CATEGORIA_ABAS,
  SUBCATEGORIA_ABAS,
  ABAS_POR_CODIGO,
  ARQUIVO_ABAS,
} from '@/utils/indicadorLocator';
import { SUB_INDICADORES, abasDoSub } from '@/utils/indicadorSubs';

const CODIGO_RE = /^IND-\d{3}$/;
const norm = (s: string) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

// ── Oráculo: abas que REALMENTE existem em src/pages/Estatisticas.tsx ──
function abasReaisDeEstatisticas(): { triggers: Set<string>; contents: Set<string> } {
  const file = path.resolve(__dirname, '../pages/Estatisticas.tsx');
  const src = fs.readFileSync(file, 'utf8');
  const triggers = new Set(
    Array.from(src.matchAll(/<TabsTrigger\s+value="([^"]+)"/g)).map((m) => m[1]),
  );
  const contents = new Set(
    Array.from(src.matchAll(/<TabsContent\s+value="([^"]+)"/g)).map((m) => m[1]),
  );
  return { triggers, contents };
}

const { triggers: ABAS_REAIS, contents: CONTEUDOS_REAIS } = abasReaisDeEstatisticas();

describe('indicadorLocator/indicadorSubs — abas prometidas existem de verdade', () => {
  it('Estatisticas.tsx tem ao menos uma aba real (sanity do oráculo)', () => {
    expect(ABAS_REAIS.size).toBeGreaterThan(5);
    expect(CONTEUDOS_REAIS.size).toBe(ABAS_REAIS.size);
  });

  it('toda TabsTrigger tem TabsContent correspondente (e vice-versa)', () => {
    expect([...ABAS_REAIS].sort()).toEqual([...CONTEUDOS_REAIS].sort());
  });

  it('ABA_ESPELHO aponta para uma aba real', () => {
    expect(ABAS_REAIS.has(ABA_ESPELHO.tabValue)).toBe(true);
  });

  it('CATEGORIA_ABAS: nenhuma categoria aponta para aba inexistente', () => {
    const fantasmas: string[] = [];
    for (const [categoria, abas] of Object.entries(CATEGORIA_ABAS)) {
      for (const aba of abas) {
        if (!aba.href && !ABAS_REAIS.has(aba.tabValue)) {
          fantasmas.push(`${categoria} → ${aba.tabValue}`);
        }
      }
    }
    expect(fantasmas, `mapeamentos fantasma: ${fantasmas.join(', ')}`).toEqual([]);
  });

  it('SUBCATEGORIA_ABAS: nenhuma regra aponta para aba inexistente', () => {
    const fantasmas = SUBCATEGORIA_ABAS
      .filter(({ aba }) => !aba.href && !ABAS_REAIS.has(aba.tabValue))
      .map(({ aba }) => aba.tabValue);
    expect(fantasmas).toEqual([]);
  });

  it('ABAS_POR_CODIGO: código e aba são válidos', () => {
    const fantasmas: string[] = [];
    for (const [codigo, abas] of Object.entries(ABAS_POR_CODIGO)) {
      if (!CODIGO_RE.test(codigo)) fantasmas.push(`código malformado: ${codigo}`);
      for (const aba of abas) {
        if (!aba.href && !ABAS_REAIS.has(aba.tabValue)) {
          fantasmas.push(`${codigo} → ${aba.tabValue}`);
        }
      }
    }
    expect(fantasmas).toEqual([]);
  });

  // Regressão do bug encontrado nesta auditoria: 'dadosnovostab.tsx' ainda
  // aponta para a aba 'dados-novos', removida (mergeada em
  // complemento-cerd3). Ver Estatisticas.tsx:31 ("DadosNovosTab removed —
  // merged into ComplementoCerd3Tab").
  it('ARQUIVO_ABAS: toda procedência de ingestão aponta para aba que existe HOJE', () => {
    const fantasmas: string[] = [];
    for (const [arquivo, aba] of Object.entries(ARQUIVO_ABAS)) {
      if (!ABAS_REAIS.has(aba.tabValue)) fantasmas.push(`${arquivo} → ${aba.tabValue}`);
    }
    expect(fantasmas, `procedência aponta para aba removida/inexistente: ${fantasmas.join(', ')}`).toEqual([]);
  });

  it('SUB_INDICADORES: tabValue principal e todo tambemEm apontam para aba real', () => {
    const fantasmas: string[] = [];
    for (const sub of SUB_INDICADORES) {
      for (const aba of abasDoSub(sub)) {
        if (!ABAS_REAIS.has(aba.tabValue)) {
          fantasmas.push(`${sub.codigo}#${sub.sub} → ${aba.tabValue}`);
        }
      }
    }
    expect(fantasmas).toEqual([]);
  });

  it('SUB_INDICADORES: tambemEm nunca repete a própria aba principal', () => {
    const duplicadas = SUB_INDICADORES
      .filter((s) => (s.tambemEm || []).some((t) => t.tabValue === s.tabValue))
      .map((s) => `${s.codigo}#${s.sub}`);
    expect(duplicadas).toEqual([]);
  });

  it('SUB_INDICADORES: todo código segue o formato canônico IND-NNN', () => {
    const invalidos = SUB_INDICADORES.filter((s) => !CODIGO_RE.test(s.codigo)).map((s) => s.codigo);
    expect(invalidos).toEqual([]);
  });

  it('SUB_INDICADORES: um mesmo guarda-chuva nunca é gravado com códigos divergentes', () => {
    const porGuardaChuva = new Map<string, Set<string>>();
    for (const s of SUB_INDICADORES) {
      const chave = norm(s.guardaChuva);
      if (!porGuardaChuva.has(chave)) porGuardaChuva.set(chave, new Set());
      porGuardaChuva.get(chave)!.add(s.codigo);
    }
    const divergentes = [...porGuardaChuva.entries()].filter(([, codigos]) => codigos.size > 1);
    expect(divergentes, `guarda-chuva com códigos divergentes: ${JSON.stringify(divergentes)}`).toEqual([]);
  });
});

describe('indicadorSubs/indCodeAutoTag — nenhum alias/título colide entre subindicadores', () => {
  // indCodeAutoTag e KeywordSearch localizam o bloco certo comparando o
  // texto normalizado do nó do DOM com `titulo`/`aliases`. Se dois
  // subindicadores DIFERENTES usarem o mesmo rótulo normalizado, o selo/
  // deep-link vai para o bloco errado sem que ninguém perceba — por isso
  // esta checagem precisa ser exaustiva (todo par, não amostragem).
  it('nenhum par (titulo/alias) normalizado é compartilhado por subindicadores cuja aba se sobrepõe', () => {
    // indCodeAutoTag filtra por `activeTab` (só varre os subs daquela aba), e
    // KeywordSearch/deep-link resolvem pelo par (tabValue, título). Por isso
    // a colisão só é um bug real quando os dois subindicadores concorrem
    // pela MESMA aba (a interseção de abasDoSub) — mesmo rótulo em abas
    // totalmente distintas não gera ambiguidade de carimbagem/scroll.
    type Dono = { id: string; abas: Set<string> };
    const dono = new Map<string, Dono[]>(); // rótulo normalizado -> donos já vistos
    const colisoes: string[] = [];

    for (const sub of SUB_INDICADORES) {
      const id = `${sub.codigo}#${sub.sub}`;
      const abas = new Set(abasDoSub(sub).map((a) => a.tabValue));
      const rotulos = [sub.titulo, ...(sub.aliases || [])].map(norm).filter(Boolean);
      for (const rotulo of rotulos) {
        const anteriores = dono.get(rotulo) || [];
        for (const anterior of anteriores) {
          if (anterior.id === id) continue;
          const sobrepoe = [...anterior.abas].some((t) => abas.has(t));
          if (sobrepoe) {
            colisoes.push(`"${rotulo}" usado por ${anterior.id} e por ${id} na(s) mesma(s) aba(s)`);
          }
        }
        dono.set(rotulo, [...anteriores, { id, abas }]);
      }
    }
    expect(colisoes, `alias/título colidido: ${colisoes.join(' | ')}`).toEqual([]);
  });

  it('nenhum subindicador tem "sub" duplicado dentro do mesmo guarda-chuva (chave de âncora única)', () => {
    const vistos = new Set<string>();
    const duplicados: string[] = [];
    for (const s of SUB_INDICADORES) {
      const chave = `${s.codigo}#${norm(s.sub)}`;
      if (vistos.has(chave)) duplicados.push(chave);
      vistos.add(chave);
    }
    expect(duplicados).toEqual([]);
  });

  it('todo titulo/alias tem tamanho mínimo (>=9) exigido por indCodeAutoTag para carimbar', () => {
    // src/utils/indCodeAutoTag.ts:62 descarta rótulos curtos (`t.length >= 9`)
    // — um titulo/alias abaixo disso nunca produzirá selo real, tornando a
    // entrada do registro "sustentada apenas em teoria".
    const curtos = SUB_INDICADORES
      .filter((s) => s.titulo.trim().length < 9)
      .map((s) => `${s.codigo}#${s.sub}: "${s.titulo}"`);
    expect(curtos).toEqual([]);
  });
});
