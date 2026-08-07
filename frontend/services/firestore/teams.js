import { db } from '@services/firebase/config';
import { collection, addDoc, doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export const TeamsService = {
  /**
   * Create a new team with flexible organization relations
   */
  async createTeam(data, creatorId) {
    const teamsRef = collection(db, 'teams');
    const newTeam = {
      name: data.name || 'Unnamed Team',
      description: data.description || '',
      departmentId: data.departmentId || null,
      labId: data.labId || null,
      projectId: data.projectId || null,
      leaderId: creatorId,
      members: [creatorId], // Creator is always a member
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const docRef = await addDoc(teamsRef, newTeam);
    return docRef.id;
  },

  /**
   * Fetch a specific team
   */
  async getTeam(teamId) {
    const docRef = doc(db, 'teams', teamId);
    const snap = await getDoc(docRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  /**
   * Add a member to a team
   */
  async addMember(teamId, userId) {
    const docRef = doc(db, 'teams', teamId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const members = snap.data().members || [];
      if (!members.includes(userId)) {
        await updateDoc(docRef, {
          members: [...members, userId],
          updatedAt: serverTimestamp()
        });
      }
    }
  },

  /**
   * Update team info
   */
  async updateTeam(teamId, data) {
    const docRef = doc(db, 'teams', teamId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  }
};
