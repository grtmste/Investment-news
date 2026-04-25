export default function Sparkline({ data, positive, width = 80, height = 30 }) {
  if (!data || data.length < 2) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <line
          x1="0" y1={height / 2} x2={width} y2={height / 2}
          stroke="#30363d" strokeWidth="1" strokeDasharray="2,2"
        />
      </svg>
    );
  }

  const clean = data.filter((v) => v != null && !isNaN(v));
  if (clean.length < 2) return null;

  const min = Math.min(...clean);
  const max = Math.max(...clean);
  const range = max - min || 1;
  const pad = 2;

  const points = clean
    .map((val, i) => {
      const x = (i / (clean.length - 1)) * width;
      const y = height - pad - ((val - min) / range) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // Build fill area path
  const firstX = 0;
  const lastX = width;
  const fillPath = `M${firstX},${height} L${points.split(' ').join(' L')} L${lastX},${height} Z`;

  const color = positive ? '#3fb950' : '#f85149';
  const fillColor = positive ? 'rgba(63,185,80,0.12)' : 'rgba(248,81,73,0.12)';

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', overflow: 'visible' }}>
      <path d={fillPath} fill={fillColor} />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
      {/* End dot */}
      {(() => {
        const lastPoint = points.split(' ').pop()?.split(',');
        if (!lastPoint) return null;
        return (
          <circle cx={lastPoint[0]} cy={lastPoint[1]} r="2" fill={color} />
        );
      })()}
    </svg>
  );
}
