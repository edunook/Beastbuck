import { db, rtdb } from '../firebase/config';
import { collection, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { ref, onValue, set, onDisconnect, remove } from 'firebase/database';

/**
 * Signaling Abstraction Layer
 * Currently uses Firebase Firestore/RTDB for signaling.
 * Can be swapped to Socket.IO, LiveKit, Daily, or Agora without breaking the app.
 */
export const Signaling = {
  // Join a room for signaling (creates RTDB presence node)
  joinRoom(roomId, uid, metadata = {}) {
    const participantRef = ref(rtdb, `signaling/${roomId}/participants/${uid}`);
    set(participantRef, {
      ...metadata,
      joinedAt: Date.now(),
    });
    onDisconnect(participantRef).remove();
    return () => remove(participantRef);
  },

  // Listen for participants joining/leaving
  onParticipantsChange(roomId, callback) {
    const roomRef = ref(rtdb, `signaling/${roomId}/participants`);
    return onValue(roomRef, (snap) => {
      callback(snap.val() || {});
    });
  },

  // Send SDP Offer
  async sendOffer(roomId, senderId, receiverId, sdp) {
    const offerRef = doc(db, `voiceRooms/${roomId}/offers`, `${senderId}_${receiverId}`);
    await setDoc(offerRef, {
      type: 'offer',
      sdp,
      senderId,
      receiverId,
      timestamp: Date.now(),
    });
  },

  // Listen for SDP Offers
  onOffers(roomId, receiverId, callback) {
    const offersRef = collection(db, `voiceRooms/${roomId}/offers`);
    return onSnapshot(offersRef, (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.receiverId === receiverId) {
            callback(data, change.doc.id);
          }
        }
      });
    });
  },

  // Send SDP Answer
  async sendAnswer(roomId, offerDocId, sdp) {
    const offerRef = doc(db, `voiceRooms/${roomId}/offers`, offerDocId);
    await updateDoc(offerRef, {
      answerSdp: sdp,
      answeredAt: Date.now(),
    });
  },

  // Listen for SDP Answer to my offer
  onAnswer(roomId, offerDocId, callback) {
    const offerRef = doc(db, `voiceRooms/${roomId}/offers`, offerDocId);
    return onSnapshot(offerRef, (snap) => {
      const data = snap.data();
      if (data && data.answerSdp) {
        callback(data.answerSdp);
      }
    });
  },

  // Send ICE Candidate
  async sendIceCandidate(roomId, senderId, receiverId, candidate) {
    const candidateRef = doc(collection(db, `voiceRooms/${roomId}/candidates`));
    await setDoc(candidateRef, {
      candidate: JSON.stringify(candidate),
      senderId,
      receiverId,
      timestamp: Date.now(),
    });
  },

  // Listen for ICE Candidates
  onIceCandidates(roomId, receiverId, callback) {
    const candidatesRef = collection(db, `voiceRooms/${roomId}/candidates`);
    return onSnapshot(candidatesRef, (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.receiverId === receiverId) {
            callback(JSON.parse(data.candidate));
          }
        }
      });
    });
  },
};
