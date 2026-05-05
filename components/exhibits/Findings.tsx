interface Finding {
  title: string;
  body: string;
}

interface FindingsProps {
  items: Finding[];
}

export function Findings({ items }: FindingsProps) {
  return (
    <div className="my-8 columns-2 gap-12 [column-rule:1px_solid_var(--color-rule)] max-[880px]:columns-1 max-[880px]:[column-rule:none]">
      {items.map((item, i) => (
        <div
          key={i}
          className="break-inside-avoid mb-6 pb-4 border-b border-rule-soft last:border-b-0"
        >
          <div className="font-mono text-[11px] text-copper-deep tracking-[1.5px] font-bold mb-1.5">
            FINDING {String(i + 1).padStart(2, '0')}
          </div>
          <h4 className="m-0 mb-2 font-serif text-[19px] font-semibold normal-case tracking-[-0.2px] text-tamkeen leading-[1.3]">
            {item.title}
          </h4>
          <p className="m-0 text-[15.5px] leading-[1.55] text-ink max-w-none">{item.body}</p>
        </div>
      ))}
    </div>
  );
}
