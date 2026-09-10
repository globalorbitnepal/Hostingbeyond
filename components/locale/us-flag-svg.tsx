/** US flag — 19:10 proportions, clear stars+stripes for circular chip */

const STAR =
  "M0,-1 L0.224,-0.309 L0.951,-0.309 L0.363,0.118 L0.588,0.809 L0,0.382 L-0.588,0.809 L-0.363,0.118 L-0.951,-0.309 L-0.224,-0.309 Z";

/** 5×6 / 4×5 simplified star grid — readable at 24px circle */
const STAR_POS: Array<[number, number]> = (() => {
  const out: Array<[number, number]> = [];
  for (let row = 0; row < 5; row++) {
    const count = row % 2 === 0 ? 6 : 5;
    const y = 0.85 + row * 1.05;
    const startX = row % 2 === 0 ? 0.7 : 1.25;
    for (let col = 0; col < count; col++) {
      out.push([startX + col * 1.15, y]);
    }
  }
  return out;
})();

export function UsFlagSvg({ className }: { className?: string }) {
  const stripe = 10 / 13;
  return (
    <svg
      viewBox="0 0 19 10"
      className={className}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="19" height="10" fill="#B22234" />
      {[1, 3, 5, 7, 9, 11].map((i) => (
        <rect key={i} y={i * stripe} width="19" height={stripe} fill="#fff" />
      ))}
      <rect width="7.6" height={7 * stripe} fill="#3C3B6E" />
      <g fill="#fff">
        {STAR_POS.map(([x, y], i) => (
          <path
            key={i}
            d={STAR}
            transform={`translate(${x} ${y}) scale(0.32)`}
          />
        ))}
      </g>
    </svg>
  );
}
