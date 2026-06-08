import { db } from './config';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

export const PROJECT_STATUSES = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'];

const DEFAULT_DEPARTMENTS = [
  'Research Division',
  'Engineering Division',
  'Product Development',
  'Creative Studio',
  'Operations Division',
  'AI & Technology Division',
];

function clean(value) {
  return String(value || '').trim();
}

function divisionsRef() { return collection(db, 'divisions'); }
function departmentsRef() { return collection(db, 'departments'); }
function labsRef() { return collection(db, 'labs'); }
function projectsRef() { return collection(db, 'projects'); }
function teamsRef() { return collection(db, 'teams'); }
function announcementsRef() { return collection(db, 'organizationAnnouncements'); }

function normalizeDivision(data) {
  return {
    name: clean(data.name),
    description: clean(data.description),
    leadId: data.leadId || '',
  };
}

function normalizeDepartment(data) {
  return {
    name: clean(data.name),
    description: clean(data.description),
    divisionId: data.divisionId || '',
    leaderId: data.leaderId || '',
    memberCount: Math.max(0, Number(data.memberCount || 0)),
    goals: Array.isArray(data.goals) ? data.goals : [],
    initiatives: Array.isArray(data.initiatives) ? data.initiatives : [],
    milestones: Array.isArray(data.milestones) ? data.milestones : [],
  };
}

function normalizeLab(data) {
  return {
    name: clean(data.name),
    departmentId: data.departmentId || '',
    description: clean(data.description),
    leadId: data.leadId || '',
  };
}

function normalizeProject(data) {
  return {
    title: clean(data.title),
    description: clean(data.description),
    departmentId: data.departmentId || '',
    labId: data.labId || '',
    ownerId: data.ownerId || '',
    memberIds: Array.isArray(data.memberIds) ? data.memberIds : [],
    status: data.status || 'PLANNING',
    projectType: ['STANDARD', 'RESEARCH', 'INVENTION', 'PROTOTYPE'].includes(data.projectType) ? data.projectType : 'STANDARD',
    researchTeamId: data.researchTeamId || '',
    milestones: Array.isArray(data.milestones) ? data.milestones : [],
    progressPercent: Math.min(100, Math.max(0, Number(data.progressPercent || 0))),
    startDate: data.startDate || '',
    targetDate: data.targetDate || '',
    tasks: Array.isArray(data.tasks) ? data.tasks : [],
    files: Array.isArray(data.files) ? data.files : [],
    activity: Array.isArray(data.activity) ? data.activity : [],
  };
}

function activeProject(project) {
  return project.status !== 'ARCHIVED' && project.status !== 'COMPLETED';
}

// Ensure MissionControl is updated on structural changes
async function logOrgChange(type, summary, actorId, targetId, metadata = {}) {
  try {
    await addDoc(collection(db, 'auditLogs'), {
      type,
      summary,
      actorId: actorId || 'SYSTEM',
      targetId: targetId || 'N/A',
      metadata,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error('Failed to log org change', e);
  }
}

export const OrganizationService = {
  defaultDepartmentNames: DEFAULT_DEPARTMENTS,

  async createDivision(data, actorId) {
    const division = normalizeDivision(data);
    if (!division.name || !division.description) throw new Error('Division name and description required.');
    
    const docRef = await addDoc(divisionsRef(), {
      ...division,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    await logOrgChange('UNIT_CREATED', `Division ${division.name} created`, actorId, docRef.id);
    return docRef.id;
  },

  async createDepartment(data, actorId) {
    const department = normalizeDepartment(data);
    if (!department.name || !department.description) {
      throw new Error('Department name and description are required.');
    }

    const docRef = await addDoc(departmentsRef(), {
      ...department,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await logOrgChange('UNIT_CREATED', `Department ${department.name} created`, actorId, docRef.id);
    return docRef.id;
  },

  async updateDepartment(id, data, actorId) {
    const department = normalizeDepartment(data);
    await updateDoc(doc(db, 'departments', id), {
      ...department,
      updatedAt: serverTimestamp()
    });
    await logOrgChange('UNIT_UPDATED', `Department ${department.name} updated`, actorId, id);
  },

  async createLab(data, actorId) {
    const lab = normalizeLab(data);
    if (!lab.name || !lab.description) {
      throw new Error('Lab name and description are required.');
    }

    const docRef = await addDoc(labsRef(), {
      ...lab,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await logOrgChange('UNIT_CREATED', `Lab ${lab.name} created`, actorId, docRef.id);
    return docRef.id;
  },

  async createProject(data) {
    const project = normalizeProject(data);
    if (!project.title || !project.ownerId) {
      throw new Error('Project title and owner are required.');
    }

    const memberIds = [...new Set([project.ownerId, ...project.memberIds].filter(Boolean))];
    const docRef = await addDoc(projectsRef(), {
      ...project,
      memberIds,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  },

  async updateProject(projectId, data) {
    const project = normalizeProject(data);
    const memberIds = [...new Set([project.ownerId, ...project.memberIds].filter(Boolean))];
    await updateDoc(doc(db, 'projects', projectId), {
      ...project,
      memberIds,
      updatedAt: serverTimestamp(),
    });
  },

  async publishAnnouncement(data, actorId) {
    if (!data.title || !data.content) throw new Error("Title and content required.");
    const docRef = await addDoc(announcementsRef(), {
      title: clean(data.title),
      content: clean(data.content),
      pinned: !!data.pinned,
      scheduledFor: data.scheduledFor || null,
      expiresAt: data.expiresAt || null,
      authorId: actorId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async archiveDivision(divisionId, actorId) {
    await updateDoc(doc(db, 'divisions', divisionId), {
      archived: true,
      updatedAt: serverTimestamp(),
    });
    await logOrgChange('UNIT_ARCHIVED', `Division archived`, actorId, divisionId);
  },

  async archiveDepartment(departmentId, actorId) {
    await updateDoc(doc(db, 'departments', departmentId), {
      archived: true,
      updatedAt: serverTimestamp(),
    });
    await logOrgChange('UNIT_ARCHIVED', `Department archived`, actorId, departmentId);
  },

  async archiveLab(labId, actorId) {
    await updateDoc(doc(db, 'labs', labId), {
      archived: true,
      updatedAt: serverTimestamp(),
    });
    await logOrgChange('UNIT_ARCHIVED', `Lab archived`, actorId, labId);
  },

  async archiveProject(projectId) {
    await updateDoc(doc(db, 'projects', projectId), {
      status: 'ARCHIVED',
      updatedAt: serverTimestamp(),
    });
  },

  async getOrganization() {
    const [divisionSnap, departmentSnap, labSnap, teamSnap, projectSnap, announcementSnap] = await Promise.all([
      getDocs(query(divisionsRef(), orderBy('createdAt', 'desc'), limit(50))),
      getDocs(query(departmentsRef(), orderBy('createdAt', 'desc'), limit(100))),
      getDocs(query(labsRef(), orderBy('createdAt', 'desc'), limit(100))),
      getDocs(query(teamsRef(), orderBy('createdAt', 'desc'), limit(100))),
      getDocs(query(projectsRef(), orderBy('createdAt', 'desc'), limit(200))),
      getDocs(query(announcementsRef(), orderBy('createdAt', 'desc'), limit(20))),
    ]);

    return {
      divisions: divisionSnap.docs.map(item => ({ id: item.id, ...item.data() })),
      departments: departmentSnap.docs.map(item => ({ id: item.id, ...item.data() })),
      labs: labSnap.docs.map(item => ({ id: item.id, ...item.data() })),
      teams: teamSnap.docs.map(item => ({ id: item.id, ...item.data() })),
      projects: projectSnap.docs.map(item => ({ id: item.id, ...item.data() })),
      announcements: announcementSnap.docs.map(item => ({ id: item.id, ...item.data() })),
    };
  },

  async getMemberAffiliations(uid) {
    if (!uid) return { divisions: [], departments: [], labs: [], teams: [], activeProjects: [] };

    const organization = await this.getOrganization();
    
    const activeProjects = organization.projects.filter(project =>
      activeProject(project) && (
        project.ownerId === uid ||
        (Array.isArray(project.memberIds) && project.memberIds.includes(uid))
      )
    );
    
    const teamIds = new Set();
    organization.teams.forEach(t => {
      if ((t.members || []).includes(uid)) teamIds.add(t.id);
    });

    const departmentIds = new Set(activeProjects.map(project => project.departmentId).filter(Boolean));
    const labIds = new Set(activeProjects.map(project => project.labId).filter(Boolean));
    const divisionIds = new Set();

    for (const department of organization.departments) {
      if (department.leaderId === uid) {
        departmentIds.add(department.id);
        if (department.divisionId) divisionIds.add(department.divisionId);
      }
    }
    for (const lab of organization.labs) {
      if (lab.leadId === uid) {
        labIds.add(lab.id);
        if (lab.departmentId) departmentIds.add(lab.departmentId);
      }
    }
    
    for (const div of organization.divisions) {
      if (div.leadId === uid) {
        divisionIds.add(div.id);
      }
    }

    return {
      divisions: organization.divisions.filter(d => divisionIds.has(d.id)),
      departments: organization.departments.filter(department => departmentIds.has(department.id)),
      labs: organization.labs.filter(lab => labIds.has(lab.id)),
      teams: organization.teams.filter(team => teamIds.has(team.id)),
      activeProjects,
    };
  },
};
