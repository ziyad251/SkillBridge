import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { btnPrimary, btnSecondary, Kicker, Panel, ProgressBar } from "@/components/student-view/ui";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoPlayer from "@/components/video-player";
import { cn } from "@/lib/utils";
import {
  getCurrentCourseProgressService,
  markLectureAsViewedService,
  resetCourseProgressService,
  downloadCertificateService,
} from "@/services";
import { Award, BadgeCheck, Check, ChevronLeft, ChevronRight, Download, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import { useNavigate, useParams } from "react-router-dom";

function StudentViewCourseProgressPage({
  auth,
  studentCurrentCourseProgress,
  setStudentCurrentCourseProgress,
}) {
  const navigate = useNavigate();
  const [lockCourse, setLockCourse] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [showCourseCompleteDialog, setShowCourseCompleteDialog] =
    useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const [isDownloadingCertificate, setIsDownloadingCertificate] = useState(false);
  const markedLectureRef = useRef(null);
  const currentLectureRef = useRef(null);
  const { id } = useParams();

  useEffect(() => {
    currentLectureRef.current = currentLecture;
  }, [currentLecture]);

  async function fetchCurrentCourseProgress(preserveLectureId) {
    const response = await getCurrentCourseProgressService(auth?.user?._id, id);
    if (response?.success) {
      if (!response?.data?.isPurchased) {
        setLockCourse(true);
      } else {
        setStudentCurrentCourseProgress({
          courseDetails: response?.data?.courseDetails,
          progress: response?.data?.progress,
          completed: Boolean(response?.data?.completed),
        });

        if (response?.data?.completed) {
          setCurrentLecture(response?.data?.courseDetails?.curriculum[0]);
          setShowCourseCompleteDialog(true);
          setShowConfetti(true);
          return;
        }

        const curriculum = response?.data?.courseDetails?.curriculum || [];

        if (preserveLectureId) {
          const preserved = curriculum.find(
            (item) => String(item._id) === String(preserveLectureId)
          );
          if (preserved) {
            setCurrentLecture(preserved);
            return;
          }
        }

        if (response?.data?.progress?.length === 0) {
          setCurrentLecture(curriculum[0]);
        } else {
          const lastIndexOfViewedAsTrue = response?.data?.progress.reduceRight(
            (acc, obj, index) => {
              return acc === -1 && obj.viewed ? index : acc;
            },
            -1
          );

          setCurrentLecture(curriculum[lastIndexOfViewedAsTrue + 1] || curriculum[0]);
        }
      }
    }
  }

  async function updateCourseProgress(lectureId) {
    const lectureToMark = lectureId || currentLecture?._id;
    if (!lectureToMark || markedLectureRef.current === lectureToMark) {
      return;
    }

    markedLectureRef.current = lectureToMark;

    const response = await markLectureAsViewedService(
      auth?.user?._id,
      studentCurrentCourseProgress?.courseDetails?._id || id,
      lectureToMark
    );

    if (response?.success) {
      await fetchCurrentCourseProgress(lectureToMark);
    } else {
      markedLectureRef.current = null;
    }
  }

  function handleVideoComplete() {
    const lecture = currentLectureRef.current;
    if (lecture?._id) {
      updateCourseProgress(lecture._id);
    }
  }

  async function handleRewatchCourse() {
    const response = await resetCourseProgressService(
      auth?.user?._id,
      studentCurrentCourseProgress?.courseDetails?._id
    );

    if (response?.success) {
      markedLectureRef.current = null;
      setCurrentLecture(null);
      setShowConfetti(false);
      setShowCourseCompleteDialog(false);
      fetchCurrentCourseProgress();
    }
  }

  async function handleDownloadCertificate() {
    try {
      setIsDownloadingCertificate(true);
      await downloadCertificateService(id);
    } catch (error) {
      console.error("Certificate download error:", error);
      alert("Failed to download certificate. Please try again.");
    } finally {
      setIsDownloadingCertificate(false);
    }
  }

  function handleSelectLecture(lecture) {
    markedLectureRef.current = null;
    setCurrentLecture(lecture);
  }

  useEffect(() => {
    markedLectureRef.current = null;
    fetchCurrentCourseProgress();
  }, [id]);

  useEffect(() => {
    if (showConfetti) setTimeout(() => setShowConfetti(false), 15000);
  }, [showConfetti]);

  const curriculum = studentCurrentCourseProgress?.courseDetails?.curriculum || [];
  const completedLectureCount = curriculum.filter((lecture) =>
    studentCurrentCourseProgress?.progress?.some(
      (progress) => progress.lectureId === lecture._id && progress.viewed
    )
  ).length;
  const courseProgressPercent = curriculum.length
    ? Math.round((completedLectureCount / curriculum.length) * 100)
    : 0;
  const isCourseComplete =
    Boolean(studentCurrentCourseProgress?.completed) ||
    (curriculum.length > 0 && completedLectureCount === curriculum.length);
  const currentIndex = curriculum.findIndex((item) => item._id === currentLecture?._id);
  const previousLecture = currentIndex > 0 ? curriculum[currentIndex - 1] : null;
  const nextLecture =
    currentIndex !== -1 && currentIndex < curriculum.length - 1 ? curriculum[currentIndex + 1] : null;
  const remainingLectures = Math.max(0, curriculum.length - completedLectureCount);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#FAFAFA] text-[#171717]">
      {showConfetti && <Confetti colors={["#0A0A0A", "#404040", "#737373", "#A3A3A3", "#D4D4D4"]} />}

      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[#E5E5E5] bg-white/90 px-3 backdrop-blur-xl md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-4">
          <Button
            type="button"
            onClick={() => navigate("/student-courses")}
            variant="ghost"
            size="sm"
            className="shrink-0 rounded-full text-neutral-600 hover:bg-[#0A0A0A]/5 hover:text-[#0A0A0A]"
          >
            <ChevronLeft className="h-4 w-4 md:mr-1" aria-hidden="true" />
            <span className="hidden sm:inline">My courses</span>
            <span className="sr-only sm:hidden">Back to my courses</span>
          </Button>
          <span className="hidden h-6 w-px bg-[#E5E5E5] sm:block" aria-hidden="true" />
          <h1 className="min-w-0 truncate text-sm font-semibold md:text-base">
            {studentCurrentCourseProgress?.courseDetails?.title || "Course"}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden w-40 sm:block">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">Progress</span>
              <span className="font-semibold tabular-nums">{courseProgressPercent}%</span>
            </div>
            <ProgressBar value={courseProgressPercent} className="mt-1.5" label="Course progress" />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsSideBarOpen(!isSideBarOpen)}
            aria-expanded={isSideBarOpen}
            aria-controls="course-content"
            className={cn(btnSecondary, "h-8 px-3 lg:hidden")}
          >
            {isSideBarOpen ? "Hide content" : "Content"}
          </Button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col lg:flex-row">
        <main className="min-w-0 flex-1 px-3 py-4 md:px-6 md:py-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
              <VideoPlayer
                key={currentLecture?._id || "no-lecture"}
                width="100%"
                height="100%"
                url={currentLecture?.videoUrl}
                onProgressUpdate={handleVideoComplete}
              />
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                {currentIndex !== -1 ? (
                  <Kicker>
                    Lecture {currentIndex + 1} of {curriculum.length}
                  </Kicker>
                ) : null}
                <h2 className="mt-1.5 text-xl font-bold tracking-tight md:text-2xl">
                  {currentLecture?.title || "Select a lecture"}
                </h2>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className={cn(btnSecondary, "h-10 flex-1 sm:flex-none")}
                  disabled={!previousLecture}
                  onClick={() => previousLecture && handleSelectLecture(previousLecture)}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                  Previous
                </Button>
                <Button
                  type="button"
                  className={cn(btnPrimary, "h-10 flex-1 sm:flex-none")}
                  disabled={!nextLecture}
                  onClick={() => nextLecture && handleSelectLecture(nextLecture)}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>

            {/* Certificate */}
            <section aria-labelledby="certificate-title" className="mt-8">
              {isCourseComplete ? (
                <Panel className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#E5E5E5] bg-[#FAFAFA]">
                    <BadgeCheck className="h-6 w-6 text-[#0A0A0A]" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 id="certificate-title" className="font-semibold">Certificate ready</h3>
                    <p className="mt-0.5 text-sm text-neutral-600">
                      You&apos;ve completed all {curriculum.length} lectures. Download your PDF certificate.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleDownloadCertificate}
                    disabled={isDownloadingCertificate}
                    className={cn(btnPrimary, "h-10")}
                  >
                    <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                    {isDownloadingCertificate ? "Downloading..." : "Download PDF"}
                  </Button>
                </Panel>
              ) : (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#E5E5E5] bg-[#FAFAFA]">
                      <Award className="h-6 w-6 text-neutral-400" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 id="certificate-title" className="font-semibold">Certificate of completion</h3>
                      <p className="mt-0.5 text-sm text-neutral-600">
                        {curriculum.length > 0
                          ? `Finish ${remainingLectures} more ${remainingLectures === 1 ? "lecture" : "lectures"} to unlock your PDF certificate.`
                          : "Complete every lecture to unlock your PDF certificate."}
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <ProgressBar value={courseProgressPercent} className="flex-1" label="Progress towards certificate" />
                        <span className="text-xs font-semibold tabular-nums">
                          {completedLectureCount}/{curriculum.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>

        <aside
          id="course-content"
          className={cn(
            "w-full border-t border-[#E5E5E5] bg-white lg:sticky lg:top-16 lg:h-[calc(100dvh-4rem)] lg:w-[380px] lg:shrink-0 lg:border-l lg:border-t-0 xl:w-[400px]",
            isSideBarOpen ? "flex flex-col" : "hidden lg:flex lg:flex-col"
          )}
        >
          <div className="border-b border-[#E5E5E5] px-5 py-5">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-lg font-bold tracking-tight">Course content</h2>
              <span className="text-sm text-neutral-500">
                {completedLectureCount} of {curriculum.length} done
              </span>
            </div>
            <ProgressBar value={courseProgressPercent} className="mt-3" label="Course progress" />
          </div>

          <Tabs defaultValue="content" className="flex min-h-0 flex-1 flex-col">
            <TabsList className="grid h-11 w-full shrink-0 grid-cols-2 rounded-none border-b border-[#E5E5E5] bg-transparent p-0">
              <TabsTrigger
                value="content"
                className="h-full rounded-none border-b-2 border-transparent text-neutral-500 shadow-none data-[state=active]:border-[#0A0A0A] data-[state=active]:bg-transparent data-[state=active]:text-[#0A0A0A] data-[state=active]:shadow-none"
              >
                Lectures
              </TabsTrigger>
              <TabsTrigger
                value="overview"
                className="h-full rounded-none border-b-2 border-transparent text-neutral-500 shadow-none data-[state=active]:border-[#0A0A0A] data-[state=active]:bg-transparent data-[state=active]:text-[#0A0A0A] data-[state=active]:shadow-none"
              >
                Overview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-0 min-h-0 flex-1 overflow-hidden">
              <ScrollArea className="h-[min(60dvh,560px)] lg:h-full">
                <ol className="space-y-1 p-3">
                  {curriculum.map((item, index) => {
                    const isViewed = studentCurrentCourseProgress?.progress?.find(
                      (p) => p.lectureId === item._id
                    )?.viewed;
                    const isActive = currentLecture?._id === item._id;

                    return (
                      <li key={item._id}>
                        <button
                          type="button"
                          onClick={() => handleSelectLecture(item)}
                          aria-current={isActive ? "true" : undefined}
                          className={cn(
                            "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left text-sm transition-colors",
                            isActive
                              ? "border-[#E5E5E5] bg-[#F5F5F5] text-[#0A0A0A]"
                              : "border-transparent text-neutral-600 hover:bg-neutral-50 hover:text-[#0A0A0A]"
                          )}
                        >
                          {isViewed ? (
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0A0A0A]">
                              <Check className="h-3 w-3 text-white" strokeWidth={3} aria-hidden="true" />
                              <span className="sr-only">Completed:</span>
                            </span>
                          ) : (
                            <span
                              className={cn(
                                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                                isActive ? "border-[#0A0A0A]" : "border-neutral-300"
                              )}
                            >
                              {isActive ? <Play className="h-2.5 w-2.5 fill-[#0A0A0A] text-[#0A0A0A]" aria-hidden="true" /> : null}
                            </span>
                          )}
                          <span className="flex min-w-0 flex-1 gap-2">
                            <span className="pt-px text-xs tabular-nums text-neutral-400">{String(index + 1).padStart(2, "0")}</span>
                            <span className={cn("line-clamp-2", isActive && "font-semibold")}>{item?.title}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="overview" className="mt-0 min-h-0 flex-1 overflow-hidden">
              <ScrollArea className="h-[min(60dvh,560px)] lg:h-full">
                <div className="p-5">
                  <h3 className="mb-2 font-semibold">About this course</h3>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-600">
                    {studentCurrentCourseProgress?.courseDetails?.description || "No description provided."}
                  </p>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </aside>
      </div>

      <Dialog open={lockCourse} onOpenChange={setLockCourse}>
        <DialogContent className="w-[calc(100vw-2rem)] rounded-2xl sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>You don&apos;t have access to this course</DialogTitle>
            <DialogDescription>
              Enroll in this course to start watching its lectures.
            </DialogDescription>
          </DialogHeader>
          <Button className={cn(btnPrimary, "h-10")} onClick={() => navigate(`/course/details/${id}`)}>
            View course
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showCourseCompleteDialog}
        onOpenChange={setShowCourseCompleteDialog}
      >
        <DialogContent className="w-[calc(100vw-2rem)] rounded-2xl sm:max-w-[425px]">
          <DialogHeader>
            <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-[#E5E5E5] bg-[#FAFAFA]">
              <BadgeCheck className="h-6 w-6 text-[#0A0A0A]" aria-hidden="true" />
            </span>
            <DialogTitle>Course complete</DialogTitle>
            <DialogDescription>
              You&apos;ve finished every lecture in this course. Your certificate is ready to download.
            </DialogDescription>
          </DialogHeader>
          <ProgressBar value={100} label="Course progress" />
          <div className="mt-2 flex flex-col gap-2">
            <Button
              type="button"
              onClick={handleDownloadCertificate}
              disabled={isDownloadingCertificate}
              className={cn(btnPrimary, "h-10 w-full")}
            >
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              {isDownloadingCertificate ? "Downloading..." : "Download certificate"}
            </Button>
            <Button type="button" variant="outline" className={cn(btnSecondary, "h-10 w-full")} onClick={() => navigate("/student-courses")}>
              Back to my courses
            </Button>
            <Button type="button" variant="ghost" className="h-10 w-full rounded-full" onClick={handleRewatchCourse}>
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
              Rewatch course
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentViewCourseProgressPage;
