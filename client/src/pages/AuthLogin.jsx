import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const videoRef = useRef(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Username and Password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userData = await login(username, password);
      navigate(userData.role === "admin" ? "/admin" : "/waiter");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

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
      <div className="absolute inset-0 bg-black/60" />

      {/* Center Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.4em] text-emerald-400">
            RESTAURANT
          </p>

          <h1 className="mb-3 text-5xl font-bold text-white">
            Login
          </h1>

          <p className="mb-10 text-white/80">
            Access your restaurant dashboard
          </p>

          {error && (
            <div className="mb-5 rounded-xl bg-red-500/20 px-4 py-3 text-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              disabled={loading}
              className="w-full rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-6 py-4 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={loading}
              className="w-full rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-6 py-4 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-emerald-500 py-4 text-sm font-bold uppercase tracking-[0.15em] text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {loading ? "LOGGING IN..." : "LOGIN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthLogin;