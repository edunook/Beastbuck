import { ROLES } from '../../constants/roles';

/**
 * Centralized Permission Validator
 * Used by UI components and router to conditionally render features.
 * Matches logic embedded in firestore.rules.
 */
export const hasPermission = (userRole, permissionName) => {
  if (!userRole) return false;

  const permissionMatrix = {
    canManageMembers: [ROLES.MAIN_CEO, ROLES.CO_CEO],
    canAccessCeoPanel: [ROLES.MAIN_CEO, ROLES.CO_CEO],
    canAccessAdmin: [ROLES.MAIN_CEO, ROLES.CO_CEO],
    canDeleteContent: [ROLES.MAIN_CEO, ROLES.CO_CEO, ROLES.LEADER],
    canAssignTasks: [ROLES.MAIN_CEO, ROLES.CO_CEO, ROLES.LEADER],
    canManageRoles: [ROLES.MAIN_CEO],
    canCreateAnnouncements: [ROLES.MAIN_CEO, ROLES.CO_CEO, ROLES.LEADER],
    canManageChannels: [ROLES.MAIN_CEO, ROLES.CO_CEO],
    canManageAnnouncements: [ROLES.MAIN_CEO, ROLES.CO_CEO],
    canModerateChat: [ROLES.MAIN_CEO, ROLES.CO_CEO, ROLES.LEADER],
    canManageExperiments: [ROLES.MAIN_CEO, ROLES.CO_CEO, ROLES.LEADER, ROLES.MEMBER],
    canManageProducts: [ROLES.MAIN_CEO, ROLES.CO_CEO, ROLES.LEADER, ROLES.MEMBER],
    canCreateTeam: [ROLES.MAIN_CEO, ROLES.CO_CEO, ROLES.LEADER, ROLES.MEMBER],
    canManageOrganization: [ROLES.MAIN_CEO, ROLES.CO_CEO, ROLES.LEADER],
    canModerate: [ROLES.MAIN_CEO, ROLES.CO_CEO, ROLES.LEADER],
  };

  const allowedRoles = permissionMatrix[permissionName];
  if (!allowedRoles) {
    console.warn(`Permission ${permissionName} is not defined in permissionMatrix.`);
    return false;
  }

  return allowedRoles.includes(userRole);
};

export const PERMISSIONS = {
  canAccessCeoPanel: (role) => [ROLES.MAIN_CEO, ROLES.CO_CEO].includes(role),
  canManageUsers: (role) => [ROLES.MAIN_CEO, ROLES.CO_CEO].includes(role),
  isOfficialMember: (role) => [ROLES.MAIN_CEO, ROLES.CO_CEO, ROLES.LEADER, ROLES.MEMBER].includes(role),
  isAuthenticated: (role) => role !== ROLES.GUEST,
  isApprovedMember: (role) => [ROLES.MAIN_CEO, ROLES.CO_CEO, ROLES.LEADER, ROLES.MEMBER].includes(role),
};
