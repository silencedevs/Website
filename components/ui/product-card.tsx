import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

// Adapted from deltacomponents' compound Product Card on 21st.dev (demo 28199).
export function ProductCard({ className, ...props }: ComponentProps<'article'>) {
  return <article data-slot="product-card" className={cn('game-entry game-tile', className)} {...props} />;
}
export function ProductCardImage({ src, alt, href }: { src: string; alt: string; href: string }) {
  return <a data-slot="product-card-image" className="game-picture game-tile-picture" href={href} aria-label={`View ${alt} script details`}><img data-slot="product-card-img" src={src} alt={`${alt} game artwork`} width={768} height={432} loading="lazy" decoding="async" /></a>;
}
export function ProductCardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="product-card-content" className={cn('game-info game-tile-content', className)} {...props} />;
}
export function ProductCardTitle({ className, ...props }: ComponentProps<'h3'>) {
  return <h3 data-slot="product-card-title" className={className} {...props} />;
}
export function ProductCardSubtitle({ className, ...props }: ComponentProps<'p'>) {
  return <p data-slot="product-card-subtitle" className={cn('game-tile-description', className)} {...props} />;
}

export interface CatalogueGame {
  gameId: number;
  name: string;
  image: string;
  summary: string;
  status: 'available' | 'outdated' | 'pending';
  features: string[];
}
export function GameCards({ games, base }: { games: CatalogueGame[]; base: string }) {
  return <>{games.map((game) => {
    const href = `${base}games/${game.gameId}/`;
    const outdated = game.status === 'outdated';
    const label = {available:'Available',outdated:'Outdated',pending:'Details pending'}[game.status];
    return <ProductCard key={game.gameId} data-game="" data-status={game.status} data-search={`${game.name} ${game.gameId} ${game.features.join(' ')}`.toLowerCase()} aria-labelledby={`game-${game.gameId}`}>
      <ProductCardImage src={`${base}${game.image}`} alt={game.name} href={href} />
      <ProductCardContent>
        <ProductCardTitle id={`game-${game.gameId}`}>{game.name}</ProductCardTitle>
        <p className={cn('game-status', outdated && 'status-outdated')}>{label}</p>
        <ProductCardSubtitle>{game.summary}</ProductCardSubtitle>
        {game.features.length > 0 && <p className="game-tile-features">{game.features.slice(0,3).join(' · ')}</p>}
        <div className="game-action"><a className="text-link" href={href}>{outdated ? 'View Script' : 'View Script'}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg></a></div>
      </ProductCardContent>
    </ProductCard>;
  })}</>;
}

export interface CatalogueProject {
  slug: string;
  name: string;
  summary: string;
  description: string;
  features: string[];
  image?: string;
  links: {label: string; url: string}[];
}
export function ProjectCards({ projects, base }: { projects: CatalogueProject[]; base: string }) {
  return <>{projects.map((project) => <ProductCard key={project.slug} aria-labelledby={`project-${project.slug}`}>
    {project.image && <a className="game-picture game-tile-picture" href={`${base}projects/${project.slug}/`} aria-label={`View ${project.name}`}><img src={`${base}${project.image}`} alt={`${project.name} project preview`} width={768} height={432} loading="lazy" decoding="async" /></a>}
    <ProductCardContent><ProductCardTitle id={`project-${project.slug}`}>{project.name}</ProductCardTitle><ProductCardSubtitle>{project.summary}</ProductCardSubtitle>
      {project.features.length > 0 && <p className="game-tile-features">{project.features.slice(0, 3).join(' · ')}</p>}
      <div className="game-action"><a className="text-link" href={`${base}projects/${project.slug}/`}>View project</a></div>
    </ProductCardContent>
  </ProductCard>)}</>;
}
