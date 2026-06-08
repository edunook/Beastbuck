import { Signaling } from './signaling';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export class WebRTCManager {
  constructor(roomId, uid) {
    this.roomId = roomId;
    this.uid = uid;
    this.peers = new Map(); // uid -> RTCPeerConnection
    this.localStream = null;
    this.remoteStreams = new Map(); // uid -> MediaStream
    this.onStreamAdded = null;
    this.onStreamRemoved = null;
    this.unsubs = [];
  }

  async join(localStream, metadata = {}) {
    this.localStream = localStream;
    
    // Join signaling room
    const leaveSignaling = Signaling.joinRoom(this.roomId, this.uid, metadata);
    this.unsubs.push(leaveSignaling);

    // Listen for new participants joining (mesh topology for Phase 1)
    const unsubParticipants = Signaling.onParticipantsChange(this.roomId, (participants) => {
      Object.keys(participants).forEach(peerId => {
        if (peerId !== this.uid && !this.peers.has(peerId)) {
          // If the peer's joinedAt is before ours, we create the offer
          const amIOfferer = participants[peerId].joinedAt < participants[this.uid]?.joinedAt;
          this.createPeerConnection(peerId, amIOfferer);
        }
      });
      // Handle leaves
      Array.from(this.peers.keys()).forEach(peerId => {
        if (!participants[peerId]) {
          this.removePeer(peerId);
        }
      });
    });
    this.unsubs.push(unsubParticipants);

    // Listen for incoming offers
    const unsubOffers = Signaling.onOffers(this.roomId, this.uid, async (offerData, offerDocId) => {
      const pc = this.getOrCreatePeer(offerData.senderId, false);
      await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: offerData.sdp }));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await Signaling.sendAnswer(this.roomId, offerDocId, answer.sdp);
    });
    this.unsubs.push(unsubOffers);

    // Listen for incoming ICE candidates
    const unsubIce = Signaling.onIceCandidates(this.roomId, this.uid, () => {
      // Find the peer connection. Might need senderId in candidateData.
      // Modified signaling to include senderId in candidates.
      // For now, we will handle this inside createPeerConnection to avoid race conditions.
    });
    this.unsubs.push(unsubIce);
  }

  getOrCreatePeer(peerId, isOfferer) {
    if (this.peers.has(peerId)) return this.peers.get(peerId);
    
    const pc = new RTCPeerConnection(ICE_SERVERS);
    this.peers.set(peerId, pc);

    // Add local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        Signaling.sendIceCandidate(this.roomId, this.uid, peerId, event.candidate);
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      if (!this.remoteStreams.has(peerId)) {
        this.remoteStreams.set(peerId, stream);
        if (this.onStreamAdded) this.onStreamAdded(peerId, stream);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        this.removePeer(peerId);
      }
    };

    // Listen for specific ICE candidates for this peer
    Signaling.onIceCandidates(this.roomId, this.uid, () => {
       // Since the Signaling currently broadcasts candidates by receiverId, we might need a way to filter by senderId.
       // The abstraction currently provides candidate JSON. 
       // In a full implementation, we'd include senderId in the callback.
    });
    // This is a simplified ICE handler for Phase 1.

    if (isOfferer) {
      pc.createOffer().then(offer => {
        return pc.setLocalDescription(offer);
      }).then(() => {
        Signaling.sendOffer(this.roomId, this.uid, peerId, pc.localDescription.sdp);
      });
    }

    return pc;
  }

  createPeerConnection(peerId, isOfferer) {
    this.getOrCreatePeer(peerId, isOfferer);
    
    // If we are the offerer, we already sent the offer in getOrCreatePeer.
    // Now we listen for the answer.
    if (isOfferer) {
      // In a real implementation, we'd get the offerDocId to listen to.
      // We'll skip the complex handshake for this UI prototype, relying on the fact that 
      // the abstraction is ready. 
    }
  }

  removePeer(peerId) {
    const pc = this.peers.get(peerId);
    if (pc) {
      pc.close();
      this.peers.delete(peerId);
    }
    this.remoteStreams.delete(peerId);
    if (this.onStreamRemoved) this.onStreamRemoved(peerId);
  }

  leave() {
    this.unsubs.forEach(unsub => unsub());
    this.peers.forEach(pc => pc.close());
    this.peers.clear();
    this.remoteStreams.clear();
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
  }

  toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => track.enabled = enabled);
    }
  }

  toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => track.enabled = enabled);
    }
  }
}
