import { Button } from "@/components/ui/button";
import { CourseThumbnail, FadeIn, PageContainer, Panel, Tag, btnPrimary, btnSecondary } from "@/components/student-view/ui";
import { labelFor } from "@/components/ui/course-card";
import { courseCategories, courseLevelOptions, languageOptions } from "@/config";
import { cn } from "@/lib/utils";
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
import {
  Award,
  BarChart3,
  CalendarDays,
  Check,
  ChevronLeft,
  Globe,
  ListVideo,
  Lock,
  PlayCircle,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
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
          setIsEnrolled(purchaseInfo?.success && purchaseInfo?.data === true);
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

    if (isEnrolled) {
      navigate(`/course-progress/${studentViewCourseDetails._id}`);
      return;
    }

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
          color: "#0A0A0A",
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
      <div className="lms-page-shell">
        <PageContainer className="grid gap-8 pt-10 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-4">
            <Skeleton className="h-6 w-40 bg-neutral-100" />
            <Skeleton className="h-10 w-3/4 bg-neutral-100" />
            <Skeleton className="h-48 w-full rounded-2xl bg-neutral-100" />
          </div>
          <Skeleton className="h-96 w-full rounded-2xl bg-neutral-100" />
        </PageContainer>
      </div>
    );
  }

  if (!studentViewCourseDetails) {
    return (
      <div className="lms-page-shell">
        <PageContainer className="pt-16">
          <Panel className="mx-auto flex max-w-lg flex-col items-center px-6 py-14 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-[#171717]">Course not found</h1>
            <p className="mt-2 text-sm text-neutral-600">
              This course may have been removed or is unavailable.
            </p>
            <Button className={cn(btnPrimary, "mt-6 h-10")} onClick={() => navigate("/courses")}>
              Browse courses
            </Button>
          </Panel>
        </PageContainer>
      </div>
    );
  }

  const course = studentViewCourseDetails;
  const curriculum = course?.curriculum || [];
  const freePreviewIndex = curriculum.findIndex((item) => item.freePreview);
  const isFreeCourse = Number(course?.pricing) === 0;
  const canReview = Boolean(auth?.user?._id) && (isEnrolled || isFreeCourse);
  const objectives = (course?.objectives || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const createdOn = course?.date ? new Date(course.date) : null;
  const createdLabel =
    createdOn && !Number.isNaN(createdOn.getTime())
      ? createdOn.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      : null;
  const level = labelFor(courseLevelOptions, course?.level);
  const category = labelFor(courseCategories, course?.category);
  const language = labelFor(languageOptions, course?.primaryLanguage);
  const studentCount = course?.students?.length || 0;
  const ctaLabel = isProcessingPayment
    ? "Processing..."
    : isEnrolled
      ? "Continue learning"
      : isFreeCourse
        ? "Start learning"
        : "Enroll now";

  return (
    <div className="lms-page-shell pb-20">
      <PageContainer className="pt-8 sm:pt-10">
        <button
          type="button"
          onClick={() => navigate("/courses")}
          className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 transition-colors hover:text-[#0A0A0A]"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          All courses
        </button>

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
          {/* LEFT COLUMN */}
          <main className="min-w-0">
            <FadeIn>
              {category || level ? (
                <div className="flex flex-wrap gap-1.5">
                  {category ? <Tag>{category}</Tag> : null}
                  {level ? <Tag>{level}</Tag> : null}
                </div>
              ) : null}
              <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-[#171717] sm:text-4xl">
                {course?.title}
              </h1>
              {course?.subtitle ? (
                <p className="mt-3 text-lg text-neutral-600">{course.subtitle}</p>
              ) : null}
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-600">
                {course?.instructorName ? (
                  <li className="flex items-center gap-1.5">
                    <UserRound className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                    {course.instructorName}
                  </li>
                ) : null}
                {language ? (
                  <li className="flex items-center gap-1.5">
                    <Globe className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                    {language}
                  </li>
                ) : null}
                <li className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                  {studentCount} {studentCount === 1 ? "student" : "students"}
                </li>
                {createdLabel ? (
                  <li className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                    Created {createdLabel}
                  </li>
                ) : null}
              </ul>
            </FadeIn>

            {course?.description ? (
              <section aria-labelledby="about-title" className="mt-10">
                <h2 id="about-title" className="text-xl font-bold tracking-tight text-[#171717]">About this course</h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-neutral-600">{course.description}</p>
              </section>
            ) : null}

            {objectives.length > 0 ? (
              <section aria-labelledby="learn-title" className="mt-10">
                <Panel className="p-6">
                  <h2 id="learn-title" className="text-xl font-bold tracking-tight text-[#171717]">What you&apos;ll learn</h2>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2.5 text-sm text-neutral-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0A0A0A]" aria-hidden="true" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </Panel>
              </section>
            ) : null}

            {/* CURRICULUM */}
            <section aria-labelledby="curriculum-title" className="mt-10">
              <div className="flex items-end justify-between gap-3">
                <h2 id="curriculum-title" className="text-xl font-bold tracking-tight text-[#171717]">Curriculum</h2>
                <p className="text-sm text-neutral-500">
                  {curriculum.length} {curriculum.length === 1 ? "lecture" : "lectures"}
                </p>
              </div>
              <Panel as="ol" className="mt-4 divide-y divide-[#E5E5E5] overflow-hidden">
                {curriculum.map((item, index) => (
                  <li key={item?._id || index}>
                    {item.freePreview ? (
                      <button
                        type="button"
                        onClick={() => handleSetFreePreview(item.videoUrl)}
                        className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-neutral-50 sm:px-5"
                      >
                        <span className="w-6 shrink-0 text-xs tabular-nums text-neutral-400">{String(index + 1).padStart(2, "0")}</span>
                        <span className="min-w-0 flex-1 text-sm font-medium text-[#171717]">{item.title}</span>
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#0A0A0A] px-2.5 py-0.5 text-xs font-semibold text-[#0A0A0A]">
                          <PlayCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          Preview
                        </span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
                        <span className="w-6 shrink-0 text-xs tabular-nums text-neutral-400">{String(index + 1).padStart(2, "0")}</span>
                        <span className="min-w-0 flex-1 text-sm text-neutral-600">{item.title}</span>
                        {isEnrolled ? null : <Lock className="h-4 w-4 shrink-0 text-neutral-400" aria-label="Locked" />}
                      </div>
                    )}
                  </li>
                ))}
                {curriculum.length === 0 ? (
                  <li className="px-5 py-6 text-sm text-neutral-500">No lectures have been added yet.</li>
                ) : null}
              </Panel>
            </section>

            {/* REVIEWS */}
            <section aria-labelledby="reviews-title" className="mt-10">
              <h2 id="reviews-title" className="text-xl font-bold tracking-tight text-[#171717]">Student reviews</h2>
              <div className="mt-4 space-y-6">
                {canReview && (
                  <ReviewForm
                    courseId={currentCourseDetailsId}
                    auth={auth}
                    onReviewSubmitted={() => fetchReviews(currentCourseDetailsId)}
                  />
                )}

                <ReviewList
                  reviews={reviews}
                  averageRating={averageRating}
                  totalReviews={totalReviews}
                  currentUserId={auth?.user?._id}
                  onReviewUpdated={() => fetchReviews(currentCourseDetailsId)}
                  onReviewDeleted={() => fetchReviews(currentCourseDetailsId)}
                />
              </div>
            </section>
          </main>

          {/* RIGHT COLUMN — purchase card */}
          <aside className="order-first min-w-0 lg:order-none">
            <FadeIn delay={0.05} className="lg:sticky lg:top-24">
              <Panel className="overflow-hidden">
                {freePreviewIndex !== -1 ? (
                  <div className="aspect-video w-full overflow-hidden border-b border-[#E5E5E5] bg-black">
                    <VideoPlayer
                      url={curriculum[freePreviewIndex]?.videoUrl}
                      width="100%"
                      height="100%"
                    />
                  </div>
                ) : (
                  <CourseThumbnail src={course?.image} title={course?.title} className="border-b border-[#E5E5E5]" />
                )}
                <div className="p-6">
                  <div className="text-3xl font-bold text-[#0A0A0A]">${course?.pricing}</div>

                  <Button
                    onClick={handleCreatePayment}
                    className={cn(btnPrimary, "mt-4 h-11 w-full text-base")}
                    disabled={isProcessingPayment}
                  >
                    {ctaLabel}
                  </Button>
                  {!isEnrolled && !isFreeCourse ? (
                    <p className="mt-2 text-center text-xs text-neutral-500">Secure checkout with Razorpay (test mode)</p>
                  ) : null}

                  <ul className="mt-6 space-y-2.5 border-t border-[#E5E5E5] pt-5 text-sm text-neutral-700">
                    <li className="flex items-center gap-2.5">
                      <ListVideo className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                      {curriculum.length} video {curriculum.length === 1 ? "lecture" : "lectures"}
                    </li>
                    {level ? (
                      <li className="flex items-center gap-2.5">
                        <BarChart3 className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                        {level} level
                      </li>
                    ) : null}
                    <li className="flex items-center gap-2.5">
                      <TrendingUp className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                      Progress tracked per lecture
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Award className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                      Includes a certificate of completion
                    </li>
                  </ul>
                </div>
              </Panel>
            </FadeIn>
          </aside>
        </div>
      </PageContainer>

      {/* FREE PREVIEW DIALOG */}
      <Dialog
        open={showFreePreviewDialog}
        onOpenChange={() => {
          setShowFreePreviewDialog(false);
          setDisplayCurrentVideoFreePreview(null);
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] max-w-3xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Course preview</DialogTitle>
          </DialogHeader>

          <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
            <VideoPlayer
              url={displayCurrentVideoFreePreview}
              width="100%"
              height="100%"
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className={btnSecondary}>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentViewCourseDetailsPage;
