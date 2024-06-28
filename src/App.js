import React, { useState } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';

const App = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [socket, setSocket] = useState(null);
  let peer = null;

  const startSharing = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setSocket(io('http://192.168.1.46:8000')); // Conectar ao servidor

      peer = new SimplePeer({ initiator: true, trickle: false, stream });

      peer.on('signal', (data) => {
        socket.emit('offer', { signal: data });
      });

      setIsSharing(true);
    } catch (error) {
      console.error('Erro ao iniciar o compartilhamento de tela:', error);
    }
  };

  return (
    <div>
      <h1>Aluno - Compartilhamento de Tela</h1>
      {!isSharing && (
        <button onClick={startSharing}>Iniciar Compartilhamento</button>
      )}
    </div>
  );
};

export default App;
