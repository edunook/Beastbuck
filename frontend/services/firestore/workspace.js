import { collection, query, where, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, getDoc, orderBy, limit, addDoc } from 'firebase/firestore';
import { db } from '@services/firebase/config';

export const WorkspaceService = {
  // ---------------------------------------------------------------------------
  // Workspaces
  // ---------------------------------------------------------------------------
  async getUserWorkspaces(userId) {
    // Phase 1: get memberships, then get workspaces
    const membersSnap = await getDocs(query(collection(db, 'workspaceMembers'), where('userId', '==', userId)));
    const workspaceIds = membersSnap.docs.map(d => d.data().workspaceId);
    
    if (workspaceIds.length === 0) return [];
    
    // Chunk array since 'in' query supports max 10
    const chunks = [];
    for (let i = 0; i < workspaceIds.length; i += 10) {
      chunks.push(workspaceIds.slice(i, i + 10));
    }
    
    const workspaces = [];
    for (const chunk of chunks) {
      const wSnap = await getDocs(query(collection(db, 'workspaces'), where('id', 'in', chunk)));
      wSnap.forEach(d => workspaces.push({ ...d.data(), id: d.id }));
    }
    return workspaces;
  },

  async getWorkspace(workspaceId) {
    const snap = await getDoc(doc(db, 'workspaces', workspaceId));
    return snap.exists() ? { ...snap.data(), id: snap.id } : null;
  },

  async createWorkspace(data) {
    const docRef = doc(collection(db, 'workspaces'));
    const id = docRef.id;
    await setDoc(docRef, {
      ...data,
      id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // Add creator as OWNER
    if (data.ownerId) {
      await setDoc(doc(db, 'workspaceMembers', `${id}_${data.ownerId}`), {
        workspaceId: id,
        userId: data.ownerId,
        role: 'OWNER',
        joinedAt: serverTimestamp()
      });
      await this.logActivity(id, data.ownerId, 'CREATED_WORKSPACE');
    }
    
    return id;
  },

  async updateWorkspace(workspaceId, data) {
    await updateDoc(doc(db, 'workspaces', workspaceId), {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  // ---------------------------------------------------------------------------
  // Documents
  // ---------------------------------------------------------------------------
  async getDocuments(workspaceId) {
    const snap = await getDocs(query(collection(db, 'documents'), where('workspaceId', '==', workspaceId), orderBy('lastEditedAt', 'desc')));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
  },

  async getDocument(docId) {
    const snap = await getDoc(doc(db, 'documents', docId));
    return snap.exists() ? { ...snap.data(), id: snap.id } : null;
  },

  async saveDocument(docId, workspaceId, data, isNew = false, userId) {
    const docRef = doc(db, 'documents', docId);
    if (isNew) {
      await setDoc(docRef, {
        ...data,
        id: docId,
        workspaceId,
        createdAt: serverTimestamp(),
        lastEditedAt: serverTimestamp(),
      });
      if (userId) await this.logActivity(workspaceId, userId, 'CREATED_DOCUMENT');
    } else {
      await updateDoc(docRef, {
        ...data,
        lastEditedAt: serverTimestamp(),
      });
      if (userId) await this.logActivity(workspaceId, userId, 'EDITED_DOCUMENT');
    }
  },
  
  async saveDocumentVersion(documentId, content, savedBy) {
    await addDoc(collection(db, 'documentVersions'), {
      documentId,
      content,
      savedBy,
      timestamp: serverTimestamp()
    });
  },
  
  async getDocumentVersions(documentId) {
    const snap = await getDocs(query(collection(db, 'documentVersions'), where('documentId', '==', documentId), orderBy('timestamp', 'desc')));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
  },

  // ---------------------------------------------------------------------------
  // Notes
  // ---------------------------------------------------------------------------
  async getNotes(workspaceId) {
    const snap = await getDocs(query(collection(db, 'notes'), where('workspaceId', '==', workspaceId), orderBy('createdAt', 'desc')));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
  },

  async saveNote(noteId, workspaceId, data, isNew = false, userId) {
    const docRef = doc(db, 'notes', noteId);
    if (isNew) {
      await setDoc(docRef, {
        ...data,
        id: noteId,
        workspaceId,
        createdAt: serverTimestamp(),
      });
      if(userId) await this.logActivity(workspaceId, userId, 'CREATED_NOTE');
    } else {
      await updateDoc(docRef, data);
    }
  },

  async deleteNote(noteId, workspaceId, userId) {
    await deleteDoc(doc(db, 'notes', noteId));
    if(userId) await this.logActivity(workspaceId, userId, 'DELETED_NOTE');
  },

  // ---------------------------------------------------------------------------
  // Research Notebooks
  // ---------------------------------------------------------------------------
  async getNotebooks(workspaceId) {
    const snap = await getDocs(query(collection(db, 'researchNotebooks'), where('workspaceId', '==', workspaceId), orderBy('createdAt', 'desc')));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
  },
  
  async createNotebook(workspaceId, data, userId) {
    const docRef = await addDoc(collection(db, 'researchNotebooks'), {
      ...data,
      workspaceId,
      createdAt: serverTimestamp()
    });
    if(userId) await this.logActivity(workspaceId, userId, 'CREATED_NOTEBOOK');
    return docRef.id;
  },

  async getNotebookEntries(notebookId) {
    const snap = await getDocs(query(collection(db, `researchNotebooks/${notebookId}/entries`), orderBy('timestamp', 'asc')));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
  },

  async saveNotebookEntry(notebookId, entryId, data, isNew = false) {
    const docRef = doc(db, `researchNotebooks/${notebookId}/entries`, entryId);
    if (isNew) {
      await setDoc(docRef, {
        ...data,
        id: entryId,
        timestamp: serverTimestamp()
      });
    } else {
      await updateDoc(docRef, data);
    }
  },

  // ---------------------------------------------------------------------------
  // Whiteboards & Mind Maps (Simple)
  // ---------------------------------------------------------------------------
  async getWhiteboards(workspaceId) {
    const snap = await getDocs(query(collection(db, 'whiteboards'), where('workspaceId', '==', workspaceId), orderBy('createdAt', 'desc')));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
  },

  async saveWhiteboard(boardId, workspaceId, data, isNew = false) {
    const docRef = doc(db, 'whiteboards', boardId);
    if (isNew) {
      await setDoc(docRef, { ...data, id: boardId, workspaceId, createdAt: serverTimestamp() });
    } else {
      await updateDoc(docRef, data);
    }
  },

  async getMindMaps(workspaceId) {
    const snap = await getDocs(query(collection(db, 'mindMaps'), where('workspaceId', '==', workspaceId), orderBy('createdAt', 'desc')));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
  },

  async saveMindMap(mapId, workspaceId, data, isNew = false) {
    const docRef = doc(db, 'mindMaps', mapId);
    if (isNew) {
      await setDoc(docRef, { ...data, id: mapId, workspaceId, createdAt: serverTimestamp() });
    } else {
      await updateDoc(docRef, data);
    }
  },

  // ---------------------------------------------------------------------------
  // Members & Activity
  // ---------------------------------------------------------------------------
  async getMembers(workspaceId) {
    const snap = await getDocs(query(collection(db, 'workspaceMembers'), where('workspaceId', '==', workspaceId)));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
  },

  async addMember(workspaceId, userId, role) {
    await setDoc(doc(db, 'workspaceMembers', `${workspaceId}_${userId}`), {
      workspaceId,
      userId,
      role,
      joinedAt: serverTimestamp()
    });
  },

  async removeMember(workspaceId, userId) {
    await deleteDoc(doc(db, 'workspaceMembers', `${workspaceId}_${userId}`));
  },

  async logActivity(workspaceId, userId, action) {
    await addDoc(collection(db, 'workspaceActivity'), {
      workspaceId,
      userId,
      action,
      timestamp: serverTimestamp()
    });
  },
  
  async getActivity(workspaceId) {
    const snap = await getDocs(query(collection(db, 'workspaceActivity'), where('workspaceId', '==', workspaceId), orderBy('timestamp', 'desc'), limit(50)));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
  }
};
