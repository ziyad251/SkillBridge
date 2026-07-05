import InstructorCourses from "@/components/instructor-view/courses";
import InstructorDashboard from "@/components/instructor-view/dashboard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { fetchInstructorCourseListService } from "@/services";
import { BarChart, Book, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function InstructorDashboardpage({
  auth,
  resetCredentials,
  instructorCoursesList,
  setInstructorCoursesList,
  setCurrentEditedCourseId,
  setCourseLandingFormData,
  setCourseCurriculumFormData,
}) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const location = useLocation();

  async function fetchAllCourses() {
    const response = await fetchInstructorCourseListService(auth?.user?._id);
    if (response?.success) setInstructorCoursesList(response?.data);
  }

  useEffect(() => {
    if (auth?.user?._id) {
      fetchAllCourses();
    }
  }, [auth?.user?._id, location.pathname]);

  const menuItems = [
    {
      icon: BarChart,
      label: "Dashboard",
      value: "dashboard",
      component: <InstructorDashboard listOfCourses={instructorCoursesList} />,
    },
    {
      icon: Book,
      label: "Courses",
      value: "courses",
      component: (
        <InstructorCourses
          listOfCourses={instructorCoursesList}
          setCurrentEditedCourseId={setCurrentEditedCourseId}
          setCourseLandingFormData={setCourseLandingFormData}
          setCourseCurriculumFormData={setCourseCurriculumFormData}
        />
      ),
    },
    {
      icon: LogOut,
      label: "Logout",
      value: "logout",
      component: null,
    },
  ];

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
  }

  return (
    <div className="lms-page-shell flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 border-r border-border/60 bg-card/50 backdrop-blur-sm md:block">
        <div className="p-5">
          <h2 className="text-xl font-extrabold tracking-tight mb-5">
            Instructor View
          </h2>
          <nav>
            {menuItems.map((menuItem) => (
              <Button
                className="w-full justify-start mb-2"
                key={menuItem.value}
                variant={activeTab === menuItem.value ? "secondary" : "ghost"}
                onClick={
                  menuItem.value === "logout"
                    ? handleLogout
                    : () => setActiveTab(menuItem.value)
                }
              >
                <menuItem.icon className="mr-2 h-4 w-4" />
                {menuItem.label}
              </Button>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground mb-8">
            My Courses · Revenue Summary · Students Enrolled
          </p>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {menuItems.map((menuItem) => (
              <TabsContent key={menuItem.value} value={menuItem.value}>
                {menuItem.component !== null ? menuItem.component : null}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export default InstructorDashboardpage;
