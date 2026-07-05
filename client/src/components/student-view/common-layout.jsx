import PublicNavbar from "@/components/layout/public-navbar";
import { Outlet, useLocation } from "react-router-dom";
import StudentViewCommonHeader from "./header";

function StudentViewCommonLayout({ resetCredentials, auth }) {
  const location = useLocation();
  const hideHeader = location.pathname.includes("course-progress");
  const showPublicNav = !auth?.authenticate;

  return (
    <div>
      {!hideHeader &&
        (showPublicNav ? (
          <PublicNavbar />
        ) : (
          <StudentViewCommonHeader
            resetCredentials={resetCredentials}
            auth={auth}
          />
        ))}

      <Outlet />
    </div>
  );
}

export default StudentViewCommonLayout;
