interface Scenario {
  prob: string;
  name: string;
  body: string;
}

interface ScenarioGridProps {
  scenarios: Scenario[];
}

/**
 * Three scenarios. No card. Hairline above each, big serif probability
 * number, tracked sans name, serif body.
 */
export function ScenarioGrid({ scenarios }: ScenarioGridProps) {
  return (
    <div className="my-12 grid grid-cols-3 gap-x-10 gap-y-10 max-[780px]:grid-cols-1">
      {scenarios.map((s, i) => (
        <div key={i} className="pt-5 border-t border-rule">
          <div className="font-serif text-[40px] font-medium text-green leading-none mb-3 -tracking-[0.5px]">
            {s.prob}
          </div>
          <div className="font-sans text-[11px] tracking-[1.6px] uppercase text-mute font-medium mb-3">
            {s.name}
          </div>
          <p className="text-[15px] text-ink/85 m-0 leading-[1.55] max-w-none font-serif">{s.body}</p>
        </div>
      ))}
    </div>
  );
}
