import { renderToString } from 'react-dom/server';
import LiquidMetalHero, { type LiquidMetalHeroProps } from '@/components/ui/liquid-metal-hero';
import { SilenceNavigation } from '@/components/ui/navbar';
import { SilenceAction, type SilenceActionProps } from '@/components/ui/silence-action';
import { GameCards, ProjectCards } from '@/components/ui/product-card';
import type { ComponentProps } from 'react';

export function renderHero(props: LiquidMetalHeroProps) {
  return renderToString(<LiquidMetalHero {...props} />, {identifierPrefix: 'hero'});
}
export function renderNavigation(props: ComponentProps<typeof SilenceNavigation>) {
  return renderToString(<SilenceNavigation {...props} />, {identifierPrefix: 'nav'});
}
export function renderGameCards(props: ComponentProps<typeof GameCards>) {
  return renderToString(<GameCards {...props} />);
}
export function renderProjectCards(props: ComponentProps<typeof ProjectCards>) {
  return renderToString(<ProjectCards {...props} />);
}

let actionId = 0;
export function renderAction(props: SilenceActionProps) { return renderToString(<SilenceAction {...props} />, {identifierPrefix: `action${actionId++}`}); }
