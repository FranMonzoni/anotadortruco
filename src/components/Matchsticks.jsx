const MatchBox = ({ count, activeAnimation }) => {
  // Classic tally mark layout: square box with diagonal
  const matches = [
    { id: 1, className: 'match vertical match-1' },
    { id: 2, className: 'match horizontal match-2' },
    { id: 3, className: 'match vertical match-3' },
    { id: 4, className: 'match horizontal match-4' },
    { id: 5, className: 'match diagonal match-5' },
  ];

  return (
    <div className={`matchstick-box ${activeAnimation ? 'animate-add' : ''}`}>
      {matches.map((match, idx) => {
        const isActive = count > idx;
        if (!isActive) return null;

        return (
          <div
            key={`match-${match.id}`}
            className={match.className}
          />
        );
      })}
    </div>
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
