export const ROLES = {
  MAIN_CEO: 'Main CEO',
  CO_CEO: 'Co-CEO',
  LEADER: 'Leader',
  MEMBER: 'Member',
  USER: 'User',
  PENDING: 'Pending Member',
  EXPLORER: 'Public Explorer',
  GUEST: 'Guest' // Unauthenticated
};

export const CREATIVE_BADGES = [
  'Scientist',
  'Engineer',
  'Developer',
  'Builder',
  'Researcher',
  'Inventor',
  'Designer',
  'Experiment Master',
  'Product Creator',
  'Team Leader'
];

export const PERMISSIONS = {
  canAccessCeoPanel: (role) => [ROLES.MAIN_CEO, ROLES.CO_CEO].includes(role),
  canManageUsers: (role) => [ROLES.MAIN_CEO, ROLES.CO_CEO].includes(role),
  isOfficialMember: (role) => [ROLES.MAIN_CEO, ROLES.CO_CEO, ROLES.LEADER, ROLES.MEMBER].includes(role),
  isAuthenticated: (role) => role !== ROLES.GUEST,
  isApprovedMember: (role) => [ROLES.MAIN_CEO, ROLES.CO_CEO, ROLES.LEADER, ROLES.MEMBER].includes(role),
};
