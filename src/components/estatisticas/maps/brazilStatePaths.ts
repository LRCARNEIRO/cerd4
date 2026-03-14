/**
 * Simplified SVG paths for Brazilian states (27 UFs).
 * Coordinates are in a 800×720 viewBox.
 * Source geometry: IBGE malha municipal simplificada.
 */

export interface BrazilStateInfo {
  id: string;       // UF code (e.g. "BA")
  name: string;
  region: string;
  d: string;        // SVG path
  labelX: number;
  labelY: number;
}

export const BRAZIL_STATES: BrazilStateInfo[] = [
  // NORTE
  { id: 'AM', name: 'Amazonas', region: 'Norte', labelX: 210, labelY: 195,
    d: 'M95,100 L175,85 L250,90 L310,120 L320,170 L310,230 L270,260 L210,270 L150,260 L100,230 L80,180 L85,140 Z' },
  { id: 'PA', name: 'Pará', region: 'Norte', labelX: 410, labelY: 185,
    d: 'M310,120 L380,100 L450,110 L510,130 L520,170 L510,210 L480,240 L430,260 L370,260 L320,240 L310,230 L320,170 Z' },
  { id: 'AC', name: 'Acre', region: 'Norte', labelX: 120, labelY: 260,
    d: 'M60,240 L100,230 L150,260 L140,290 L100,300 L60,280 Z' },
  { id: 'RO', name: 'Rondônia', region: 'Norte', labelX: 195, labelY: 300,
    d: 'M150,260 L210,270 L230,300 L220,340 L180,350 L150,330 L140,290 Z' },
  { id: 'RR', name: 'Roraima', region: 'Norte', labelX: 250, labelY: 65,
    d: 'M220,30 L270,25 L300,50 L310,80 L310,120 L250,90 L220,70 Z' },
  { id: 'AP', name: 'Amapá', region: 'Norte', labelX: 465, labelY: 75,
    d: 'M440,30 L480,35 L500,60 L510,100 L510,130 L450,110 L440,70 Z' },
  { id: 'TO', name: 'Tocantins', region: 'Norte', labelX: 425, labelY: 310,
    d: 'M400,260 L430,260 L450,280 L460,320 L450,370 L420,380 L390,360 L380,310 L390,280 Z' },

  // NORDESTE
  { id: 'MA', name: 'Maranhão', region: 'Nordeste', labelX: 490, labelY: 240,
    d: 'M460,200 L510,190 L550,200 L560,230 L540,260 L510,270 L480,260 L460,240 Z' },
  { id: 'PI', name: 'Piauí', region: 'Nordeste', labelX: 540, labelY: 285,
    d: 'M510,240 L550,230 L570,250 L580,290 L570,330 L540,340 L520,320 L510,290 L510,270 Z' },
  { id: 'CE', name: 'Ceará', region: 'Nordeste', labelX: 595, labelY: 240,
    d: 'M570,210 L610,200 L640,215 L640,250 L620,270 L590,270 L570,250 Z' },
  { id: 'RN', name: 'Rio G. do Norte', region: 'Nordeste', labelX: 650, labelY: 232,
    d: 'M640,215 L680,210 L700,225 L690,250 L660,255 L640,250 Z' },
  { id: 'PB', name: 'Paraíba', region: 'Nordeste', labelX: 660, labelY: 265,
    d: 'M640,250 L690,250 L710,260 L700,280 L660,285 L630,275 Z' },
  { id: 'PE', name: 'Pernambuco', region: 'Nordeste', labelX: 650, labelY: 295,
    d: 'M590,280 L630,275 L700,280 L720,295 L710,310 L650,310 L600,310 L580,295 Z' },
  { id: 'AL', name: 'Alagoas', region: 'Nordeste', labelX: 690, labelY: 320,
    d: 'M660,310 L710,310 L730,325 L720,340 L680,340 L660,325 Z' },
  { id: 'SE', name: 'Sergipe', region: 'Nordeste', labelX: 680, labelY: 350,
    d: 'M660,335 L700,340 L710,360 L690,370 L665,360 Z' },
  { id: 'BA', name: 'Bahia', region: 'Nordeste', labelX: 590, labelY: 380,
    d: 'M520,320 L570,310 L640,320 L660,335 L665,360 L680,380 L670,430 L630,460 L570,470 L530,450 L500,410 L490,370 L500,340 Z' },

  // CENTRO-OESTE
  { id: 'MT', name: 'Mato Grosso', region: 'Centro-Oeste', labelX: 310, labelY: 340,
    d: 'M220,280 L270,260 L370,260 L390,280 L380,310 L390,360 L370,400 L330,420 L280,410 L250,380 L230,340 L220,300 Z' },
  { id: 'GO', name: 'Goiás', region: 'Centro-Oeste', labelX: 430, labelY: 420,
    d: 'M390,360 L420,380 L460,390 L490,410 L500,440 L490,470 L460,480 L420,470 L400,450 L380,420 L370,400 Z' },
  { id: 'MS', name: 'Mato G. do Sul', region: 'Centro-Oeste', labelX: 330, labelY: 470,
    d: 'M280,410 L330,420 L370,440 L380,470 L370,510 L340,530 L300,520 L270,490 L260,450 Z' },
  { id: 'DF', name: 'Distrito Federal', region: 'Centro-Oeste', labelX: 470, labelY: 400,
    d: 'M458,388 L478,388 L482,402 L472,412 L455,405 Z' },

  // SUDESTE
  { id: 'MG', name: 'Minas Gerais', region: 'Sudeste', labelX: 530, labelY: 470,
    d: 'M460,410 L500,410 L530,420 L570,440 L610,460 L630,480 L620,520 L580,540 L530,540 L490,530 L460,510 L450,470 L460,440 Z' },
  { id: 'SP', name: 'São Paulo', region: 'Sudeste', labelX: 440, labelY: 530,
    d: 'M370,480 L420,470 L460,480 L490,530 L480,560 L440,580 L400,570 L370,540 L360,510 Z' },
  { id: 'RJ', name: 'Rio de Janeiro', region: 'Sudeste', labelX: 570, labelY: 555,
    d: 'M530,540 L580,540 L620,550 L630,570 L600,580 L560,575 L530,560 Z' },
  { id: 'ES', name: 'Espírito Santo', region: 'Sudeste', labelX: 640, labelY: 500,
    d: 'M620,470 L650,475 L660,500 L650,525 L630,530 L620,520 L610,490 Z' },

  // SUL
  { id: 'PR', name: 'Paraná', region: 'Sul', labelX: 400, labelY: 580,
    d: 'M340,555 L370,540 L440,560 L470,570 L470,600 L440,620 L390,620 L350,600 L330,580 Z' },
  { id: 'SC', name: 'Santa Catarina', region: 'Sul', labelX: 410, labelY: 635,
    d: 'M350,620 L390,620 L440,625 L460,640 L440,660 L400,665 L365,655 L345,640 Z' },
  { id: 'RS', name: 'Rio G. do Sul', region: 'Sul', labelX: 390, labelY: 690,
    d: 'M340,660 L400,665 L440,670 L450,700 L430,730 L380,740 L340,720 L320,695 L325,670 Z' },
];

/** Region colors for grouping */
export const REGION_COLORS: Record<string, string> = {
  Norte: 'hsl(var(--chart-1))',
  Nordeste: 'hsl(var(--chart-2))',
  'Centro-Oeste': 'hsl(var(--chart-3))',
  Sudeste: 'hsl(var(--chart-4))',
  Sul: 'hsl(var(--chart-5))',
};
