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
import ReviewForm from "@/components/reviews/review-form";
import ReviewList from "@/components/reviews/review-list";
import {
  createRazorpayOrderService,
  fetchStudentViewCourseDetailsService,
  verifyRazorpayPaymentService,
  getReviewsByCourseService,
  checkCoursePurchaseInfoService,
} from "@/services";
import { CheckCircle, Globe, Lock, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

function StudentViewCourseDetailsPage({
  studentViewCourseDetails,
  setStudentViewCourseDetails,
  currentCourseDetailsId,
  setCurrentCourseDetailsId,
  loadingState,
  setLoadingState,
  auth,
}) {

  const [displayCurrentVideoFreePreview, setDisplayCurrentVideoFreePreview] =
    useState(null);
  const [showFreePreviewDialog, setShowFreePreviewDialog] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);

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
        await fetchReviews(currentCourseDetailsId);

        // Check if user is enrolled
        if (auth?.user?._id) {
          const purchaseInfo = await checkCoursePurchaseInfoService(
            currentCourseDetailsId,
            auth.user._id
          );
          setIsEnrolled(purchaseInfo?.success && purchaseInfo?.data?.isPurchased);
        }
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

  async function fetchReviews(courseId) {
    try {
      const response = await getReviewsByCourseService(courseId);
      if (response?.success) {
        setReviews(response?.data?.reviews || []);
        setAverageRating(response?.data?.averageRating || 0);
        setTotalReviews(response?.data?.totalReviews || 0);
      }
    } catch (error) {
      console.error("Fetch Reviews Error:", error);
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
        amount: Number(studentViewCourseDetails?.pricing),
        userId: auth?.user?._id,
        userName: auth?.user?.userName,
        userEmail: auth?.user?.userEmail,
        instructorId: studentViewCourseDetails?.instructorId,
        instructorName: studentViewCourseDetails?.instructorName,
        courseImage: studentViewCourseDetails?.image,
        courseTitle: studentViewCourseDetails?.title,
        courseId: studentViewCourseDetails?._id,
        coursePricing: studentViewCourseDetails?.pricing,
      };

      const response = await createRazorpayOrderService(paymentPayload);

      if (!response?.success || !response?.data?.order_id) {
        alert("Payment creation failed. Check backend.");
        return;
      }

      const razorpayKey =
        import.meta.env.VITE_RAZORPAY_KEY_ID ||
        import.meta.env.REACT_APP_RAZORPAY_KEY_ID ||
        "RAZORPAY_KEY_ID";

      if (!window.Razorpay) {
        alert("Razorpay SDK failed to load");
        return;
      }

      const options = {
        key: razorpayKey,
        amount: response.data.amount,
        currency: response.data.currency,
        name: "My Project",
        description: "Test Payment",
        order_id: response.data.order_id,
        handler: async function (razorpayResponse) {
          const verifyResponse = await verifyRazorpayPaymentService({
            razorpay_order_id: razorpayResponse.razorpay_order_id,
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_signature: razorpayResponse.razorpay_signature,
          });

          if (verifyResponse?.success) {
            alert("Payment successful! Course unlocked.");
            navigate("/student-courses");
          } else {
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: auth?.user?.userName || "",
          email: auth?.user?.userEmail || "",
        },
        theme: {
          color: "#111827",
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function () {
        alert("Payment failed. Please try again.");
      });
      razorpayInstance.open();
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

  if (loadingState) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 p-4 lg:p-8">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!studentViewCourseDetails) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Course Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          This course may have been removed or is unavailable.
        </p>
      </div>
    );
  }

  const freePreviewIndex =
    studentViewCourseDetails?.curriculum?.findIndex(
      (item) => item.freePreview
    ) ?? -1;

  return (
    <div className="mx-auto max-w-7xl overflow-x-hidden p-4 lg:p-8">
      <div className="rounded-t-xl bg-gradient-to-br from-[#121218] via-[#4F46E5]/20 to-[#7C3AED]/10 p-6 text-foreground md:p-8">
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

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <main className="min-w-0 flex-1">
          <Card className="mb-8 border-border/60 bg-card/80">
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
          <Card className="border-border/60 bg-card/80">
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

          {/* REVIEWS SECTION */}
          <Card className="mt-8 border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle>Student Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {isEnrolled && (
                <div className="mb-8">
                  <ReviewForm
                    courseId={currentCourseDetailsId}
                    auth={auth}
                    onReviewSubmitted={() => fetchReviews(currentCourseDetailsId)}
                  />
                </div>
              )}

              <ReviewList
                reviews={reviews}
                averageRating={averageRating}
                totalReviews={totalReviews}
                currentUserId={auth?.user?._id}
                onReviewUpdated={() => fetchReviews(currentCourseDetailsId)}
                onReviewDeleted={() => fetchReviews(currentCourseDetailsId)}
              />
            </CardContent>
          </Card>
        </main>

        {/* SIDEBAR */}
        <aside className="w-full shrink-0 lg:w-[380px] xl:w-[400px]">
          <Card className="sticky top-20 border-border/60 bg-card/80 shadow-lg shadow-indigo-500/5">
            <CardContent className="p-6">
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                <VideoPlayer
                  url={
                    freePreviewIndex !== -1
                      ? studentViewCourseDetails?.curriculum[
                          freePreviewIndex
                        ]?.videoUrl
                      : ""
                  }
                  width="100%"
                  height="100%"
                />
              </div>

              <div className="my-4 text-3xl font-bold text-indigo-400">
                ${studentViewCourseDetails?.pricing}
              </div>

              <Button
                onClick={handleCreatePayment}
                className="lms-btn-primary w-full"
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? "Processing..." : "Pay Now"}
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

          <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
            <VideoPlayer
              url={displayCurrentVideoFreePreview}
              width="100%"
              height="100%"
            />
          </div>

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
