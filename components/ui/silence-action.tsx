import { DestinationIcon } from './icons';
import ShinyButton from './shiny-button';

export interface SilenceActionProps { label: string; href: string; className?: string }
export function SilenceAction({ label, href, className = '' }: SilenceActionProps) {
  const external = href.startsWith('https:');
  return <><span className={`action-host ${className}`} data-action-url={href}>
    <ShinyButton icon={<DestinationIcon href={href} />} compact={className.includes("studio-")} label={label} fillColor="#000000" accentColor="#ff0000" accentSoftColor="#ff0000" />

  </span><noscript><a href={href} rel={external ? 'noreferrer' : undefined}>{label}</a></noscript></>;
}
