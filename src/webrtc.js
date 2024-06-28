// src/utils/webrtcConnection.js

import io from 'socket.io-client';

export default class WebRTCConnection {
    constructor(signalingChannelUrl) {
        this.signalingChannelUrl = signalingChannelUrl;
        this.peerConnection = null;
        this.localStream = null;
        this.remoteStream = new MediaStream();
        this.socket = null;

        this.initialize();
    }

    initialize() {
        this.socket = io(this.signalingChannelUrl);
        this.socket.on('connect', () => {
            console.log('Conectado ao servidor Socket.IO');
            this.socket.emit('identify', { type: 'student' }); // Identifica-se como aluno ao se conectar
        });

        this.socket.on('message', async (message) => {
            if (message.offer) {
                await this.handleOffer(message.offer);
            } else if (message.answer) {
                await this.handleAnswer(message.answer);
            } else if (message.iceCandidate) {
                await this.handleIceCandidate(message.iceCandidate);
            }
        });

        this.socket.on('disconnect', () => {
            console.log('Desconectado do servidor Socket.IO');
        });
    }

    async startLocalStream() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            return this.localStream;
        } catch (error) {
            console.error('Erro ao capturar mídia local:', error);
            throw error;
        }
    }

    async createPeerConnection() {
        const configuration = {
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        };

        this.peerConnection = new RTCPeerConnection(configuration);

        this.peerConnection.addEventListener('icecandidate', event => {
            if (event.candidate) {
                this.socket.emit('message', { iceCandidate: event.candidate });
            }
        });

        this.peerConnection.addEventListener('track', event => {
            this.remoteStream.addTrack(event.track);
        });

        this.localStream.getTracks().forEach(track => {
            this.peerConnection.addTrack(track, this.localStream);
        });
    }

    async makeCall() {
        try {
            await this.createPeerConnection();
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            this.socket.emit('message', { offer: offer });
        } catch (error) {
            console.error('Erro ao iniciar a chamada:', error);
        }
    }

    async handleOffer(offer) {
        try {
            await this.createPeerConnection();
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            this.socket.emit('message', { answer: answer });
        } catch (error) {
            console.error('Erro ao lidar com a oferta:', error);
        }
    }

    async handleAnswer(answer) {
        try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (error) {
            console.error('Erro ao lidar com a resposta:', error);
        }
    }

    async handleIceCandidate(candidate) {
        try {
            await this.peerConnection.addIceCandidate(candidate);
        } catch (error) {
            console.error('Erro ao adicionar candidato ICE:', error);
        }
    }

    async captureScreen() {
        try {
            this.localStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true // Opcional, dependendo do requisito
            });

            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });

            this.socket.emit('shareScreen', this.localStream);

            // Exibir o stream de tela localmente
            const localVideo = document.createElement('video');
            localVideo.srcObject = this.localStream;
            localVideo.autoplay = true;
            localVideo.muted = true; // Evita eco de áudio se o áudio estiver sendo compartilhado
            document.body.appendChild(localVideo);

            return this.localStream;
        } catch (err) {
            console.error('Erro ao capturar a tela:', err);
            throw err;
        }
    }

    startScreenShare() {
        if (!this.localStream) {
            this.captureScreen();
        }
    }
}
