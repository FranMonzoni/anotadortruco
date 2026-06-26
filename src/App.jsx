import { useState } from 'react';
import { useGame } from './hooks/useGame';
import ScoreBoard from './components/ScoreBoard';
import WinnerModal from './components/WinnerModal';

export default function App() {
  const {
    nosotrosScore,
    ellosScore,
    maxPoints,
    vibrateEnabled,
    winner,
    addPoints,
    subtractPoint,
    resetGame,
    setMaxPoints,
    toggleVibration,
  } = useGame();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleReset = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    resetGame();
    setIsSettingsOpen(false);
    setIsResetConfirmOpen(false);
  };

  const handleCancelReset = () => {
    setIsResetConfirmOpen(false);
  };

  const handleSetMaxPoints = (points) => {
    setMaxPoints(points);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <button
          className="btn-icon"
          onClick={handleReset}
          title="Nueva partida"
        >
          ↺
        </button>

        <h1 className="app-title">Anotador</h1>

        <button
          className="btn-icon"
          onClick={() => setIsSettingsOpen(true)}
          title="Configuración"
        >
          ☰
        </button>
      </header>

      <ScoreBoard
        nosotrosScore={nosotrosScore}
        ellosScore={ellosScore}
        maxPoints={maxPoints}
        addPoints={addPoints}
        subtractPoint={subtractPoint}
        winner={winner}
      />

      <div className={`settings-drawer ${isSettingsOpen ? 'open' : ''}`}>
        <h2 className="settings-title">Configuración</h2>

        <div className="settings-option">
          <span className="settings-label">Límite de Puntos</span>
          <div className="settings-buttons">
            <button
              className={`btn-toggle ${maxPoints === 15 ? 'active' : ''}`}
              onClick={() => handleSetMaxPoints(15)}
            >
              A 15 pts
            </button>
            <button
              className={`btn-toggle ${maxPoints === 30 ? 'active' : ''}`}
              onClick={() => handleSetMaxPoints(30)}
            >
              A 30 pts
            </button>
          </div>
        </div>

        <div className="settings-option">
          <span className="settings-label">Vibración Táctil</span>
          <div className="settings-buttons">
            <button
              className={`btn-toggle ${vibrateEnabled ? 'active' : ''}`}
              onClick={toggleVibration}
            >
              {vibrateEnabled ? 'Activada' : 'Desactivada'}
            </button>
          </div>
        </div>

        <button className="close-settings-btn" onClick={() => setIsSettingsOpen(false)}>
          Listo
        </button>
      </div>

      <footer className="app-footer">
        <button className="btn-new-game" onClick={handleReset}>
          Nuevo Partido
        </button>
      </footer>

      <WinnerModal winner={winner} onReset={handleReset} />

      {isResetConfirmOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-winner-title">¿Reiniciar?</h2>
            <p className="modal-winner-subtitle">¿Seguro que quiere reiniciar el partido?</p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={handleConfirmReset}>
                Aceptar
              </button>
              <button className="btn-toggle" onClick={handleCancelReset}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
