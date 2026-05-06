interface HeadlineProps {
  text: string;
  emphasis?: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
}

/**
 * Splits a headline on the emphasis word and sets it in italic serif.
 * No animation. No copper highlight. Asterisk-style restraint.
 */
export function Headline({ text, emphasis, className = '', as: Tag = 'h1' }: HeadlineProps) {
  if (!emphasis) return <Tag className={className}>{text}</Tag>;
  const i = text.toLowerCase().indexOf(emphasis.toLowerCase());
  if (i < 0) return <Tag className={className}>{text}</Tag>;
  const before = text.slice(0, i);
  const word = text.slice(i, i + emphasis.length);
  const after = text.slice(i + emphasis.length);
  return (
    <Tag className={className}>
      {before}
      <em className="italic font-normal">{word}</em>
      {after}
    </Tag>
  );
}
