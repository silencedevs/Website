import { BrandIcon } from './icons';
import { SilenceAction } from './silence-action';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface LiquidMetalHeroProps {
  badge?: string;
  logoSrc?: string;
  copyLoader?: boolean;
  tertiaryCtaHref?: string;
  tertiaryCtaLabel?: string;
  title: string;
  subtitle: string;
  primaryCtaLabel: string;
  secondaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaHref?: string;
  onPrimaryCtaClick?: () => void;
  onSecondaryCtaClick?: () => void;
  features?: string[];
}

export default function LiquidMetalHero({
  badge,
  logoSrc,
  copyLoader,
  tertiaryCtaHref,
  tertiaryCtaLabel,
  title,
  subtitle,
  primaryCtaLabel,
  secondaryCtaLabel,
  primaryCtaHref = '#games',
  secondaryCtaHref,
  onPrimaryCtaClick,
  onSecondaryCtaClick,
  features = [],
}: LiquidMetalHeroProps) {
  return (
    <>
      <section className="liquid-hero relative isolate flex min-h-screen items-center justify-center overflow-hidden text-white" aria-labelledby="hero-title">
        <div className="liquid-content container relative z-10 mx-auto max-w-7xl px-6 text-center lg:px-8">
          {logoSrc && <img className="liquid-logo" src={logoSrc} width={104} height={104} alt="" fetchPriority="high" />}
          {badge && <Badge variant="secondary" className="liquid-badge">{badge}</Badge>}
          <div>
            <h1 id="hero-title" className="liquid-title text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl">{title}</h1>
            <p className="liquid-subtitle rotating-intro">Silence is <strong data-rotating-word>Open Source</strong></p>
          </div>
          <div className="liquid-actions flex flex-col items-center justify-center gap-4 sm:flex-row">
            <div>
              {copyLoader ? <Button size="lg" className="liquid-action liquid-primary" data-copy="loader-code" aria-describedby="hero-copy-feedback">{primaryCtaLabel}</Button> : <SilenceAction href={primaryCtaHref} label={primaryCtaLabel} />}
            </div>
            {secondaryCtaLabel && (secondaryCtaHref || onSecondaryCtaClick) && (
              <div>
                {secondaryCtaHref ? <Button asChild variant="outline" size="lg" className="liquid-action liquid-secondary"><a href={secondaryCtaHref} onClick={onSecondaryCtaClick} rel={secondaryCtaHref.startsWith('https:') ? 'noreferrer' : undefined}><BrandIcon name="github" />{secondaryCtaLabel}</a></Button> : <Button variant="outline" size="lg" className="liquid-action liquid-secondary" onClick={onSecondaryCtaClick}>{secondaryCtaLabel}</Button>}
              </div>
            )}
            {tertiaryCtaHref && <div><Button asChild variant="outline" size="lg" className="liquid-action liquid-secondary"><a href={tertiaryCtaHref} rel="noreferrer"><BrandIcon name="discord" />{tertiaryCtaLabel}</a></Button></div>}
          </div>
          {copyLoader && <><p className="hero-copy-feedback" id="hero-copy-feedback" role="status" aria-live="polite"></p><noscript><p><a href="#loader">View the loadstring</a></p></noscript></>}
          {features.length > 0 && <div className="liquid-features"><div className="grid grid-cols-1 gap-6 md:grid-cols-3">{features.map((feature) => <p key={feature}>{feature}</p>)}</div></div>}
        </div>
      </section>
    </>
  );
}
