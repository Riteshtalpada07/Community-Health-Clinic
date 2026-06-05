function checkRole(requiredRole) {
  const userStr = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  if (!userStr || !token) {
    window.location.href = "login.html";
    return null;
  }

  let user;
  try {
    user = JSON.parse(userStr);
  } catch {
    window.location.href = "login.html";
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    window.location.href = "login.html";
    return null;
  }

  return user;
}
