const ROLES = {
  ADMIN: 'Admin',
  PROJECT_LEAD: 'ProjectLead',
  DEVELOPER: 'Developer',
};

const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 3,
  [ROLES.PROJECT_LEAD]: 2,
  [ROLES.DEVELOPER]: 1,
};

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

export const getUserRole = () => {
  const user = getCurrentUser();
  return user?.role || null;
};

export const hasRole = (role) => {
  const userRole = getUserRole();
  return userRole === role;
};

export const hasAnyRole = (roles) => {
  const userRole = getUserRole();
  return roles.includes(userRole);
};

export const hasMinimumRole = (requiredRole) => {
  const userRole = getUserRole();
  if (!userRole || !ROLE_HIERARCHY[requiredRole]) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

export const isAdmin = () => hasRole(ROLES.ADMIN);
export const isProjectLead = () => hasRole(ROLES.PROJECT_LEAD);
export const isDeveloper = () => hasRole(ROLES.DEVELOPER);

export const canManageProjects = () => hasAnyRole([ROLES.ADMIN, ROLES.PROJECT_LEAD]);
export const canManageUsers = () => hasRole(ROLES.ADMIN);
export const canViewDashboard = () => hasAnyRole([ROLES.ADMIN, ROLES.PROJECT_LEAD]);

export { ROLES, ROLE_HIERARCHY };
