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
import { Check, ChevronLeft, ChevronRight, Play, X, Download } from "lucide-react";
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

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#0a0a0f] text-foreground">
      {showConfetti && <Confetti />}

      <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-[#121218]/95 px-3 backdrop-blur md:px-4">
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
          <h1 className="truncate text-sm font-semibold md:text-base">
            {studentCurrentCourseProgress?.courseDetails?.title}
          </h1>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsSideBarOpen(!isSideBarOpen)}
          className="shrink-0 border-white/10 bg-white/5"
        >
          <span className="mr-1 hidden sm:inline">
            {isSideBarOpen ? "Hide" : "Show"}
          </span>
          {isSideBarOpen ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </header>

      <div className="relative flex min-h-0 flex-1">
        {isSideBarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 top-14 z-30 bg-black/60 lg:hidden"
            onClick={() => setIsSideBarOpen(false)}
          />
        )}

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="relative w-full shrink-0 bg-black lg:min-h-0 lg:flex-1">
            <div className="aspect-video w-full max-h-[45vh] lg:max-h-none lg:h-full lg:min-h-[280px] lg:max-h-[calc(100dvh-8rem)]">
              <VideoPlayer
                key={currentLecture?._id || "no-lecture"}
                width="100%"
                height="100%"
                url={currentLecture?.videoUrl}
                onProgressUpdate={handleVideoComplete}
              />
            </div>
          </div>
          <div className="shrink-0 border-t border-white/10 bg-[#121218] px-4 py-4 md:px-6">
            <h2 className="text-lg font-bold md:text-xl">
              {currentLecture?.title || "Course Lecture"}
            </h2>
          </div>
        </main>

        <aside
          className={cn(
            "z-40 flex w-full max-w-[min(100%,400px)] flex-col border-l border-white/10 bg-[#121218] transition-transform duration-300 ease-out",
            "fixed bottom-0 right-0 top-14 lg:static lg:top-auto lg:w-[380px] lg:max-w-[400px] lg:shrink-0 xl:w-[400px]",
            isSideBarOpen
              ? "translate-x-0"
              : "translate-x-full lg:hidden"
          )}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 lg:hidden">
            <span className="text-sm font-medium">Course content</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsSideBarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Tabs defaultValue="content" className="flex min-h-0 flex-1 flex-col">
            <TabsList className="grid h-12 w-full shrink-0 grid-cols-2 rounded-none border-b border-white/10 bg-transparent p-0">
              <TabsTrigger
                value="content"
                className="rounded-none data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300"
              >
                Content
              </TabsTrigger>
              <TabsTrigger
                value="overview"
                className="rounded-none data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300"
              >
                Overview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-0 min-h-0 flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(100dvh-10rem)] lg:h-[calc(100dvh-7rem)]">
                <div className="space-y-1 p-3">
                  {curriculum.map((item) => {
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
                          "flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                          isActive
                            ? "bg-indigo-500/20 text-indigo-200"
                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                        )}
                      >
                        {isViewed ? (
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        ) : (
                          <Play className="mt-0.5 h-4 w-4 shrink-0" />
                        )}
                        <span className="line-clamp-2 font-medium">{item?.title}</span>
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

      <Dialog open={lockCourse}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>You can&apos;t view this page</DialogTitle>
            <DialogDescription>
              Please purchase this course to get access
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={showCourseCompleteDialog}>
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
