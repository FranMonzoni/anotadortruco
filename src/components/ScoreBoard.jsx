import React, { useState, useRef, useEffect } from 'react';
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
  const bubbleIdCounter = useRef(0);

  // Refs for tracking gestures per team
  const gestureRefs = {
    nosotros: {
      pressTimer: useRef(null),
      tapTimeout: useRef(null),
      lastTapTime: useRef(0),
      isLongPress: useRef(false),
      isActiveTap: useRef(false),
      isActiveLongPress: useRef(false),
    },
    ellos: {
      pressTimer: useRef(null),
      tapTimeout: useRef(null),
      lastTapTime: useRef(0),
      isLongPress: useRef(false),
      isActiveTap: useRef(false),
      isActiveLongPress: useRef(false),
    },
  };

  // State to force visual updates for panel active states
  const [activeStates, setActiveStates] = useState({
    nosotros: { tap: false, longpress: false },
    ellos: { tap: false, longpress: false },
  });

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      Object.keys(gestureRefs).forEach((team) => {
        if (gestureRefs[team].pressTimer.current) clearTimeout(gestureRefs[team].pressTimer.current);
        if (gestureRefs[team].tapTimeout.current) clearTimeout(gestureRefs[team].tapTimeout.current);
      });
    };
  }, []);

  const createBubble = (team, text, type, clientX, clientY, containerRect) => {
    // If clientX/clientY are not provided (e.g. mouse-less edge buttons), center it
    let x = 50; // percentage
    let y = 40; // percentage

    if (clientX !== undefined && clientY !== undefined && containerRect) {
      x = ((clientX - containerRect.left) / containerRect.width) * 100;
      y = ((clientY - containerRect.top) / containerRect.height) * 100;
    }

    const id = bubbleIdCounter.current++;
    setBubbles((prev) => [...prev, { id, team, text, type, x, y }]);

    // Auto-remove bubble
    setTimeout(() => {
      setBubbles((prev) => prev.filter((b) => b.id !== id));
    }, 600);
  };

  const handleStart = (team, e) => {
    if (winner) return;

    // Prevent default touch behaviors (like zoom/scroll) on the touch zones
    if (e.cancelable) {
      e.preventDefault();
    }

    const refs = gestureRefs[team];
    refs.isLongPress.current = false;
    refs.isActiveTap.current = true;

    // Visual feedback for tap start
    setActiveStates((prev) => ({
      ...prev,
      [team]: { ...prev[team], tap: true },
    }));

    // Start long press detection (600ms)
    refs.pressTimer.current = setTimeout(() => {
      refs.isLongPress.current = true;
      refs.isActiveLongPress.current = true;

      // Visual feedback for longpress active
      setActiveStates((prev) => ({
        ...prev,
        [team]: { tap: false, longpress: true },
      }));

      // Subtract point on long press activation
      const success = subtractPoint(team);
      if (success) {
        // Get touch coords if available
        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }
        const containerRect = e.currentTarget.getBoundingClientRect();
        createBubble(team, '-1', 'negative', clientX, clientY, containerRect);
      }
    }, 600);
  };

  const handleEnd = (team, e) => {
    if (winner) return;

    const refs = gestureRefs[team];

    // Clear the long press timer
    if (refs.pressTimer.current) {
      clearTimeout(refs.pressTimer.current);
    }

    // Reset visual feedback
    setActiveStates((prev) => ({
      ...prev,
      [team]: { tap: false, longpress: false },
    }));

    // If it was already processed as a long press, do nothing further
    if (refs.isLongPress.current) {
      refs.isLongPress.current = false;
      return;
    }

    // Touch location
    let clientX, clientY;
    if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const containerRect = e.currentTarget.getBoundingClientRect();

    const now = Date.now();
    const timeDiff = now - refs.lastTapTime.current;

    if (timeDiff > 0 && timeDiff < 250) {
      // Double tap detected
      if (refs.tapTimeout.current) {
        clearTimeout(refs.tapTimeout.current);
      }
      
      const successAmount = addPoints(team, 2);
      if (successAmount > 0) {
        createBubble(team, `+${successAmount}`, 'positive', clientX, clientY, containerRect);
      }
      refs.lastTapTime.current = 0;
    } else {
      // Single tap candidate
      refs.lastTapTime.current = now;
      refs.tapTimeout.current = setTimeout(() => {
        const successAmount = addPoints(team, 1);
        if (successAmount > 0) {
          createBubble(team, '+1', 'positive', clientX, clientY, containerRect);
        }
        refs.lastTapTime.current = 0;
      }, 220);
    }
  };

  const handleCancel = (team) => {
    const refs = gestureRefs[team];
    if (refs.pressTimer.current) clearTimeout(refs.pressTimer.current);
    setActiveStates((prev) => ({
      ...prev,
      [team]: { tap: false, longpress: false },
    }));
  };

  // Helper for direct edge button press
  const handleEdgeButton = (team, action, e) => {
    e.stopPropagation(); // Avoid triggering panel touch handler
    e.preventDefault();

    if (winner) return;

    if (action === 'plus') {
      const successAmount = addPoints(team, 1);
      if (successAmount > 0) {
        createBubble(team, '+1', 'positive');
      }
    } else if (action === 'minus') {
      const success = subtractPoint(team);
      if (success) {
        createBubble(team, '-1', 'negative');
      }
    }
  };

  const showInstructions = nosotrosScore === 0 && ellosScore === 0;

  return (
    <div className="playboard">
      {/* Chalk central divider */}
      <div className="chalk-divider"></div>

      {/* Bubbles Floating Effects */}
      {bubbles.map((b) => (
        <span
          key={b.id}
          className={`point-bubble ${b.type === 'negative' ? 'negative' : ''}`}
          style={{
            left: b.team === 'nosotros' ? `calc(${b.x}% * 0.5)` : `calc(50% + ${b.x}% * 0.5)`,
            top: `${b.y}%`,
          }}
        >
          {b.text}
        </span>
      ))}

      {/* Team Nosotros Panel */}
      <div
        className={`team-panel nosotros ${activeStates.nosotros.tap ? 'active-tap' : ''} ${
          activeStates.nosotros.longpress ? 'active-longpress' : ''
        }`}
        onTouchStart={(e) => handleStart('nosotros', e)}
        onTouchEnd={(e) => handleEnd('nosotros', e)}
        onTouchCancel={() => handleCancel('nosotros')}
        onMouseDown={(e) => handleStart('nosotros', e)}
        onMouseUp={(e) => handleEnd('nosotros', e)}
        onMouseLeave={() => handleCancel('nosotros')}
      >
        <div className="team-header">
          <h2 className="team-name">Nosotros</h2>
          <div className="team-score-num">{nosotrosScore} pts</div>
        </div>

        <div className="score-area">
          <Matchsticks score={nosotrosScore} maxPoints={maxPoints} />
        </div>

        {/* Edge Buttons for Nosotros */}
        <button
          className="edge-btn plus"
          onTouchStart={(e) => handleEdgeButton('nosotros', 'plus', e)}
          onMouseDown={(e) => handleEdgeButton('nosotros', 'plus', e)}
        >
          +
        </button>
        <button
          className="edge-btn minus"
          onTouchStart={(e) => handleEdgeButton('nosotros', 'minus', e)}
          onMouseDown={(e) => handleEdgeButton('nosotros', 'minus', e)}
        >
          -
        </button>
      </div>

      {/* Team Ellos Panel */}
      <div
        className={`team-panel ellos ${activeStates.ellos.tap ? 'active-tap' : ''} ${
          activeStates.ellos.longpress ? 'active-longpress' : ''
        }`}
        onTouchStart={(e) => handleStart('ellos', e)}
        onTouchEnd={(e) => handleEnd('ellos', e)}
        onTouchCancel={() => handleCancel('ellos')}
        onMouseDown={(e) => handleStart('ellos', e)}
        onMouseUp={(e) => handleEnd('ellos', e)}
        onMouseLeave={() => handleCancel('ellos')}
      >
        <div className="team-header">
          <h2 className="team-name">Ellos</h2>
          <div className="team-score-num">{ellosScore} pts</div>
        </div>

        <div className="score-area">
          <Matchsticks score={ellosScore} maxPoints={maxPoints} />
        </div>

        {/* Edge Buttons for Ellos */}
        <button
          className="edge-btn plus"
          onTouchStart={(e) => handleEdgeButton('ellos', 'plus', e)}
          onMouseDown={(e) => handleEdgeButton('ellos', 'plus', e)}
        >
          +
        </button>
        <button
          className="edge-btn minus"
          onTouchStart={(e) => handleEdgeButton('ellos', 'minus', e)}
          onMouseDown={(e) => handleEdgeButton('ellos', 'minus', e)}
        >
          -
        </button>
      </div>

      {/* Instructions Hint */}
      {showInstructions && (
        <div className="gesture-hint">
          Toca para sumar<br />
          Mantené presionado para restar<br />
          Doble tap para +2
        </div>
      )}
    </div>
  );
}
