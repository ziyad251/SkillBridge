import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import VideoPlayer from "@/components/video-player";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  createPaymentService,
  fetchStudentViewCourseDetailsService,
} from "@/services";
import { CheckCircle, Globe, Lock, PlayCircle } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

function StudentViewCourseDetailsPage() {
  const {
    studentViewCourseDetails,
    setStudentViewCourseDetails,
    currentCourseDetailsId,
    setCurrentCourseDetailsId,
    loadingState,
    setLoadingState,
  } = useContext(StudentContext);

  const { auth } = useContext(AuthContext);

  const [displayCurrentVideoFreePreview, setDisplayCurrentVideoFreePreview] =
    useState(null);
  const [showFreePreviewDialog, setShowFreePreviewDialog] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  /* ---------------- FETCH COURSE DETAILS ---------------- */

  async function fetchStudentViewCourseDetails() {
    try {
      setLoadingState(true);

      const response = await fetchStudentViewCourseDetailsService(
        currentCourseDetailsId
      );

      if (response?.success) {
        setStudentViewCourseDetails(response?.data);
      } else {
        setStudentViewCourseDetails(null);
      }
    } catch (error) {
      console.error("Fetch Course Error:", error);
      setStudentViewCourseDetails(null);
    } finally {
      setLoadingState(false);
    }
  }

  /* ---------------- HANDLE FREE PREVIEW ---------------- */

  function handleSetFreePreview(videoUrl) {
    setDisplayCurrentVideoFreePreview(videoUrl);
  }

  /* ---------------- HANDLE PAYMENT ---------------- */

  async function handleCreatePayment() {
    if (!auth?.user?._id) {
      alert("Please login first");
      return;
    }

    if (!studentViewCourseDetails) return;

    // FREE COURSE
    if (studentViewCourseDetails?.pricing === 0) {
      alert("This is a free course. Redirecting to course...");
      navigate(`/course-progress/${studentViewCourseDetails._id}`);
      return;
    }

    try {
      setIsProcessingPayment(true);

      const paymentPayload = {
        userId: auth?.user?._id,
        userName: auth?.user?.userName,
        userEmail: auth?.user?.userEmail,
        orderStatus: "pending",
        paymentMethod: "paypal",
        paymentStatus: "initiated",
        orderDate: new Date(),
        paymentId: "",
        payerId: "",
        instructorId: studentViewCourseDetails?.instructorId,
        instructorName: studentViewCourseDetails?.instructorName,
        courseImage: studentViewCourseDetails?.image,
        courseTitle: studentViewCourseDetails?.title,
        courseId: studentViewCourseDetails?._id,
        coursePricing: studentViewCourseDetails?.pricing,
      };

      console.log("Payment Payload:", paymentPayload);

      const response = await createPaymentService(paymentPayload);

      console.log("Payment Response:", response);

      if (response?.success && response?.data?.approveUrl) {

  // 🔥 SAVE ORDER ID BEFORE REDIRECT
  sessionStorage.setItem(
    "currentOrderId",
    JSON.stringify(response.data.orderId)
  );

  console.log("Saved Order ID:", response.data.orderId);

  window.location.href = response.data.approveUrl;

} else {
  alert("Payment creation failed. Check backend.");
}

    } catch (error) {
      console.error("Payment Error:", error);
      alert("Payment Error. See console.");
    } finally {
      setIsProcessingPayment(false);
    }
  }

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    if (displayCurrentVideoFreePreview !== null) {
      setShowFreePreviewDialog(true);
    }
  }, [displayCurrentVideoFreePreview]);

  useEffect(() => {
    if (currentCourseDetailsId) {
      fetchStudentViewCourseDetails();
    }
  }, [currentCourseDetailsId]);

  useEffect(() => {
    if (id) {
      setCurrentCourseDetailsId(id);
    }
  }, [id]);

  useEffect(() => {
    if (!location.pathname.includes("course/details")) {
      setStudentViewCourseDetails(null);
      setCurrentCourseDetailsId(null);
    }
  }, [location.pathname]);

  if (loadingState) return <Skeleton />;

  if (!studentViewCourseDetails) {
    return <h1 className="text-2xl font-bold p-5">Course Not Found</h1>;
  }

  const freePreviewIndex =
    studentViewCourseDetails?.curriculum?.findIndex(
      (item) => item.freePreview
    ) ?? -1;

  return (
    <div className="mx-auto p-4">
      {/* HEADER */}
      <div className="bg-gray-900 text-white p-8 rounded-t-lg">
        <h1 className="text-3xl font-bold mb-4">
          {studentViewCourseDetails?.title}
        </h1>
        <p className="text-xl mb-4">
          {studentViewCourseDetails?.subtitle}
        </p>

        <div className="flex flex-wrap gap-4 text-sm">
          <span>Created By {studentViewCourseDetails?.instructorName}</span>
          <span>
            Created On{" "}
            {studentViewCourseDetails?.date
              ? studentViewCourseDetails.date.split("T")[0]
              : ""}
          </span>
          <span className="flex items-center">
            <Globe className="mr-1 h-4 w-4" />
            {studentViewCourseDetails?.primaryLanguage}
          </span>
          <span>
            {studentViewCourseDetails?.students?.length || 0} Students
          </span>
        </div>
      </div>

      {/* BODY */}
      <div className="flex flex-col md:flex-row gap-8 mt-8">
        <main className="flex-grow">
          {/* OBJECTIVES */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What you'll learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(studentViewCourseDetails?.objectives || "")
                  .split(",")
                  .map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                      <span>{objective}</span>
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>

          {/* CURRICULUM */}
          <Card>
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              {studentViewCourseDetails?.curriculum?.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 mb-3 ${
                    item.freePreview ? "cursor-pointer" : "cursor-not-allowed"
                  }`}
                  onClick={() =>
                    item.freePreview &&
                    handleSetFreePreview(item.videoUrl)
                  }
                >
                  {item.freePreview ? (
                    <PlayCircle className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  <span>{item.title}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </main>

        {/* SIDEBAR */}
        <aside className="w-full md:w-[400px]">
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <VideoPlayer
                url={
                  freePreviewIndex !== -1
                    ? studentViewCourseDetails?.curriculum[
                        freePreviewIndex
                      ]?.videoUrl
                    : ""
                }
                width="100%"
                height="220px"
              />

              <div className="my-4 text-3xl font-bold">
                ${studentViewCourseDetails?.pricing}
              </div>

              <Button
                onClick={handleCreatePayment}
                className="w-full"
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? "Processing..." : "Buy Now"}
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* FREE PREVIEW DIALOG */}
      <Dialog
        open={showFreePreviewDialog}
        onOpenChange={() => {
          setShowFreePreviewDialog(false);
          setDisplayCurrentVideoFreePreview(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Course Preview</DialogTitle>
          </DialogHeader>

          <VideoPlayer
            url={displayCurrentVideoFreePreview}
            width="100%"
            height="300px"
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentViewCourseDetailsPage;
