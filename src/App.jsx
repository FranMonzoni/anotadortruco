import React, { useState } from 'react';
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

  const handleReset = () => {
    resetGame();
    setIsSettingsOpen(false);
  };

  const handleSetMaxPoints = (points) => {
    setMaxPoints(points);
  };

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <h1 className="app-title">
          TRUCO
          <span>Anotador</span>
        </h1>
        <div className="controls-group">
          <button 
            className="btn-text" 
            onClick={() => handleReset()}
            title="Nueva partida"
          >
            🔄 Nuevo
          </button>
          <button 
            className="btn-icon" 
            onClick={() => setIsSettingsOpen(true)}
            title="Configuración"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Main Scoring Board */}
      <ScoreBoard
        nosotrosScore={nosotrosScore}
        ellosScore={ellosScore}
        maxPoints={maxPoints}
        addPoints={addPoints}
        subtractPoint={subtractPoint}
        winner={winner}
      />

      {/* Settings Overlay Drawer */}
      <div className={`settings-drawer ${isSettingsOpen ? 'open' : ''}`}>
        <h2 className="settings-title">Configuración</h2>

        {/* Max Points Config */}
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

        {/* Vibration Config */}
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

        {/* Reset Action */}
        <div className="settings-option" style={{ marginTop: '16px' }}>
          <button className="btn-toggle" style={{ border: '1px solid rgba(229, 115, 115, 0.4)', color: '#e57373' }} onClick={handleReset}>
            Reiniciar Partida
          </button>
        </div>

        <button className="close-settings-btn" onClick={() => setIsSettingsOpen(false)}>
          Listo
        </button>
      </div>

      {/* Footer Info */}
      <footer className="app-footer">
        Fósforos interactivos • Tap (+1) • Mantener (-1) • Doble tap (+2)
      </footer>

      {/* Winner Celebration Modal */}
      <WinnerModal winner={winner} onReset={handleReset} />
    </div>
  );
}
