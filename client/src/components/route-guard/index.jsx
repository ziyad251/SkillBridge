import { Navigate, useLocation } from "react-router-dom";
import { Fragment } from "react";

const PUBLIC_PATHS = ["/", "/auth", "/courses"];

function isPublicPath(pathname) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/course/details/")) return true;
  return false;
}

function RouteGuard({ authenticated, user, element }) {
  const location = useLocation();
  const { pathname } = location;

  if (!authenticated && !isPublicPath(pathname)) {
    return <Navigate to="/auth" state={{ from: pathname }} replace />;
  }

  if (
    authenticated &&
    user?.role !== "instructor" &&
    (pathname.includes("instructor") || pathname === "/auth")
  ) {
    return <Navigate to="/home" replace />;
  }

  if (
    authenticated &&
    user?.role === "instructor" &&
    !pathname.includes("instructor") &&
    pathname !== "/profile"
  ) {
    return <Navigate to="/instructor" replace />;
  }

  if (authenticated && pathname === "/auth") {
    return (
      <Navigate
        to={user?.role === "instructor" ? "/instructor" : "/home"}
        replace
      />
    );
  }

  return <Fragment>{element}</Fragment>;
}

export default RouteGuard;
