import { cn } from "@/lib/utils";

const PETAL = "M0-21C13-31 14-51 0-66C-14-51-13-31 0-21Z";
const SMALL_PETAL = "M0-36C7-42 8-51 0-58C-8-51-7-42 0-36Z";
const SCALLOP =
  "M0 -80Q11.88 -90.22 20.71 -77.27Q34.82 -84.07 40 -69.28Q55.4 -72.2 56.57 -56.57Q72.2 -55.4 69.28 -40Q84.07 -34.82 77.27 -20.71Q90.22 -11.88 80 0Q90.22 11.88 77.27 20.71Q84.07 34.82 69.28 40Q72.2 55.4 56.57 56.57Q55.4 72.2 40 69.28Q34.82 84.07 20.71 77.27Q11.88 90.22 0 80Q-11.88 90.22 -20.71 77.27Q-34.82 84.07 -40 69.28Q-55.4 72.2 -56.57 56.57Q-72.2 55.4 -69.28 40Q-84.07 34.82 -77.27 20.71Q-90.22 11.88 -80 0Q-90.22 -11.88 -77.27 -20.71Q-84.07 -34.82 -69.28 -40Q-72.2 -55.4 -56.57 -56.57Q-55.4 -72.2 -40 -69.28Q-34.82 -84.07 -20.71 -77.27Q-11.88 -90.22 0 -80";
const EIGHT = [0, 45, 90, 135, 180, 225, 270, 315];
const BEADS = Array.from({ length: 24 }, (_, i) => {
  const a = ((i * 15 + 7.5) * Math.PI) / 180;
  return [Math.sin(a) * 95, -Math.cos(a) * 95];
});

/**
 * Nakshi-kantha lotus medallion drawn as running stitches.
 * Stitches use currentColor; the centre dot is the brand's red bindu.
 */
export function Lotus({ className }) {
  return (
    <svg className={cn("lotus block", className)} viewBox="-100 -100 200 200" aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="5 4.2"
      >
        <circle r="15" />
        {EIGHT.map((deg) => (
          <path key={`p${deg}`} d={PETAL} transform={`rotate(${deg})`} />
        ))}
        {EIGHT.map((deg) => (
          <path key={`s${deg}`} d={SMALL_PETAL} transform={`rotate(${deg + 22.5})`} />
        ))}
        <g strokeDasharray="2.5 4">
          {EIGHT.map((deg) => (
            <path key={`r${deg}`} d="M0-29V-55" transform={`rotate(${deg})`} />
          ))}
        </g>
        <circle r="74" />
        <path d={SCALLOP} />
      </g>
      <g fill="currentColor">
        {BEADS.map(([x, y], i) => (
          <circle key={i} cx={x.toFixed(2)} cy={y.toFixed(2)} r="1.9" />
        ))}
      </g>
      <circle r="6.5" fill="var(--bindu)" />
    </svg>
  );
}
