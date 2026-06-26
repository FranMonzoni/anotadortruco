import { useEffect, useRef, useState } from 'react';
import Matchsticks from './Matchsticks';

export default function ScoreBoard({
  nosotrosScore,
  ellosScore,
  maxPoints,
  addPoints,
  subtractPoint,
  winner,
}) {
  const [bubbles, setBubbles] = useState([]);
  const [activeStates, setActiveStates] = useState({
    nosotros: { tap: false, longpress: false },
    ellos: { tap: false, longpress: false },
  });

  const bubbleIdCounter = useRef(0);
  const pressTimers = useRef({ nosotros: null, ellos: null });
  const tapTimers = useRef({ nosotros: null, ellos: null });
  const lastTapTimes = useRef({ nosotros: 0, ellos: 0 });
  const longPressStates = useRef({ nosotros: false, ellos: false });
  const activePressStates = useRef({ nosotros: false, ellos: false });

  useEffect(() => {
    const currentPressTimers = pressTimers.current;
    const currentTapTimers = tapTimers.current;

    return () => {
      Object.values(currentPressTimers).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
      Object.values(currentTapTimers).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  const createBubble = (team, text, type, clientX, clientY, containerRect) => {
    let x = 50;
    let y = 40;

    if (clientX !== undefined && clientY !== undefined && containerRect) {
      x = ((clientX - containerRect.left) / containerRect.width) * 100;
      y = ((clientY - containerRect.top) / containerRect.height) * 100;
    }

    const id = bubbleIdCounter.current;
    bubbleIdCounter.current += 1;
    setBubbles((prev) => [...prev, { id, team, text, type, x, y }]);

    setTimeout(() => {
      setBubbles((prev) => prev.filter((bubble) => bubble.id !== id));
    }, 600);
  };

  const setTeamActiveState = (team, state) => {
    setActiveStates((prev) => ({
      ...prev,
      [team]: state,
    }));
  };

  const getPointerPosition = (event, source = 'current') => {
    if (source === 'changed' && event.changedTouches?.length > 0) {
      return {
        clientX: event.changedTouches[0].clientX,
        clientY: event.changedTouches[0].clientY,
      };
    }

    if (event.touches?.length > 0) {
      return {
        clientX: event.touches[0].clientX,
        clientY: event.touches[0].clientY,
      };
    }

    return {
      clientX: event.clientX,
      clientY: event.clientY,
    };
  };

  const clearPressTimer = (team) => {
    if (pressTimers.current[team]) {
      clearTimeout(pressTimers.current[team]);
      pressTimers.current[team] = null;
    }
  };

  const handleStart = (team, event) => {
    if (winner) return;

    if (event.cancelable) {
      event.preventDefault();
    }

    activePressStates.current[team] = true;
    longPressStates.current[team] = false;
    setTeamActiveState(team, { tap: true, longpress: false });

    pressTimers.current[team] = setTimeout(() => {
      longPressStates.current[team] = true;
      setTeamActiveState(team, { tap: false, longpress: true });

      const success = subtractPoint(team);
      if (success) {
        const { clientX, clientY } = getPointerPosition(event);
        const containerRect = event.currentTarget.getBoundingClientRect();
        createBubble(team, '-1', 'negative', clientX, clientY, containerRect);
      }
    }, 600);
  };

  const handleEnd = (team, event) => {
    if (winner) return;
    if (!activePressStates.current[team]) return;

    activePressStates.current[team] = false;
    clearPressTimer(team);
    setTeamActiveState(team, { tap: false, longpress: false });

    if (longPressStates.current[team]) {
      longPressStates.current[team] = false;
      return;
    }

    const { clientX, clientY } = getPointerPosition(event, 'changed');
    const containerRect = event.currentTarget.getBoundingClientRect();
    const now = Date.now();
    const timeDiff = now - lastTapTimes.current[team];

    if (timeDiff > 0 && timeDiff < 250) {
      if (tapTimers.current[team]) {
        clearTimeout(tapTimers.current[team]);
        tapTimers.current[team] = null;
      }

      const successAmount = addPoints(team, 2);
      if (successAmount > 0) {
        createBubble(team, `+${successAmount}`, 'positive', clientX, clientY, containerRect);
      }
      lastTapTimes.current[team] = 0;
    } else {
      lastTapTimes.current[team] = now;
      tapTimers.current[team] = setTimeout(() => {
        const successAmount = addPoints(team, 1);
        if (successAmount > 0) {
          createBubble(team, '+1', 'positive', clientX, clientY, containerRect);
        }
        lastTapTimes.current[team] = 0;
        tapTimers.current[team] = null;
      }, 220);
    }
  };

  const handleCancel = (team) => {
    activePressStates.current[team] = false;
    longPressStates.current[team] = false;
    clearPressTimer(team);
    setTeamActiveState(team, { tap: false, longpress: false });
  };

  const handleEdgeButton = (team, action, event) => {
    event.stopPropagation();
    event.preventDefault();

    if (winner) return;

    if (action === 'plus') {
      const successAmount = addPoints(team, 1);
      if (successAmount > 0) {
        createBubble(team, '+1', 'positive');
      }
      return;
    }

    const success = subtractPoint(team);
    if (success) {
      createBubble(team, '-1', 'negative');
    }
  };

  const stopEdgeButtonRelease = (event) => {
    event.stopPropagation();
    event.preventDefault();
  };

  const showInstructions = nosotrosScore === 0 && ellosScore === 0;

  return (
    <div className="playboard">
      <div className="chalk-divider" />

      {bubbles.map((bubble) => (
        <span
          key={bubble.id}
          className={`point-bubble ${bubble.type === 'negative' ? 'negative' : ''}`}
          style={{
            left:
              bubble.team === 'nosotros'
                ? `calc(${bubble.x}% * 0.5)`
                : `calc(50% + ${bubble.x}% * 0.5)`,
            top: `${bubble.y}%`,
          }}
        >
          {bubble.text}
        </span>
      ))}

      <div
        className={`team-panel nosotros ${activeStates.nosotros.tap ? 'active-tap' : ''} ${
          activeStates.nosotros.longpress ? 'active-longpress' : ''
        }`}
        onPointerDown={(event) => handleStart('nosotros', event)}
        onPointerUp={(event) => handleEnd('nosotros', event)}
        onPointerCancel={() => handleCancel('nosotros')}
        onMouseLeave={() => handleCancel('nosotros')}
      >
        <div className="team-header">
          <h2 className="team-name">Nos:</h2>
          <div className="team-score-num">{nosotrosScore} pts</div>
        </div>
        <div className="team-header-divider" />

        <div className="score-area">
          <Matchsticks score={nosotrosScore} maxPoints={maxPoints} />
        </div>

        <div className="edge-controls left">
          <button
            type="button"
            className="edge-btn plus"
            onPointerDown={(event) => handleEdgeButton('nosotros', 'plus', event)}
            onPointerUp={stopEdgeButtonRelease}
            onClick={(event) => event.stopPropagation()}
          >
            +
          </button>
          <button
            type="button"
            className="edge-btn minus"
            onPointerDown={(event) => handleEdgeButton('nosotros', 'minus', event)}
            onPointerUp={stopEdgeButtonRelease}
            onClick={(event) => event.stopPropagation()}
          >
            -
          </button>
        </div>
      </div>

      <div
        className={`team-panel ellos ${activeStates.ellos.tap ? 'active-tap' : ''} ${
          activeStates.ellos.longpress ? 'active-longpress' : ''
        }`}
        onPointerDown={(event) => handleStart('ellos', event)}
        onPointerUp={(event) => handleEnd('ellos', event)}
        onPointerCancel={() => handleCancel('ellos')}
        onMouseLeave={() => handleCancel('ellos')}
      >
        <div className="team-header">
          <h2 className="team-name">Ellos:</h2>
          <div className="team-score-num">{ellosScore} pts</div>
        </div>
        <div className="team-header-divider" />

        <div className="score-area">
          <Matchsticks score={ellosScore} maxPoints={maxPoints} />
        </div>

        <div className="edge-controls right">
          <button
            type="button"
            className="edge-btn plus"
            onPointerDown={(event) => handleEdgeButton('ellos', 'plus', event)}
            onPointerUp={stopEdgeButtonRelease}
            onClick={(event) => event.stopPropagation()}
          >
            +
          </button>
          <button
            type="button"
            className="edge-btn minus"
            onPointerDown={(event) => handleEdgeButton('ellos', 'minus', event)}
            onPointerUp={stopEdgeButtonRelease}
            onClick={(event) => event.stopPropagation()}
          >
            -
          </button>
        </div>
      </div>

      {showInstructions && (
        <div className="gesture-hint">
          Toca para sumar
          <br />
          Mantené presionado para restar
          <br />
          Doble tap para +2
        </div>
      )}
    </div>
  );
}
