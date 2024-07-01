// importações realizadas para utilização no código
import React, { useEffect, useState } from 'react';
import initializeWebRTC from './webrtc';

// funções para inicializar o compartilhamento de tela
function App() {
  const [isSharing, setIsSharing] = useState(false);
  const { startScreenShare } = initializeWebRTC(); 

  // Limpar eventuais recursos ao desmontar o componente, se necessário
  useEffect(() => {
    return () => {
    };
  }, []);

  // ao clicar no botão de compartilhar tela esta função inicia
  const handleShareScreen = () => {
    startScreenShare();
    setIsSharing(true);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Aplicação do Aluno</h1>
        <button onClick={handleShareScreen} disabled={isSharing}>
          {isSharing ? 'Compartilhando...' : 'Iniciar Compartilhamento'}
        </button>
        {isSharing && <p>Compartilhando tela com o servidor</p>}
      </header>
    </div>
  );
}

export default App;