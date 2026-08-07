import { ROLES } from '@shared/constants/roles';
import { errorHandler } from '@shared/utils/errorHandler';

/**
 * Centralized Permission Validator
 * Used by UI components and router to conditionally render features.
 * Matches logic embedded in firestore.rules.
 */
export const hasPermission = (userRole, permissionName) => {
  if (!userRole) return false;

  // Normalize role for case-insensitive matching
  const normalizedRole = userRole?.toLowerCase().trim();
  
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
    errorHandler.warn(`Permission ${permissionName} is not defined in permissionMatrix`, 'Permission Check', { permissionName });
    return false;
  }

  // Check both exact match and case-insensitive match
  const exactMatch = allowedRoles.includes(userRole);
  const caseInsensitiveMatch = allowedRoles.some(role => 
    role?.toLowerCase().trim() === normalizedRole
  );
  
  console.log('Permission check:', { permissionName, userRole, normalizedRole, exactMatch, caseInsensitiveMatch });
  
  return exactMatch || caseInsensitiveMatch;
};

export const PERMISSIONS = {
  canAccessCeoPanel: (role) => [ROLES.MAIN_CEO, ROLES.CO_CEO].includes(role),
  canManageUsers: (role) => [ROLES.MAIN_CEO, ROLES.CO_CEO].includes(role),
  isOfficialMember: (roleData) => {
    if (!roleData) return false;
    const role = typeof roleData === 'string' ? roleData : roleData?.role;
    const status = typeof roleData === 'object' ? roleData?.membershipStatus : null;
    if (status === 'approved') return true;
    if (role) {
      const normalized = role.toLowerCase().trim();
      return ['main ceo', 'co-ceo', 'co ceo', 'leader', 'member'].includes(normalized);
    }
    return false;
  },
  isAuthenticated: (role) => role !== ROLES.GUEST,
  isApprovedMember: (roleData) => {
    if (!roleData) return false;
    const role = typeof roleData === 'string' ? roleData : roleData?.role;
    const status = typeof roleData === 'object' ? roleData?.membershipStatus : null;
    if (status === 'approved') return true;
    if (role) {
      const normalized = role.toLowerCase().trim();
      return ['main ceo', 'co-ceo', 'co ceo', 'leader', 'member'].includes(normalized);
    }
    return false;
  },
};
