function checkPermissions(user) {
  return {
    isSuperAdmin: user?.role === "superadmin",
    isOrgAdmin: user?.role === "user" && user?.orgRole === "admin",
    isOrgMember: user?.role === "user" && user?.orgRole === "member",
    isOrgUser: user?.role === "user" && !!user?.orgId,
  };
}
module.exports = checkPermissions;
