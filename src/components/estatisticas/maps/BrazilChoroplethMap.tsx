import { useState, useMemo, useEffect } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { cn } from '@/lib/utils';

export interface StateDataEntry {
  uf: string;
  value: number;
  label?: string;
}

interface BrazilChoroplethMapProps {
  data: StateDataEntry[];
  colorScale?: string[];
  title?: string;
  unit?: string;
  className?: string;
}

function interpolateColor(t: number, stops: string[]): string {
  if (stops.length === 2) {
    const [h1, s1, l1] = parseHSL(stops[0]);
    const [h2, s2, l2] = parseHSL(stops[1]);
    const h = h1 + (h2 - h1) * t;
    const s = s1 + (s2 - s1) * t;
    const l = l1 + (l2 - l1) * t;
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
  const segCount = stops.length - 1;
  const seg = Math.min(Math.floor(t * segCount), segCount - 1);
  const localT = (t * segCount) - seg;
  const [h1, s1, l1] = parseHSL(stops[seg]);
  const [h2, s2, l2] = parseHSL(stops[seg + 1]);
  return `hsl(${h1 + (h2 - h1) * localT}, ${s1 + (s2 - s1) * localT}%, ${l1 + (l2 - l1) * localT}%)`;
}

function parseHSL(color: string): [number, number, number] {
  const m = color.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
  if (m) return [+m[1], +m[2], +m[3]];
  return [200, 30, 85];
}

const GEO_URL = '/data/brazil-states.geojson';

export function BrazilChoroplethMap({
  data,
  colorScale = ['hsl(200, 30, 92)', 'hsl(200, 80, 35)'],
  title,
  unit = '',
  className,
}: BrazilChoroplethMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const { dataMap, min, max } = useMemo(() => {
    const map = new Map<string, StateDataEntry>();
    let mn = Infinity, mx = -Infinity;
    for (const d of data) {
      map.set(d.uf, d);
      if (d.value < mn) mn = d.value;
      if (d.value > mx) mx = d.value;
    }
    return { dataMap: map, min: mn, max: mx };
  }, [data]);

  const getColor = (sigla: string) => {
    const entry = dataMap.get(sigla);
    if (!entry) return '#e2e8f0';
    const t = max === min ? 0.5 : (entry.value - min) / (max - min);
    return interpolateColor(t, colorScale);
  };

  const hoveredEntry = hovered ? dataMap.get(hovered) : null;

  return (
    <div className={cn('relative', className)}>
      {title && <p className="text-xs font-semibold text-muted-foreground mb-1 text-center">{title}</p>}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 600,
          center: [-54, -15],
        }}
        width={500}
        height={500}
        style={{ width: '100%', height: 'auto', maxHeight: '420px' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const sigla = geo.properties.sigla;
              const isHovered = hovered === sigla;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getColor(sigla)}
                  stroke="hsl(0, 0%, 100%)"
                  strokeWidth={isHovered ? 2 : 0.8}
                  opacity={hovered && !isHovered ? 0.6 : 1}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', cursor: 'pointer' },
                    pressed: { outline: 'none' },
                  }}
                  onMouseEnter={() => setHovered(sigla)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {/* Tooltip */}
      {hoveredEntry && hovered && (
        <div className="absolute top-2 left-2 bg-card border border-border rounded-lg shadow-lg p-2.5 text-xs z-10 min-w-[140px]">
          <p className="font-bold text-foreground">{hovered}</p>
          <p className="text-primary font-semibold text-sm tabular-nums">
            {hoveredEntry.value.toLocaleString('pt-BR')} {unit}
          </p>
          {hoveredEntry.label && <p className="text-muted-foreground mt-0.5">{hoveredEntry.label}</p>}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-2">
        <span className="text-[10px] text-muted-foreground">{min.toLocaleString('pt-BR')}</span>
        <div className="w-24 h-2.5 rounded-full" style={{
          background: `linear-gradient(to right, ${colorScale.join(', ')})`,
        }} />
        <span className="text-[10px] text-muted-foreground">{max.toLocaleString('pt-BR')}</span>
      </div>
    </div>
  );
}
