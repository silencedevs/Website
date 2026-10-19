import type { ReactNode } from 'react';
import { SilenceAction } from './silence-action';
import { cn } from '@/lib/utils';

// Adapted from mohit_464e30a8's NavBar on 21st.dev (demo 32097).
export interface NavLink { label: string; href: string }
export interface NavBarProps {
  logo: ReactNode;
  homeHref: string;
  links: NavLink[];
  cta: NavLink;
  className?: string;
}

export function NavBar({ logo, homeHref, links, cta, className }: NavBarProps) {
  return (
    <header className={cn('site-header frame studio-header', className)}>
      <a className="brand" href={homeHref} aria-label="Silence home">{logo}</a>
      <nav className="studio-desktop-nav" aria-label="Main navigation">
        {links.map((link) => <a key={link.href} href={link.href} rel={link.href.startsWith('https:') ? 'noreferrer' : undefined}>{link.label}</a>)}
      </nav>
      <SilenceAction className="studio-primary-action" href={cta.href} label={cta.label} />
      <details className="studio-mobile-menu">
        <summary aria-label="Open navigation menu"><span>Menu</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 8h16M4 16h16" /></svg></summary>
        <nav aria-label="Mobile navigation">
          {links.map((link) => <a key={link.href} href={link.href} rel={link.href.startsWith('https:') ? 'noreferrer' : undefined}>{link.label}</a>)}
          <SilenceAction className="studio-menu-action" href={cta.href} label={cta.label} />
        </nav>
      </details>
    </header>
  );
}

export function SilenceNavigation({ base, discord, repository, hasProjects }: { base: string; discord: string; repository: string; hasProjects: boolean }) {
  return <NavBar homeHref={base} logo={<><img src={`${base}assets/favicon.png`} width={38} height={38} alt="" />Silence</>} links={[{label:'Home',href:base},{label:'Loadstring',href:`${base}#loader`},{label:'Games',href:`${base}games/`},...(hasProjects ? [{label:'Projects',href:`${base}#projects`}] : []),{label:'Questions',href:`${base}#questions`},{label:'About',href:`${base}#about`}]} cta={{label:'Join Discord',href:discord}} />;
}
