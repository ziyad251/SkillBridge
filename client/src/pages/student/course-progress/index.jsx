import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import { Check, ChevronLeft, Play, Download } from "lucide-react";
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

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#090D0E] text-white">
      {showConfetti && <Confetti />}

      <header className="sticky top-0 z-50 flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#111819]/95 px-3 backdrop-blur md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-4">
          <Button
            type="button"
            onClick={() => navigate("/student-courses")}
            variant="ghost"
            size="sm"
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4 md:mr-1" />
            <span className="hidden sm:inline">My Courses</span>
          </Button>
          <div className="min-w-0">
            <p className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-[#6ED0BE] sm:block">Now learning</p>
            <h1 className="truncate text-sm font-semibold md:text-base">
              {studentCurrentCourseProgress?.courseDetails?.title || "Course learning"}
            </h1>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs text-white/55">Course progress</p>
            <p className="text-sm font-semibold text-[#F5B83D]">{courseProgressPercent}% complete</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsSideBarOpen(!isSideBarOpen)}
            className="shrink-0 border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white lg:hidden"
          >
            {isSideBarOpen ? "Hide content" : "Course content"}
          </Button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col lg:flex-row">
        <main className="min-w-0 flex-1">
          <div className="flex justify-center border-b border-white/10 bg-[#050707] p-3 md:p-6">
            <div className="aspect-video w-full max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-black shadow-2xl shadow-black/40">
              <VideoPlayer
                key={currentLecture?._id || "no-lecture"}
                width="100%"
                height="100%"
                url={currentLecture?.videoUrl}
                onProgressUpdate={handleVideoComplete}
              />
            </div>
          </div>
          <div className="border-b border-white/10 bg-[#111819] px-4 py-5 md:px-8">
            <div className="mx-auto flex max-w-5xl items-start justify-between gap-4">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#E8755E]">Current lecture</p>
                <h2 className="text-lg font-bold md:text-2xl">
                  {currentLecture?.title || "Course Lecture"}
                </h2>
              </div>
              <div className="hidden min-w-40 text-right sm:block">
                <p className="text-xs text-white/55">{completedLectureCount} of {curriculum.length} lectures</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[#F5B83D] transition-all" style={{ width: `${courseProgressPercent}%` }} />
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside
          className={cn(
            "w-full border-t border-white/10 bg-[#111819] lg:w-[380px] lg:shrink-0 lg:border-l lg:border-t-0 xl:w-[410px]",
            isSideBarOpen ? "block" : "hidden lg:block"
          )}
        >
          <div className="border-b border-white/10 px-5 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6ED0BE]">Course content</p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <h2 className="text-lg font-bold">Your learning path</h2>
              <span className="text-sm font-semibold text-[#F5B83D]">{courseProgressPercent}%</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[#F5B83D] transition-all" style={{ width: `${courseProgressPercent}%` }} />
            </div>
          </div>

          <Tabs defaultValue="content" className="flex min-h-0 flex-1 flex-col">
            <TabsList className="grid h-12 w-full shrink-0 grid-cols-2 rounded-none border-b border-white/10 bg-transparent p-0">
              <TabsTrigger
                value="content"
                className="rounded-none data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                Content
              </TabsTrigger>
              <TabsTrigger
                value="overview"
                className="rounded-none data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                Overview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-0 min-h-0 flex-1 overflow-hidden">
              <ScrollArea className="h-[min(60dvh,560px)] lg:h-[calc(100dvh-9rem)]">
                <div className="space-y-1 p-3">
                  {curriculum.map((item, index) => {
                    const isViewed = studentCurrentCourseProgress?.progress?.find(
                      (p) => p.lectureId === item._id
                    )?.viewed;
                    const isActive = currentLecture?._id === item._id;

                    return (
                      <button
                        type="button"
                        key={item._id}
                        onClick={() => handleSelectLecture(item)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-md border border-transparent px-3 py-3 text-left text-sm transition-colors",
                          isActive
                            ? "border-[#176B5F]/50 bg-[#176B5F]/20 text-[#8BE2D0]"
                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                        )}
                      >
                        {isViewed ? (
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        ) : (
                          <Play className="mt-0.5 h-4 w-4 shrink-0" />
                        )}
                        <span className="flex min-w-0 flex-1 gap-2 font-medium"><span className="text-xs text-white/40">{String(index + 1).padStart(2, "0")}</span><span className="line-clamp-2">{item?.title}</span></span>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="overview" className="mt-0 min-h-0 flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(100dvh-10rem)] lg:h-[calc(100dvh-7rem)]">
                <div className="p-4">
                  <h2 className="mb-3 text-lg font-bold">About this course</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {studentCurrentCourseProgress?.courseDetails?.description}
                  </p>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </aside>
      </div>

      <Dialog open={lockCourse} onOpenChange={setLockCourse}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>You can&apos;t view this page</DialogTitle>
            <DialogDescription>
              Please purchase this course to get access
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showCourseCompleteDialog}
        onOpenChange={setShowCourseCompleteDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>🎉 Congratulations!</DialogTitle>
            <DialogDescription className="flex flex-col gap-4 mt-4">
              <div>
                <Label className="text-base">You have successfully completed this course</Label>
                <div className="mt-3 p-3 bg-green-50 rounded">
                  <p className="text-sm font-medium text-green-700">Progress: 100%</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={handleDownloadCertificate}
                  disabled={isDownloadingCertificate}
                  className="lms-btn-primary w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloadingCertificate ? "Downloading..." : "🎓 Download Certificate"}
                </Button>
                <Button type="button" onClick={() => navigate("/student-courses")}>
                  My Courses Page
                </Button>
                <Button type="button" onClick={handleRewatchCourse}>
                  Rewatch Course
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentViewCourseProgressPage;
