'use client';
interface Props {
  label: string;
  value: number;
  color?: string;
}
export default function LiveMetricBar({ label, value, color = '#2563EB' }: Props) {
  const pct = Math.round(value * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="font-bold text-slate-500">{label}</span>
        <span className="font-mono font-bold text-slate-800">{pct}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden bg-slate-200">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
      </div>
    </div>
  );
}
