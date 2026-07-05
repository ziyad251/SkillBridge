import { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";

function VideoPlayer({
  width = "100%",
  height = "100%",
  url,
  onProgressUpdate,
  className,
}) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const completedRef = useRef(false);

  function handlePlayAndPause() {
    setPlaying(!playing);
  }

  function handleProgress(state) {
    if (!seeking) {
      setPlayed(state.played);
    }
  }

  function handleRewind() {
    playerRef?.current?.seekTo(playerRef?.current?.getCurrentTime() - 5);
  }

  function handleForward() {
    playerRef?.current?.seekTo(playerRef?.current?.getCurrentTime() + 5);
  }

  function handleToggleMute() {
    setMuted(!muted);
  }

  function handleSeekChange(newValue) {
    setPlayed(newValue[0]);
    setSeeking(true);
  }

  function handleSeekMouseUp() {
    setSeeking(false);
    playerRef.current?.seekTo(played);
  }

  function handleVolumeChange(newValue) {
    setVolume(newValue[0]);
  }

  function pad(string) {
    return ("0" + string).slice(-2);
  }

  function formatTime(seconds) {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = pad(date.getUTCSeconds());

    if (hh) {
      return `${hh}:${pad(mm)}:${ss}`;
    }

    return `${mm}:${ss}`;
  }

  const handleFullScreen = useCallback(() => {
    const el = playerContainerRef?.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  function handleMouseMove() {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  }

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (
      played === 1 &&
      !completedRef.current &&
      typeof onProgressUpdate === "function"
    ) {
      completedRef.current = true;
      onProgressUpdate();
    }
  }, [played, onProgressUpdate]);

  useEffect(() => {
    setPlayed(0);
    setPlaying(false);
    completedRef.current = false;
  }, [url]);

  const useFillLayout = width === "100%" && height === "100%";

  return (
    <div
      ref={playerContainerRef}
      className={cn(
        "group relative overflow-hidden bg-black",
        isFullScreen && "fixed inset-0 z-[100] h-screen w-screen",
        useFillLayout ? "h-full w-full" : "rounded-lg shadow-2xl",
        className
      )}
      style={useFillLayout ? undefined : { width, height }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="absolute inset-0 [&_video]:object-contain">
        <ReactPlayer
          ref={playerRef}
          className="!absolute !left-0 !top-0"
          width="100%"
          height="100%"
          url={url}
          playing={playing}
          volume={volume}
          muted={muted}
          onProgress={handleProgress}
          controls={false}
        />
      </div>

      {!url ? (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          Select a lecture to start watching
        </div>
      ) : null}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 transition-opacity duration-300 md:p-4",
          showControls ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <Slider
          value={[played * 100]}
          max={100}
          step={0.1}
          onValueChange={(value) => handleSeekChange([value[0] / 100])}
          onValueCommit={handleSeekMouseUp}
          className="mb-3 w-full"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayAndPause}
              className="h-9 w-9 text-white hover:bg-white/20 hover:text-white"
            >
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button
              onClick={handleRewind}
              className="h-9 w-9 text-white hover:bg-white/20 hover:text-white"
              variant="ghost"
              size="icon"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
            <Button
              onClick={handleForward}
              className="h-9 w-9 text-white hover:bg-white/20 hover:text-white"
              variant="ghost"
              size="icon"
            >
              <RotateCw className="h-5 w-5" />
            </Button>
            <Button
              onClick={handleToggleMute}
              className="h-9 w-9 text-white hover:bg-white/20 hover:text-white"
              variant="ghost"
              size="icon"
            >
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              onValueChange={(value) => handleVolumeChange([value[0] / 100])}
              className="hidden w-20 sm:flex md:w-24"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/90 tabular-nums md:text-sm">
              {formatTime(played * (playerRef?.current?.getDuration() || 0))} /{" "}
              {formatTime(playerRef?.current?.getDuration() || 0)}
            </span>
            <Button
              className="h-9 w-9 text-white hover:bg-white/20 hover:text-white"
              variant="ghost"
              size="icon"
              onClick={handleFullScreen}
            >
              {isFullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
