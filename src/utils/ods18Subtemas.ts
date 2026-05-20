// ──────────────────────────────────────────────────────────────────
// Classificador ODS 18 — Igualdade Étnico-Racial (ODSR/UFPB)
// ──────────────────────────────────────────────────────────────────
// Mapeia cada indicador ODS Racial (id slug) ao seu subtema 18.X
// conforme a taxonomia da Plataforma ODSR/UFPB:
//   18.1 Trabalho · 18.2 Segurança Pública · 18.3 Justiça
//   18.4 Representatividade · 18.5 Reparação · 18.6 Habitação
//   18.7 Saúde · 18.8 Educação · 18.10 Xenofobia
//
// Cobertura: 93/93 indicadores espelhados.

export type Ods18Subtema =
  | '18.1'
  | '18.2'
  | '18.3'
  | '18.4'
  | '18.5'
  | '18.6'
  | '18.7'
  | '18.8'
  | '18.10';

export const ODS18_SUBTEMAS: { id: Ods18Subtema; label: string; color: string }[] = [
  { id: '18.1', label: '18.1 Trabalho', color: 'hsl(25, 75%, 45%)' },
  { id: '18.2', label: '18.2 Segurança Pública', color: 'hsl(0, 70%, 45%)' },
  { id: '18.3', label: '18.3 Justiça', color: 'hsl(220, 60%, 45%)' },
  { id: '18.4', label: '18.4 Representatividade', color: 'hsl(280, 50%, 45%)' },
  { id: '18.5', label: '18.5 Reparação', color: 'hsl(330, 55%, 45%)' },
  { id: '18.6', label: '18.6 Habitação', color: 'hsl(195, 60%, 40%)' },
  { id: '18.7', label: '18.7 Saúde', color: 'hsl(150, 55%, 38%)' },
  { id: '18.8', label: '18.8 Educação', color: 'hsl(45, 80%, 40%)' },
  { id: '18.10', label: '18.10 Xenofobia', color: 'hsl(15, 60%, 35%)' },
];

const ID_TO_SUBTEMA: Record<string, Ods18Subtema> = {
  // 18.1 Trabalho (12)
  rais_9_2: '18.1', rais_10_28: '18.1', rais_10_2: '18.1', rais_8_25: '18.1',
  rais_10_3: '18.1', rais_10_7: '18.1', rais_8_1: '18.1', rais_10_6: '18.1',
  rais_10_1: '18.1', rais_2_2: '18.1', rais_1_2: '18.1', rais_8_24: '18.1',

  // 18.2 Segurança Pública (13)
  sim_3_7: '18.2', sim_16_2: '18.2', sinan_16_1: '18.2', sim_16_1: '18.2',
  sim_16_5: '18.2', sinan_5_1: '18.2', sim_16_3: '18.2', sinan_5_2: '18.2',
  sinan_16_4: '18.2', sim_16_4: '18.2', sinan_16_3: '18.2', sinan_16_2: '18.2',
  sinan_16_5: '18.2',

  // 18.3 Justiça (5)
  rais_10_12: '18.3', rais_8_2: '18.3', rais_10_19: '18.3', rais_10_24: '18.3',
  rais_10_16: '18.3',

  // 18.4 Representatividade (16)
  rais_8_5: '18.4', rais_8_3: '18.4', rais_5_1: '18.4', rais_10_10: '18.4',
  rais_8_4: '18.4', tse_10_4: '18.4', rais_1_1: '18.4', rais_9_1: '18.4',
  tse_5_7: '18.4', rais_10_20: '18.4', tse_5_1: '18.4', tse_10_1: '18.4',
  tse_10_7: '18.4', rais_8_6: '18.4', rais_2_1: '18.4', tse_5_4: '18.4',

  // 18.5 Reparação (6)
  cadunico_1_3: '18.5', cadunico_1_1: '18.5', cadunico_1_4: '18.5',
  rais_5_3: '18.5', rais_5_2: '18.5', cadunico_1_2: '18.5',

  // 18.6 Habitação (11)
  ceb_escolas_4_5: '18.6', sim_11_2: '18.6', ceb_escolas_4_6: '18.6',
  ceb_escolas_4_4: '18.6', sim_6_1: '18.6', ceb_escolas_4_2: '18.6',
  ceb_escolas_4_3: '18.6', sih_3_6: '18.6', sim_11_1: '18.6',
  ceb_escolas_4_1: '18.6', sih_3_1: '18.6',

  // 18.7 Saúde (18)
  sim_3_3: '18.7', sim_3_4: '18.7', sih_3_2: '18.7', sinasc_3_2: '18.7',
  sim_3_1: '18.7', sim_3_10: '18.7', sim_3_6: '18.7', sih_3_5: '18.7',
  sim_3_9: '18.7', sinasc_3_3: '18.7', sinasc_3_4: '18.7', sih_3_3: '18.7',
  sinasc_3_1: '18.7', sih_3_4: '18.7', sim_3_5: '18.7', sim_3_2: '18.7',
  sim_3_8: '18.7', sim_3_11: '18.7',

  // 18.8 Educação (11)
  ideb_4_2: '18.8', ceb_afd_4_2: '18.8', enem_4_6: '18.8', ceb_afd_4_1: '18.8',
  cs_cursos_4_4: '18.8', cs_cursos_4_3: '18.8', ceb_afd_4_3: '18.8',
  ideb_4_3: '18.8', ceb_afd_4_4: '18.8', cs_cursos_4_1: '18.8', ideb_4_1: '18.8',

  // 18.10 Xenofobia (1)
  rais_8_26: '18.10',
};

export function getOds18Subtema(odsId: string | undefined | null): Ods18Subtema | null {
  if (!odsId) return null;
  return ID_TO_SUBTEMA[odsId] ?? null;
}

export function getSubtemaLabel(subtema: Ods18Subtema): string {
  return ODS18_SUBTEMAS.find((s) => s.id === subtema)?.label ?? subtema;
}

export function getSubtemaColor(subtema: Ods18Subtema): string {
  return ODS18_SUBTEMAS.find((s) => s.id === subtema)?.color ?? 'hsl(0, 0%, 50%)';
}
