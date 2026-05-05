import { Headline } from './Headline';
import { Eyebrow } from './Eyebrow';

interface SectionFrontHeadProps {
  eyebrowNumber?: string;
  eyebrowParts: string[];
  headline: string;
  italic?: string;
  standfirst: string;
  volNumber: string;
  volLine1: string;
  volLine2: string;
}

export function SectionFrontHead({
  eyebrowNumber,
  eyebrowParts,
  headline,
  italic,
  standfirst,
  volNumber,
  volLine1,
  volLine2,
}: SectionFrontHeadProps) {
  return (
    <div className="border-b-[3px] border-double border-tamkeen pb-9 mb-12 grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-14 items-baseline max-[980px]:grid-cols-1 max-[980px]:gap-8">
      <div>
        <Eyebrow number={eyebrowNumber} parts={eyebrowParts} animate />
        <Headline
          text={headline}
          emphasis={italic}
          className="font-serif font-normal text-[64px] leading-[1.05] -tracking-[1.2px] text-tamkeen m-0 mb-4 max-[980px]:text-[44px]"
        />
        <p className="anim-up anim-up-d2 font-serif text-[19px] leading-[1.5] italic text-ink-mid max-w-[50ch] m-0">
          {standfirst}
        </p>
      </div>
      <div className="anim-up anim-up-d2 font-mono text-[11px] text-ink-soft tracking-[0.5px] text-right max-[980px]:text-left">
        <span className="block font-serif text-[96px] font-light text-tamkeen leading-[0.9] mb-2.5">
          {volNumber}
        </span>
        {volLine1}
        <br />
        <span className="opacity-70">{volLine2}</span>
      </div>
    </div>
  );
}
