interface Scenario {
  prob: string;
  name: string;
  body: string;
}

interface ScenarioGridProps {
  scenarios: Scenario[];
}

export function ScenarioGrid({ scenarios }: ScenarioGridProps) {
  return (
    <div className="grid grid-cols-3 gap-5 my-[30px] max-[780px]:grid-cols-1">
      {scenarios.map((s, i) => (
        <div key={i} className="px-6 py-7 bg-paper/[.04] border border-paper/20 relative">
          <div className="font-serif text-[38px] font-semibold text-paper leading-none mb-1.5 -tracking-[1px]">
            {s.prob}
          </div>
          <div className="font-sans text-[11px] tracking-[1.8px] uppercase text-tamkeen-light font-bold mb-3.5">
            {s.name}
          </div>
          <p className="text-[13.5px] text-paper/[.82] m-0 leading-[1.55] max-w-none font-serif">{s.body}</p>
        </div>
      ))}
    </div>
  );
}
