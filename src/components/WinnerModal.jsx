import React from 'react';

export default function WinnerModal({ winner, onReset }) {
  if (!winner) return null;

  const winnerText = winner === 'nosotros' ? '¡Ganamos Nosotros!' : '¡Ganaron Ellos!';
  const subtitleText = winner === 'nosotros' 
    ? '¡Excelente partida! A festejar.' 
    : '¡Más suerte para la próxima!';

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <span className="modal-trophy" role="img" aria-label="Trophy">🏆</span>
        <h2 className="modal-winner-title">{winnerText}</h2>
        <p className="modal-winner-subtitle">{subtitleText}</p>
        
        <div className="modal-actions">
          <button className="btn-primary" onClick={onReset}>
            Nueva Partida
          </button>
        </div>
      </div>
    </div>
  );
}
