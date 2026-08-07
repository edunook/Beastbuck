import { db } from '@services/firebase/config';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  startAfter,
} from 'firebase/firestore';
import { calculateLevel } from './gamification';

function docsFrom(snap) {
  return snap.docs.map(item => ({ id: item.id, ...item.data() }));
}

function countActive(items, archivedField = 'status') {
  return items.filter(item => item[archivedField] !== 'ARCHIVED' && !item.archived).length;
}

export const ADMIN_PERMISSIONS = [
  'canAccessCeoPanel',
  'canManageMembers',
  'canManageRoles',
  'canModerateContent',
  'canManageGamification',
  'canManageOrganization',
  'canManageSecurity',
  'canViewAnalytics',
];

export const DEFAULT_ADMIN_ROLES = [
  { id: 'main-ceo', name: 'Main CEO', permissions: ADMIN_PERMISSIONS },
  { id: 'co-ceo', name: 'Co-CEO', permissions: ADMIN_PERMISSIONS.filter(item => item !== 'canManageRoles') },
  { id: 'leader', name: 'Leader', permissions: ['canModerateContent', 'canManageOrganization'] },
  { id: 'member', name: 'Member', permissions: [] },
];

export const AUDIT_TYPES = {
  MEMBER_UPDATED: 'Member Updated',
  ROLE_CHANGED: 'Role Changed',
  ROLE_DELETED: 'Role Deleted',
  CONTENT_MODERATED: 'Content Moderated',
  XP_CHANGED: 'XP Changed',
  ACHIEVEMENT_GRANTED: 'Achievement Granted',
  ACHIEVEMENT_REMOVED: 'Achievement Removed',
  BADGE_GRANTED: 'Badge Granted',
  SECURITY_CHANGED: 'Security Changed',
  PROJECT_ACTION: 'Project Action',
  ORG_ACTION: 'Organization Action',
};

export const AdminService = {
  async logAudit({ type, actorId, targetId = '', summary, metadata = {} }) {
    await addDoc(collection(db, 'auditLogs'), {
      type,
      actorId,
      targetId,
      summary,
      metadata,
      createdAt: serverTimestamp(),
    });
  },

  async getDashboardData() {
    const [
      users,
      projects,
      experiments,
      products,
      tasks,
      applications,
      aiKnowledge,
      activity,
      audit,
    ] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'projects')),
      getDocs(collection(db, 'experiments')),
      getDocs(collection(db, 'products')),
      getDocs(collection(db, 'tasks')),
      getDocs(collection(db, 'membershipApplications')),
      getDocs(collection(db, 'aiKnowledge')),
      getDocs(query(collection(db, 'activityLogs'), orderBy('timestamp', 'desc'), limit(10))),
      getDocs(query(collection(db, 'auditLogs'), orderBy('createdAt', 'desc'), limit(10))),
    ]);

    const members = docsFrom(users);
    const projectItems = docsFrom(projects);
    const experimentItems = docsFrom(experiments);
    const productItems = docsFrom(products);
    const taskItems = docsFrom(tasks);
    const applicationItems = docsFrom(applications);

    return {
      metrics: {
        totalMembers: members.length,
        onlineMembers: members.filter(member => member.presence === 'online').length,
        activeProjects: countActive(projectItems),
        experiments: countActive(experimentItems),
        products: countActive(productItems),
        tasks: taskItems.length,
        applications: applicationItems.filter(item => item.status === 'PENDING' || item.status === 'MORE_INFO').length,
        aiUsage: aiKnowledge.size,
      },
      recentActivity: docsFrom(activity),
      auditLogs: docsFrom(audit),
    };
  },

  async getMembers() {
    const snap = await getDocs(collection(db, 'users'));
    return docsFrom(snap).sort((a, b) => (a.displayName || a.username || '').localeCompare(b.displayName || b.username || ''));
  },

  async updateMember(uid, patch, actorId, summary = 'Member updated') {
    await updateDoc(doc(db, 'users', uid), {
      ...patch,
      updatedAt: serverTimestamp(),
    });
    await this.logAudit({ type: 'MEMBER_UPDATED', actorId, targetId: uid, summary, metadata: patch });
  },

  async approveMember(uid, actorId) {
    await this.updateMember(uid, { role: 'Member', suspended: false, removed: false }, actorId, 'Member approved');
  },

  async suspendMember(uid, actorId) {
    await this.updateMember(uid, { suspended: true }, actorId, 'Member suspended');
  },

  async removeMember(uid, actorId) {
    await this.updateMember(uid, { removed: true, suspended: true }, actorId, 'Member removed');
  },

  async promoteMember(uid, role, actorId) {
    await this.updateMember(uid, { role }, actorId, `Member promoted to ${role}`);
  },

  async assignDepartment(uid, departmentId, actorId) {
    await this.updateMember(uid, { departmentId }, actorId, 'Department assigned');
  },

  async assignLab(uid, labId, actorId) {
    await this.updateMember(uid, { labId }, actorId, 'Lab assigned');
  },

  async assignSpecialization(uid, specializationId, actorId) {
    await updateDoc(doc(db, 'users', uid), {
      specializations: arrayUnion(specializationId),
      updatedAt: serverTimestamp(),
    });
    await this.logAudit({ type: 'BADGE_GRANTED', actorId, targetId: uid, summary: 'Specialization assigned', metadata: { specializationId } });
  },

  async getRoles() {
    const snap = await getDocs(collection(db, 'adminRoles'));
    const stored = docsFrom(snap);
    const merged = new Map(DEFAULT_ADMIN_ROLES.map(role => [role.id, role]));
    for (const role of stored) merged.set(role.id, { ...merged.get(role.id), ...role });
    return [...merged.values()];
  },

  async saveRole(role, actorId) {
    const id = (role.id || role.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await setDoc(doc(db, 'adminRoles', id), {
      name: role.name,
      permissions: role.permissions || [],
      updatedAt: serverTimestamp(),
      createdAt: role.createdAt || serverTimestamp(),
    }, { merge: true });
    await this.logAudit({ type: 'ROLE_CHANGED', actorId, targetId: id, summary: `Role saved: ${role.name}`, metadata: role });
  },

  async deleteRole(roleId, actorId) {
    await deleteDoc(doc(db, 'adminRoles', roleId));
    await this.logAudit({ type: 'ROLE_DELETED', actorId, targetId: roleId, summary: 'Role deleted' });
  },

  async getContent() {
    const [experiments, products, resources] = await Promise.all([
      getDocs(query(collection(db, 'experiments'), orderBy('createdAt', 'desc'), limit(100))),
      getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(100))),
      getDocs(query(collection(db, 'resources'), orderBy('createdAt', 'desc'), limit(100))),
    ]);
    return {
      experiments: docsFrom(experiments),
      products: docsFrom(products),
      resources: docsFrom(resources),
      comments: [],
    };
  },

  async moderateContent({ collectionName, id, action, actorId }) {
    const ref = doc(db, collectionName, id);
    if (action === 'delete') {
      await deleteDoc(ref);
    } else if (action === 'feature') {
      const snap = await getDoc(ref);
      await updateDoc(ref, { featured: !snap.data()?.featured, updatedAt: serverTimestamp() });
    } else if (action === 'archive') {
      await updateDoc(ref, { status: 'ARCHIVED', updatedAt: serverTimestamp() });
    } else if (action === 'restore') {
      const restoreStatus = collectionName === 'products' ? 'SHOWCASE' : collectionName === 'experiments' ? 'PLANNING' : null;
      await updateDoc(ref, { ...(restoreStatus ? { status: restoreStatus } : {}), archived: false, updatedAt: serverTimestamp() });
    }
    await this.logAudit({ type: 'CONTENT_MODERATED', actorId, targetId: `${collectionName}/${id}`, summary: `${action} ${collectionName}` });
  },

  async adjustXP(uid, amount, actorId, reason = 'Admin XP adjustment') {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    const current = Number(snap.data()?.xp || 0);
    const nextXP = Math.max(0, current + Number(amount || 0));
    await updateDoc(userRef, { xp: nextXP, level: calculateLevel(nextXP), updatedAt: serverTimestamp() });
    await this.logAudit({ type: 'XP_CHANGED', actorId, targetId: uid, summary: reason, metadata: { amount, nextXP } });
  },

  async grantAchievement(uid, achievement, actorId) {
    await updateDoc(doc(db, 'users', uid), {
      achievements: arrayUnion(achievement),
      updatedAt: serverTimestamp(),
    });
    await this.logAudit({ type: 'ACHIEVEMENT_GRANTED', actorId, targetId: uid, summary: `Achievement granted: ${achievement.title}` });
  },

  async removeAchievement(uid, achievementId, actorId) {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    const achievements = snap.data()?.achievements || [];
    const match = achievements.find(item => (typeof item === 'string' ? item : item.id) === achievementId);
    if (match) {
      await updateDoc(userRef, { achievements: arrayRemove(match), updatedAt: serverTimestamp() });
    }
    await this.logAudit({ type: 'ACHIEVEMENT_REMOVED', actorId, targetId: uid, summary: `Achievement removed: ${achievementId}` });
  },

  async getAnalytics() {
    const [users, projects, xpLogs, activity, experiments, products] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'projects')),
      getDocs(collection(db, 'xpLogs')),
      getDocs(query(collection(db, 'activityLogs'), orderBy('timestamp', 'desc'), limit(200))),
      getDocs(collection(db, 'experiments')),
      getDocs(collection(db, 'products')),
    ]);
    return {
      members: docsFrom(users),
      projects: docsFrom(projects),
      xpLogs: docsFrom(xpLogs),
      activity: docsFrom(activity),
      experiments: docsFrom(experiments),
      products: docsFrom(products),
    };
  },

  async getAuditLogs({ pageSize = 50, lastDoc = null, filterType = '' } = {}) {
    let q;
    const constraints = [orderBy('createdAt', 'desc'), limit(pageSize)];
    if (filterType) constraints.splice(1, 0, where('type', '==', filterType));
    if (lastDoc) constraints.push(startAfter(lastDoc));
    q = query(collection(db, 'auditLogs'), ...constraints);
    const snap = await getDocs(q);
    return {
      logs: docsFrom(snap),
      lastDoc: snap.docs[snap.docs.length - 1] || null,
    };
  },

  async getSecurityConfig() {
    const snap = await getDoc(doc(db, 'config', 'security'));
    return snap.exists() ? snap.data() : { maintenanceMode: false, registrationLock: false, applicationLock: false };
  },

  async updateSecurityConfig(config, actorId) {
    await setDoc(doc(db, 'config', 'security'), {
      ...config,
      updatedAt: serverTimestamp(),
      updatedBy: actorId,
    }, { merge: true });
    await this.logAudit({ type: 'SECURITY_CHANGED', actorId, summary: 'Security config updated', metadata: config });
  },
};
