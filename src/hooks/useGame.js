import { useEffect, useState } from 'react';

const STORAGE_KEY = 'truco_score_board_state';

const DEFAULT_STATE = {
  nosotros: 0,
  ellos: 0,
  maxPoints: 30,
  vibrateEnabled: true,
};

export function useGame() {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          typeof parsed.nosotros === 'number' &&
          typeof parsed.ellos === 'number' &&
          (parsed.maxPoints === 15 || parsed.maxPoints === 30)
        ) {
          return {
            ...DEFAULT_STATE,
            ...parsed,
          };
        }
      }
    } catch (error) {
      console.error('Failed to parse Truco state from LocalStorage', error);
    }

    return DEFAULT_STATE;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const winner =
    state.nosotros >= state.maxPoints
      ? 'nosotros'
      : state.ellos >= state.maxPoints
        ? 'ellos'
        : null;

  const vibratePattern = (pattern) => {
    if (state.vibrateEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        console.warn('Vibration not supported or allowed yet', error);
      }
    }
  };

  const addPoints = (team, amount = 1) => {
    if (winner) return false;

    let pointsAdded = 0;
    setState((prev) => {
      const current = prev[team];
      if (current >= prev.maxPoints) return prev;

      const target = Math.min(prev.maxPoints, current + amount);
      pointsAdded = target - current;

      if (pointsAdded > 0) {
        if (target >= prev.maxPoints) {
          vibratePattern([200, 100, 200, 100, 300]);
        } else if (amount === 2) {
          vibratePattern([40, 50, 40]);
        } else {
          vibratePattern(40);
        }
      }

      return {
        ...prev,
        [team]: target,
      };
    });

    return pointsAdded;
  };

  const subtractPoint = (team) => {
    if (winner) return false;

    let pointsSubtracted = 0;
    setState((prev) => {
      const current = prev[team];
      if (current <= 0) return prev;

      pointsSubtracted = 1;
      vibratePattern([80]);

      return {
        ...prev,
        [team]: current - 1,
      };
    });

    return pointsSubtracted;
  };

  const resetGame = () => {
    setState((prev) => ({
      ...prev,
      nosotros: 0,
      ellos: 0,
    }));
    vibratePattern([100, 50, 100]);
  };

  const setMaxPoints = (points) => {
    if (points !== 15 && points !== 30) return;

    setState((prev) => ({
      ...prev,
      maxPoints: points,
      nosotros: 0,
      ellos: 0,
    }));
    vibratePattern(80);
  };

  const toggleVibration = () => {
    setState((prev) => {
      const nextVibrate = !prev.vibrateEnabled;
      if (nextVibrate && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }

      return {
        ...prev,
        vibrateEnabled: nextVibrate,
      };
    });
  };

  return {
    nosotrosScore: state.nosotros,
    ellosScore: state.ellos,
    maxPoints: state.maxPoints,
    vibrateEnabled: state.vibrateEnabled,
    winner,
    addPoints,
    subtractPoint,
    resetGame,
    setMaxPoints,
    toggleVibration,
  };
}
