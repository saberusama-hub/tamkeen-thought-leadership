import type { MDXComponents } from 'mdx/types';
import { Eyebrow } from '@/components/Eyebrow';
import { SectionHeader } from '@/components/SectionHeader';
import { PullQuote } from '@/components/exhibits/PullQuote';
import { KpiStrip } from '@/components/exhibits/KpiStrip';
import { Findings } from '@/components/exhibits/Findings';
import { Heatmap } from '@/components/exhibits/Heatmap';
import { VolatilityChart } from '@/components/exhibits/VolatilityChart';
import { DataTable } from '@/components/exhibits/DataTable';
import { StakeholderGrid } from '@/components/exhibits/StakeholderGrid';
import { Exhibit } from '@/components/exhibits/Exhibit';
import { Callout } from '@/components/exhibits/Callout';
import { BarRace } from '@/components/exhibits/charts/BarRace';
import { SVGStackedArea } from '@/components/exhibits/SVGStackedArea';
import { SVGScatter } from '@/components/exhibits/SVGScatter';
import { SVGGainersDecliners } from '@/components/exhibits/SVGGainersDecliners';
import { SVGRisers } from '@/components/exhibits/SVGRisers';
import { SVGGerdScatter } from '@/components/exhibits/SVGGerdScatter';
import { Handoff } from '@/components/Handoff';
import { FullDivider } from '@/components/FullDivider';
import { PillarGrid } from '@/components/exhibits/PillarGrid';
import { ScenarioGrid } from '@/components/exhibits/ScenarioGrid';
import { UAEFootprint } from '@/components/exhibits/UAEFootprint';

export const articleComponents: MDXComponents = {
  Eyebrow,
  SectionHeader,
  PullQuote,
  KpiStrip,
  Findings,
  Heatmap,
  VolatilityChart,
  DataTable,
  StakeholderGrid,
  Exhibit,
  Callout,
  BarRace,
  SVGStackedArea,
  SVGScatter,
  SVGGainersDecliners,
  SVGRisers,
  SVGGerdScatter,
  Handoff,
  FullDivider,
  PillarGrid,
  ScenarioGrid,
  UAEFootprint,
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components, ...articleComponents };
}
