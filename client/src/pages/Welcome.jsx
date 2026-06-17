import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5; // Slow video speed
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/videos/restaurant-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-10 text-white">
        <div className="max-w-3xl w-full text-center space-y-8">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-800/80 border border-slate-700 shadow-xl backdrop-blur-sm">
            <span className="text-4xl">🍽️</span>
          </div>

          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.4em] text-slate-300">
              RestuRent
            </p>

            <h1 className="text-4xl md:text-5xl font-semibold">
              A Modern Restaurant Management Experience
            </h1>

            <p className="text-slate-200 max-w-2xl mx-auto text-base md:text-lg">
              Launch your restaurant with a streamlined login experience and
              keep your restaurant operations moving.
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => navigate("/auth/login")}
              className="rounded-3xl bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all duration-300"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;