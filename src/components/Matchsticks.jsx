const MatchBox = ({ count, activeAnimation }) => {
  const matches = [
    {
      id: 1,
      x1: 15,
      y1: 15,
      x2: 15,
      y2: 50,
      cx: 15,
      cy: 50,
    },
    {
      id: 2,
      x1: 15,
      y1: 15,
      x2: 50,
      y2: 15,
      cx: 50,
      cy: 15,
    },
    {
      id: 3,
      x1: 50,
      y1: 15,
      x2: 50,
      y2: 50,
      cx: 50,
      cy: 50,
    },
    {
      id: 4,
      x1: 15,
      y1: 50,
      x2: 50,
      y2: 50,
      cx: 50,
      cy: 50,
    },
    {
      id: 5,
      x1: 15,
      y1: 15,
      x2: 50,
      y2: 50,
      cx: 15,
      cy: 15,
    },
  ];

  return (
    <svg viewBox="0 0 65 65" className={`matchstick-svg ${activeAnimation ? 'animate-add' : ''}`}>
      {matches.map((match, idx) => {
        const isActive = count > idx;
        if (!isActive) return null;

        return (
          <g key={`match-${match.id}`}>
            <line
              x1={match.x1}
              y1={match.y1}
              x2={match.x2}
              y2={match.y2}
              className="matchstick-line"
              stroke="url(#woodGrad)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <line
              x1={match.x1}
              y1={match.y1}
              x2={match.x2}
              y2={match.y2}
              stroke="var(--color-gold)"
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.3"
              style={{ mixBlendMode: 'color-dodge' }}
            />
            <circle
              cx={match.cx}
              cy={match.cy}
              r="4.5"
              className="matchstick-tip"
              fill="var(--color-red-tip)"
              stroke="var(--color-gold)"
              strokeWidth="1"
              filter="drop-shadow(0 0 2px var(--color-gold-glow))"
            />
          </g>
        );
      })}

      <defs>
        <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d2a679" />
          <stop offset="50%" stopColor="#b5835a" />
          <stop offset="100%" stopColor="#8d5b34" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default function Matchsticks({ score, maxPoints }) {
  const renderMatchBoxes = (pointsValue) => {
    const boxes = [];

    for (let i = 0; i < 3; i += 1) {
      const boxScore = Math.max(0, Math.min(5, pointsValue - i * 5));
      const isLatestBox = pointsValue > i * 5 && pointsValue <= (i + 1) * 5;

      boxes.push(
        <MatchBox
          key={i}
          count={boxScore}
          activeAnimation={isLatestBox && boxScore > 0}
        />,
      );
    }

    return boxes;
  };

  if (maxPoints === 30) {
    const malasScore = Math.min(15, score);
    const buenasScore = Math.max(0, score - 15);

    return (
      <div className="matchsticks-stage">
        <div className="matchsticks-column">
          {renderMatchBoxes(malasScore)}
        </div>

        <div className="stage-divider" />

        <div className="matchsticks-column">
          {renderMatchBoxes(buenasScore)}
        </div>
      </div>
    );
  }

  return (
    <div className="matchsticks-stage">
      <div className="matchsticks-column">
        {renderMatchBoxes(score)}
      </div>
    </div>
  );
}
