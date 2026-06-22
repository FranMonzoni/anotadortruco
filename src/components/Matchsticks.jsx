import React from 'react';

// Single box representing up to 5 points
const MatchBox = ({ count, activeAnimation }) => {
  // SVG coordinates for the 5 matches
  // 1: Left vertical
  // 2: Top horizontal
  // 3: Right vertical
  // 4: Bottom horizontal
  // 5: Diagonal (top-left to bottom-right)
  const matches = [
    {
      id: 1,
      // Stick
      x1: 15, y1: 15, x2: 15, y2: 50,
      // Tip
      cx: 15, cy: 15,
    },
    {
      id: 2,
      // Stick
      x1: 15, y1: 15, x2: 50, y2: 15,
      // Tip
      cx: 50, cy: 15,
    },
    {
      id: 3,
      // Stick
      x1: 50, y1: 15, x2: 50, y2: 50,
      // Tip
      cx: 50, cy: 50,
    },
    {
      id: 4,
      // Stick
      x1: 15, y1: 50, x2: 50, y2: 50,
      // Tip
      cx: 15, cy: 50,
    },
    {
      id: 5,
      // Stick
      x1: 15, y1: 15, x2: 50, y2: 50,
      // Tip
      cx: 32, cy: 32, // Place in center of diagonal
    },
  ];

  return (
    <svg viewBox="0 0 65 65" className={`matchstick-svg ${activeAnimation ? 'animate-add' : ''}`}>
      {/* Background Chalk Outlines (guides where matches go) */}
      {matches.map((m) => (
        <line
          key={`guide-${m.id}`}
          x1={m.x1}
          y1={m.y1}
          x2={m.x2}
          y2={m.y2}
          stroke="rgba(252, 250, 242, 0.08)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="2, 2"
        />
      ))}

      {/* Actual Matches */}
      {matches.map((m, idx) => {
        const isActive = count > idx;
        if (!isActive) return null;

        return (
          <g key={`match-${m.id}`}>
            {/* Wooden Stick */}
            <line
              x1={m.x1}
              y1={m.y1}
              x2={m.x2}
              y2={m.y2}
              className="matchstick-line"
              stroke="url(#woodGrad)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Highlight overlay */}
            <line
              x1={m.x1}
              y1={m.y1}
              x2={m.x2}
              y2={m.y2}
              stroke="var(--color-gold)"
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.3"
              style={{ mixBlendMode: 'color-dodge' }}
            />
            {/* Phosphorus Tip */}
            <circle
              cx={m.cx}
              cy={m.cy}
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

      {/* SVG Definitions for Gradients */}
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

export default function Matchsticks({ score, maxPoints, lastAddedTeam }) {
  // If maxPoints is 30, we have malas (0-15) and buenas (16-30)
  // If maxPoints is 15, we just have one set of 15 points
  
  const renderMatchBoxes = (pointsValue) => {
    // We render 3 boxes of 5 for a total of 15 points
    const boxes = [];
    for (let i = 0; i < 3; i++) {
      // Calculate how many matches belong to this box
      const boxScore = Math.max(0, Math.min(5, pointsValue - i * 5));
      
      // Determine if this box was recently updated
      // If the total score matches this box's range, we can trigger animation
      const isLatestBox = pointsValue > i * 5 && pointsValue <= (i + 1) * 5;
      
      boxes.push(
        <MatchBox
          key={i}
          count={boxScore}
          activeAnimation={isLatestBox && boxScore > 0}
        />
      );
    }
    return boxes;
  };

  if (maxPoints === 30) {
    const malasScore = Math.min(15, score);
    const buenasScore = Math.max(0, score - 15);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
        <div className="stage-label">Malas</div>
        <div className="matchsticks-container">
          {renderMatchBoxes(malasScore)}
        </div>

        <div className="stage-label" style={{ marginTop: '24px' }}>Buenas</div>
        <div className="matchsticks-container">
          {renderMatchBoxes(buenasScore)}
        </div>
      </div>
    );
  }

  // 15 points mode
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
      <div className="stage-label">Puntos</div>
      <div className="matchsticks-container">
        {renderMatchBoxes(score)}
      </div>
    </div>
  );
}
