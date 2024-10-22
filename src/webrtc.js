import io from 'socket.io-client';
import SimplePeer from 'simple-peer';

const initializeWebRTC = () => {
  let socket = io('http://192.168.1.46:8000');
  let isSharingScreen = false;
  let peerConnection = null;

  socket.on('connect', () => {
    console.log('Conectado ao servidor Socket.IO');
    socket.emit('identify', { type: 'student' });
  });

  socket.on('connect_error', (err) => {
    console.error('Erro na conexão do Socket.IO:', err);
  });

  socket.on('disconnect', () => {
    console.log('Socket desconectado');
  });

  const captureScreen = async () => {
    try {
      screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      isSharingScreen = true;
      peerConnection = new RTCPeerConnection();
      screenStream.getTracks().forEach(track => peerConnection.addTrack(track, screenStream));
      peerConnection.createOffer().then(offer => {
        return peerConnection.setLocalDescription(offer);
      }).then(() => {
        socket.emit('offer', { sdp: peerConnection.localDescription });
      });
      socket.on('answer', (data) => {
        peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
      });

      peerConnection.ontrack = (event) => {
        console.log('Stream recebido:', event.streams[0]);
        const remoteVideo = document.createElement('video');
        remoteVideo.srcObject = event.streams[0];
        remoteVideo.autoplay = true;
        remoteVideo.muted = true;
        document.body.appendChild(remoteVideo);
      };

    } catch (err) {
      console.error('Erro ao capturar a tela:', err);
    }
  };

  const startScreenShare = () => {
    if (!isSharingScreen) {
      captureScreen();
    }
  };

  const sendTestMessage = (message) => {
    if (socket.connected) {
      console.log('Enviando mensagem:', message);
      socket.emit('studentMessage', { message });
    } else {
      console.error('Socket não está conectado. Não foi possível enviar a mensagem:', message);
    }
  };

  return { startScreenShare, sendTestMessage };
};

export default initializeWebRTC;