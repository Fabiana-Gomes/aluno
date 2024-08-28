// importações realizadas para utilização no código
import io from 'socket.io-client';

// lógica para lidar com WebRTC 
const initializeWebRTC = () => {
  let socket; null;
  let screenStream = null;
  let isSharingScreen = false;

  // Lógica para capturar a mídia de tela
  const captureScreen = async () => {
    try {
      screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      isSharingScreen = true;

      // Conecta ao servidor apenas quando captura a tela
      socket = io('http://192.168.1.46:8000'); // Inicialize o socket aqui
      socket.on('connect', () => {
        console.log('Conectado ao servidor Socket.IO');
        socket.emit('identify', { type: 'student' });
        socket.emit('shareScreen', screenStream); // Envia o stream de tela para o servidor
      });

      // Monitorar desconexão
      socket.on('disconnect', () => {
        console.log('Socket desconectado');
      });

    //stream de tela localmente
      const localVideo = document.createElement('video');
      localVideo.srcObject = screenStream;
      localVideo.autoplay = true;
      localVideo.muted = true; 
      document.body.appendChild(localVideo);
    } catch (err) {
      console.error('Erro ao capturar a tela:', err);
    }
  };

  const sendTestMessage = (message) => {
    if (socket && socket.connected) {
      console.log('Enviando mensagem:', message);
      socket.emit('studentMessage', { message });
    } else {
      console.error('Socket não está conectado. Não foi possível enviar a mensagem:', message);
    }
  };   
  
  // Lógica para iniciar o compartilhamento de tela quando solicitado
  const startScreenShare = () => {
    if (!isSharingScreen) {
      captureScreen();
    }
  };

  return { startScreenShare, sendTestMessage }; // Retorna a função startScreenShare
};

export default initializeWebRTC;