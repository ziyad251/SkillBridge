import { Route, Routes } from "react-router-dom";
import AuthPage from "./pages/auth";
import RouteGuard from "./components/route-guard";
import { useEffect, useState } from "react";
import InstructorDashboardpage from "./pages/instructor";
import StudentViewCommonLayout from "./components/student-view/common-layout";
import StudentHomePage from "./pages/student/home";
import NotFoundPage from "./pages/not-found";
import AddNewCoursePage from "./pages/instructor/add-new-course";
import StudentViewCoursesPage from "./pages/student/courses";
import StudentViewCourseDetailsPage from "./pages/student/course-details";
import StudentCoursesPage from "./pages/student/student-courses";
import StudentViewCourseProgressPage from "./pages/student/course-progress";
import LandingPage from "./pages/landing";
import ProfilePage from "./pages/profile";
import { Skeleton } from "@/components/ui/skeleton";
import { initialSignInFormData, initialSignUpFormData } from "@/config";
import {
  checkAuthService,
  fetchStudentBoughtCoursesService,
  loginService,
  registerService,
} from "@/services";
import {
  courseCurriculumInitialFormData,
  courseLandingInitialFormData,
} from "@/config";

function App() {
  const [signInFormData, setSignInFormData] = useState(initialSignInFormData);
  const [signUpFormData, setSignUpFormData] = useState(initialSignUpFormData);
  const [auth, setAuth] = useState({
    authenticate: false,
    user: null,
  });
  const [authLoading, setAuthLoading] = useState(true);

  async function handleRegisterUser(event) {
    event.preventDefault();

    try {
      const data = await registerService(signUpFormData);

      if (data?.success) {
        setSignUpFormData(initialSignUpFormData);
      }
    } catch (error) {
      console.error("Register failed:", error?.response?.data?.message || error.message);
    }
  }

  async function handleLoginUser(event) {
    event.preventDefault();

    try {
      const data = await loginService(signInFormData);

      if (data?.success) {
        sessionStorage.setItem(
          "accessToken",
          JSON.stringify(data.data.accessToken)
        );
        setAuth({
          authenticate: true,
          user: data.data.user,
        });
      } else {
        setAuth({
          authenticate: false,
          user: null,
        });
      }
    } catch (error) {
      console.error("Login failed:", error?.response?.data?.message || error.message);
      setAuth({
        authenticate: false,
        user: null,
      });
    }
  }

  async function checkAuthUser() {
    try {
      const data = await checkAuthService();
      if (data.success) {
        setAuth({
          authenticate: true,
          user: data.data.user,
        });
      } else {
        setAuth({
          authenticate: false,
          user: null,
        });
      }
    } catch (error) {
      console.error(
        "check-auth failed:",
        error?.response?.status,
        error?.response?.data?.message || error.message
      );
      setAuth({
        authenticate: false,
        user: null,
      });
    } finally {
      setAuthLoading(false);
    }
  }

  function resetCredentials() {
    setAuth({
      authenticate: false,
      user: null,
    });
    setStudentBoughtCoursesList([]);
  }

  useEffect(() => {
    checkAuthUser();
  }, []);

  const [studentViewCoursesList, setStudentViewCoursesList] = useState([]);
  const [loadingState, setLoadingState] = useState(true);
  const [studentViewCourseDetails, setStudentViewCourseDetails] =
    useState(null);
  const [currentCourseDetailsId, setCurrentCourseDetailsId] = useState(null);
  const [studentBoughtCoursesList, setStudentBoughtCoursesList] = useState([]);
  const [studentCurrentCourseProgress, setStudentCurrentCourseProgress] =
    useState({});

  const [courseLandingFormData, setCourseLandingFormData] = useState(
    courseLandingInitialFormData
  );
  const [courseCurriculumFormData, setCourseCurriculumFormData] = useState(
    courseCurriculumInitialFormData
  );
  const [mediaUploadProgress, setMediaUploadProgress] = useState(false);
  const [mediaUploadProgressPercentage, setMediaUploadProgressPercentage] =
    useState(0);
  const [instructorCoursesList, setInstructorCoursesList] = useState([]);
  const [currentEditedCourseId, setCurrentEditedCourseId] = useState(null);

  useEffect(() => {
    async function loadPurchasedCourses() {
      if (!auth.authenticate || !auth.user?._id || auth.user?.role === "instructor") {
        return;
      }

      try {
        const response = await fetchStudentBoughtCoursesService(auth.user._id);
        if (response?.success) {
          setStudentBoughtCoursesList(
            Array.isArray(response?.data) ? response.data : []
          );
        }
      } catch (error) {
        console.error(
          "Failed to load purchased courses:",
          error?.response?.data?.message || error.message
        );
      }
    }

    loadPurchasedCourses();
  }, [auth.authenticate, auth.user?._id, auth.user?.role]);

  if (authLoading) {
    return (
      <div className="lms-page-shell flex min-h-screen flex-col gap-4 p-8">
        <Skeleton className="h-12 w-48 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    );
  }

  const guardProps = { authenticated: auth?.authenticate, user: auth?.user };

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/auth"
        element={
          <RouteGuard
            element={
              <AuthPage
                signInFormData={signInFormData}
                setSignInFormData={setSignInFormData}
                signUpFormData={signUpFormData}
                setSignUpFormData={setSignUpFormData}
                handleRegisterUser={handleRegisterUser}
                handleLoginUser={handleLoginUser}
              />
            }
            {...guardProps}
          />
        }
      />

      <Route
        element={
          <RouteGuard
            element={
              <StudentViewCommonLayout
                resetCredentials={resetCredentials}
                auth={auth}
              />
            }
            {...guardProps}
          />
        }
      >
        <Route
          path="/courses"
          element={
            <StudentViewCoursesPage
              studentViewCoursesList={studentViewCoursesList}
              setStudentViewCoursesList={setStudentViewCoursesList}
              loadingState={loadingState}
              setLoadingState={setLoadingState}
              auth={auth}
            />
          }
        />
        <Route
          path="/course/details/:id"
          element={
            <StudentViewCourseDetailsPage
              studentViewCourseDetails={studentViewCourseDetails}
              setStudentViewCourseDetails={setStudentViewCourseDetails}
              currentCourseDetailsId={currentCourseDetailsId}
              setCurrentCourseDetailsId={setCurrentCourseDetailsId}
              loadingState={loadingState}
              setLoadingState={setLoadingState}
              auth={auth}
            />
          }
        />
        <Route
          path="/home"
          element={
            <StudentHomePage
              studentViewCoursesList={studentViewCoursesList}
              setStudentViewCoursesList={setStudentViewCoursesList}
              auth={auth}
              studentBoughtCoursesList={studentBoughtCoursesList}
            />
          }
        />
        <Route
          path="/student-courses"
          element={
            <StudentCoursesPage
              auth={auth}
              studentBoughtCoursesList={studentBoughtCoursesList}
              setStudentBoughtCoursesList={setStudentBoughtCoursesList}
            />
          }
        />
        <Route
          path="/course-progress/:id"
          element={
            <StudentViewCourseProgressPage
              auth={auth}
              studentCurrentCourseProgress={studentCurrentCourseProgress}
              setStudentCurrentCourseProgress={setStudentCurrentCourseProgress}
            />
          }
        />
        <Route
          path="/profile"
          element={
            <ProfilePage
              auth={auth}
              resetCredentials={resetCredentials}
              purchasedCoursesCount={studentBoughtCoursesList?.length || 0}
            />
          }
        />
      </Route>

      <Route
        path="/instructor"
        element={
          <RouteGuard
            element={
              <InstructorDashboardpage
                auth={auth}
                resetCredentials={resetCredentials}
                instructorCoursesList={instructorCoursesList}
                setInstructorCoursesList={setInstructorCoursesList}
                setCurrentEditedCourseId={setCurrentEditedCourseId}
                setCourseLandingFormData={setCourseLandingFormData}
                setCourseCurriculumFormData={setCourseCurriculumFormData}
              />
            }
            {...guardProps}
          />
        }
      />
      <Route
        path="/instructor/create-new-course"
        element={
          <RouteGuard
            element={
              <AddNewCoursePage
                auth={auth}
                courseLandingFormData={courseLandingFormData}
                courseCurriculumFormData={courseCurriculumFormData}
                setCourseLandingFormData={setCourseLandingFormData}
                setCourseCurriculumFormData={setCourseCurriculumFormData}
                currentEditedCourseId={currentEditedCourseId}
                setCurrentEditedCourseId={setCurrentEditedCourseId}
                mediaUploadProgress={mediaUploadProgress}
                setMediaUploadProgress={setMediaUploadProgress}
                mediaUploadProgressPercentage={mediaUploadProgressPercentage}
                setMediaUploadProgressPercentage={
                  setMediaUploadProgressPercentage
                }
              />
            }
            {...guardProps}
          />
        }
      />
      <Route
        path="/instructor/edit-course/:courseId"
        element={
          <RouteGuard
            element={
              <AddNewCoursePage
                auth={auth}
                courseLandingFormData={courseLandingFormData}
                courseCurriculumFormData={courseCurriculumFormData}
                setCourseLandingFormData={setCourseLandingFormData}
                setCourseCurriculumFormData={setCourseCurriculumFormData}
                currentEditedCourseId={currentEditedCourseId}
                setCurrentEditedCourseId={setCurrentEditedCourseId}
                mediaUploadProgress={mediaUploadProgress}
                setMediaUploadProgress={setMediaUploadProgress}
                mediaUploadProgressPercentage={mediaUploadProgressPercentage}
                setMediaUploadProgressPercentage={
                  setMediaUploadProgressPercentage
                }
              />
            }
            {...guardProps}
          />
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
