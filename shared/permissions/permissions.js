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
    canModerateChat: [ROLES.MAIN_CEO, ROLES.CO_CEO, ROLES.LEADER, ROLES.MODERATOR],
    canManageExperiments: [ROLES.MAIN_CEO, ROLES.CO_CEO, ROLES.LEADER, ROLES.MEMBER],
    canManageProducts: [ROLES.MAIN_CEO, ROLES.CO_CEO, ROLES.LEADER, ROLES.MEMBER],
    canCreateTeam: [ROLES.MAIN_CEO, ROLES.CO_CEO, ROLES.LEADER, ROLES.MEMBER],
    canManageOrganization: [ROLES.MAIN_CEO, ROLES.CO_CEO, ROLES.LEADER],
    canModerate: [ROLES.MAIN_CEO, ROLES.CO_CEO, ROLES.LEADER, ROLES.MODERATOR],
    canUpdateTaskProgress: [ROLES.MAIN_CEO, ROLES.CO_CEO],
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
  
  return exactMatch || caseInsensitiveMatch;
};

export function isAccountSuspended(roleData) {
  if (!roleData || typeof roleData !== 'object') return false;
  const isFlagged = Boolean(roleData.suspended || roleData.accountStatus === 'suspended');
  if (!isFlagged) return false;

  if (roleData.suspendedUntil) {
    let untilMs = 0;
    if (roleData.suspendedUntil?.toMillis) {
      untilMs = roleData.suspendedUntil.toMillis();
    } else if (typeof roleData.suspendedUntil === 'number') {
      untilMs = roleData.suspendedUntil;
    } else {
      untilMs = new Date(roleData.suspendedUntil).getTime();
    }
    if (!isNaN(untilMs) && untilMs > Date.now()) {
      return true;
    }
    return false;
  }

  return true;
}

export const PERMISSIONS = {
  canAccessCeoPanel: (role) => [ROLES.MAIN_CEO, ROLES.CO_CEO].includes(role),
  canManageUsers: (role) => [ROLES.MAIN_CEO, ROLES.CO_CEO].includes(role),
  isSuspended: (roleData) => isAccountSuspended(roleData),
  isOfficialMember: (roleData) => {
    if (!roleData) return false;
    if (isAccountSuspended(roleData)) return false;
    const role = typeof roleData === 'string' ? roleData : roleData?.role;
    const status = typeof roleData === 'object' ? roleData?.membershipStatus : null;
    if (status === 'approved') return true;
    if (role) {
      const normalized = role.toLowerCase().trim();
      return ['main ceo', 'co-ceo', 'co ceo', 'leader', 'moderator', 'mentor', 'judge', 'writer', 'member'].includes(normalized);
    }
    return false;
  },
  isAuthenticated: (role) => role !== ROLES.GUEST,
  isApprovedMember: (roleData) => {
    if (!roleData) return false;
    if (isAccountSuspended(roleData)) return false;
    const role = typeof roleData === 'string' ? roleData : roleData?.role;
    const status = typeof roleData === 'object' ? roleData?.membershipStatus : null;
    if (status === 'approved') return true;
    if (role) {
      const normalized = role.toLowerCase().trim();
      return ['main ceo', 'co-ceo', 'co ceo', 'leader', 'moderator', 'mentor', 'judge', 'writer', 'member'].includes(normalized);
    }
    return false;
  },
};
