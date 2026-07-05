import CourseCurriculum from "@/components/instructor-view/courses/add-new-course/course-curriculum";
import CourseLanding from "@/components/instructor-view/courses/add-new-course/course-landing";
import CourseSettings from "@/components/instructor-view/courses/add-new-course/course-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  courseCurriculumInitialFormData,
  courseLandingInitialFormData,
} from "@/config";
import {
  addNewCourseService,
  fetchInstructorCourseDetailsService,
  updateCourseByIdService,
} from "@/services";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function AddNewCoursePage({
  auth,
  courseLandingFormData,
  courseCurriculumFormData,
  setCourseLandingFormData,
  setCourseCurriculumFormData,
  currentEditedCourseId,
  setCurrentEditedCourseId,
  mediaUploadProgress,
  setMediaUploadProgress,
  mediaUploadProgressPercentage,
  setMediaUploadProgressPercentage,
}) {
  const navigate = useNavigate();
  const params = useParams();

  function isEmpty(value) {
    if (Array.isArray(value)) {
      return value.length === 0;
    }

    return value === "" || value === null || value === undefined;
  }

  function validateFormData() {
    console.log("🔍 [VALIDATION] Starting form validation...");
    console.log("📋 [VALIDATION] courseLandingFormData:", courseLandingFormData);
    console.log("📚 [VALIDATION] courseCurriculumFormData:", courseCurriculumFormData);

    for (const key in courseLandingFormData) {
      const isEmpty_result = isEmpty(courseLandingFormData[key]);
      console.log(`📝 [VALIDATION] ${key}: "${courseLandingFormData[key]}" isEmpty=${isEmpty_result}`);
      if (isEmpty_result) {
        console.log(`❌ [VALIDATION] FAILED at landing field: ${key}`);
        return false;
      }
    }

    let hasFreePreview = false;

    for (const item of courseCurriculumFormData) {
      console.log(`📖 [VALIDATION] Curriculum item:`, item);
      const titleEmpty = isEmpty(item.title);
      const videoUrlEmpty = isEmpty(item.videoUrl);
      const publicIdEmpty = isEmpty(item.public_id);
      console.log(`  - title: "${item.title}" isEmpty=${titleEmpty}`);
      console.log(`  - videoUrl: "${item.videoUrl}" isEmpty=${videoUrlEmpty}`);
      console.log(`  - public_id: "${item.public_id}" isEmpty=${publicIdEmpty}`);

      if (titleEmpty || videoUrlEmpty || publicIdEmpty) {
        console.log(`❌ [VALIDATION] FAILED at curriculum item - missing required field`);
        return false;
      }

      if (item.freePreview) {
        console.log(`✅ [VALIDATION] Found free preview lecture`);
        hasFreePreview = true;
      }
    }

    console.log(`🎯 [VALIDATION] hasFreePreview=${hasFreePreview}`);
    return hasFreePreview;
  }

  async function handleCreateCourse() {
    console.log("🔘 [SUBMIT] Button clicked!");
    console.log("✅ [SUBMIT] handleCreateCourse() invoked");

    const courseFinalFormData = {
      instructorId: String(auth?.user?._id),
      instructorName: auth?.user?.userName,
      date: new Date(),
      ...courseLandingFormData,
      pricing: Number(courseLandingFormData.pricing),
      students: [],
      curriculum: courseCurriculumFormData,
      isPublised: true,
    };

    console.log("📦 [SUBMIT] Final form data prepared:", courseFinalFormData);
    console.log("📊 [SUBMIT] Curriculum count:", courseCurriculumFormData.length);

    try {
      console.log(`🌐 [API] Sending ${currentEditedCourseId ? 'UPDATE' : 'CREATE'} request...`);

      const response =
        currentEditedCourseId !== null
          ? await updateCourseByIdService(
              currentEditedCourseId,
              courseFinalFormData
            )
          : await addNewCourseService(courseFinalFormData);

      console.log("📥 [API] Response received:", response);

      if (response?.success) {
        console.log("✨ [SUCCESS] Course saved successfully!");
        setCourseLandingFormData(courseLandingInitialFormData);
        setCourseCurriculumFormData(courseCurriculumInitialFormData);
        setCurrentEditedCourseId(null);
        navigate("/instructor");
      } else {
        console.log("❌ [ERROR] API response not successful:", response);
      }
    } catch (error) {
      console.log("💥 [ERROR] Exception caught:", error);
      console.error(error);
    }
  }

  async function fetchCurrentCourseDetails() {
    const response = await fetchInstructorCourseDetailsService(
      currentEditedCourseId
    );

    if (response?.success) {
      const setCourseFormData = Object.keys(
        courseLandingInitialFormData
      ).reduce((acc, key) => {
        acc[key] = response?.data[key] || courseLandingInitialFormData[key];

        return acc;
      }, {});

      setCourseLandingFormData(setCourseFormData);
      setCourseCurriculumFormData(response?.data?.curriculum);
    }
  }

  useEffect(() => {
    if (currentEditedCourseId !== null) fetchCurrentCourseDetails();
  }, [currentEditedCourseId]);

  useEffect(() => {
    if (params?.courseId) setCurrentEditedCourseId(params?.courseId);
  }, [params?.courseId]);

  return (
    <div className="mx-auto max-w-7xl p-4 lg:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Create a new course
        </h1>
        {(() => {
          const isValid = validateFormData();
          console.log(`🔘 [BUTTON] Submit button render - enabled=${isValid}`);
          return (
            <Button
              disabled={!isValid}
              className="text-sm tracking-wider font-bold px-8"
              onClick={handleCreateCourse}
            >
              SUBMIT
            </Button>
          );
        })()}
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-4 md:p-6">
          <div className="mx-auto">
            <Tabs defaultValue="curriculum" className="space-y-4">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="course-landing-page">
                  Course Landing Page
                </TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="curriculum">
                <CourseCurriculum
                  courseCurriculumFormData={courseCurriculumFormData}
                  setCourseCurriculumFormData={setCourseCurriculumFormData}
                  mediaUploadProgress={mediaUploadProgress}
                  setMediaUploadProgress={setMediaUploadProgress}
                  mediaUploadProgressPercentage={mediaUploadProgressPercentage}
                  setMediaUploadProgressPercentage={
                    setMediaUploadProgressPercentage
                  }
                />
              </TabsContent>
              <TabsContent value="course-landing-page">
                <CourseLanding
                  courseLandingFormData={courseLandingFormData}
                  setCourseLandingFormData={setCourseLandingFormData}
                />
              </TabsContent>
              <TabsContent value="settings">
                <CourseSettings
                  courseLandingFormData={courseLandingFormData}
                  setCourseLandingFormData={setCourseLandingFormData}
                  mediaUploadProgress={mediaUploadProgress}
                  setMediaUploadProgress={setMediaUploadProgress}
                  mediaUploadProgressPercentage={mediaUploadProgressPercentage}
                  setMediaUploadProgressPercentage={
                    setMediaUploadProgressPercentage
                  }
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AddNewCoursePage;
