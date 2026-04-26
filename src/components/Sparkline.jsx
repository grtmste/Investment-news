export default function Sparkline({ data, positive, width = 80, height = 28 }) {
  const clean = (data || []).filter(v => v != null && !isNaN(v));

  if (clean.length < 2) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <line x1="0" y1={height / 2} x2={width} y2={height / 2}
          stroke="var(--border)" strokeWidth="1" strokeDasharray="2,2" />
      </svg>
    );
  }

  const min = Math.min(...clean);
  const max = Math.max(...clean);
  const range = max - min || 1;
  const pad = 2;

  const pts = clean.map((v, i) => {
    const x = (i / (clean.length - 1)) * width;
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return [x.toFixed(1), y.toFixed(1)];
  });

  const polyline = pts.map(p => p.join(',')).join(' ');
  const fill = `M0,${height} L${pts.map(p => `${p[0]},${p[1]}`).join(' L')} L${width},${height} Z`;
  const color  = positive ? 'var(--green)' : 'var(--red)';
  const fillC  = positive ? 'rgba(46,204,113,0.1)' : 'rgba(231,76,60,0.1)';
  const last   = pts[pts.length - 1];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', overflow: 'visible' }}>
      <path d={fill} fill={fillC} />
      <polyline fill="none" stroke={color} strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round" points={polyline} />
      <circle cx={last[0]} cy={last[1]} r="2" fill={color} />
    </svg>
  );
}
