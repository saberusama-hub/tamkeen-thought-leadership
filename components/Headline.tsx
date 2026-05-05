import type { ReactNode } from 'react';

interface HeadlineProps {
  text: string;
  emphasis?: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
  animate?: boolean;
}

export function Headline({
  text,
  emphasis,
  className = '',
  as: Tag = 'h1',
  animate = true,
}: HeadlineProps) {
  const wipeClass = animate ? 'anim-wipe' : '';
  const emClass = animate ? 'anim-emphasis' : '';

  if (!emphasis) {
    return (
      <Tag className={className}>
        <span className={wipeClass} style={{ display: 'inline-block' }}>
          {text}
        </span>
      </Tag>
    );
  }
  const i = text.toLowerCase().indexOf(emphasis.toLowerCase());
  if (i < 0) {
    return (
      <Tag className={className}>
        <span className={wipeClass} style={{ display: 'inline-block' }}>
          {text}
        </span>
      </Tag>
    );
  }

  const before = text.slice(0, i);
  const word = text.slice(i, i + emphasis.length);
  const after = text.slice(i + emphasis.length);

  const parts: ReactNode[] = [];
  if (before) {
    parts.push(
      <span key="b" className={wipeClass} style={{ display: 'inline-block' }}>
        {before}
      </span>,
    );
  }
  parts.push(
    <em
      key="e"
      className={`italic text-accent-deep font-normal ${emClass}`}
      style={{ display: 'inline-block' }}
    >
      {word}
    </em>,
  );
  if (after) {
    parts.push(
      <span
        key="a"
        className={wipeClass}
        style={{ display: 'inline-block', animationDelay: '0.15s' }}
      >
        {after}
      </span>,
    );
  }

  return <Tag className={className}>{parts}</Tag>;
}
