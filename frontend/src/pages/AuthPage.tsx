import { useState } from "react";
import { login, register, verifyEmail } from "../services/authService";
import "./AuthPage.css";

interface AuthPageProps {
  onBack: () => void;
  onLoginSuccess: () => void;
}

type AuthMode = "login" | "register" | "verify";

export default function AuthPage({ onBack, onLoginSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await login({ email, password });
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      await register({ name, email, password });

      setSuccess("Account created. Please check your email for the verification code.");
      setMode("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await verifyEmail(email, verificationCode);
      setSuccess("Your email has been verified. You can now log in.");

      setMode("login");
      setPassword("");
      setVerificationCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <button className="auth-back-button" onClick={onBack}>
          ← Back to Shopping
        </button>

        <div className="auth-card">
          <div className="auth-brand">
            <div className="auth-logo">🛍️</div>
            <h1>
              Backyard <span>Shopping</span>
            </h1>
            <p>Your neighbourhood, your marketplace</p>
          </div>

          {mode !== "verify" && (
            <div className="auth-tabs">
              <button
                className={mode === "login" ? "active" : ""}
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccess("");
                }}
              >
                Login
              </button>

              <button
                className={mode === "register" ? "active" : ""}
                onClick={() => {
                  setMode("register");
                  setError("");
                  setSuccess("");
                }}
              >
                Create Account
              </button>
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          {mode === "login" && (
            <form onSubmit={handleLogin} className="auth-form">
              <h2>Welcome back</h2>
              <p>Log in to your Backyard Shopping account.</p>

              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

              <label>Password</label>

              <div className="auth-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button type="submit" className="auth-submit-button" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>

              <div className="auth-switch">
                Don't have an account?{" "}
                <button type="button" onClick={() => setMode("register")}>
                  Create Account
                </button>
              </div>
            </form>
          )}

          {mode === "register" && (
            <form onSubmit={handleRegister} className="auth-form">
              <h2>Create your account</h2>
              <p>Join your local neighbourhood marketplace.</p>

              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />

              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

              <label>Password</label>
              <div className="auth-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <label>Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />

              <button type="submit" className="auth-submit-button" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </button>

              <div className="auth-switch">
                Already have an account?{" "}
                <button type="button" onClick={() => setMode("login")}>
                  Login
                </button>
              </div>
            </form>
          )}

          {mode === "verify" && (
            <form onSubmit={handleVerification} className="auth-form">
              <div className="verification-icon">✉️</div>

              <h2>Verify your email</h2>

              <p>
                We sent a verification code to <strong>{email}</strong>.
              </p>

              <label>Verification Code</label>

              <input
                type="text"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter your code"
                maxLength={6}
                inputMode="numeric"
                required
              />

              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? "Verifying..." : "Verify Email"}
              </button>

              <button
                type="button"
                className="auth-secondary-button"
                onClick={() => {
                  setMode("register");
                  setError("");
                  setSuccess("");
                }}
              >
                Back to Registration
              </button>
            </form>
          )}
        </div>

        <p className="auth-footer">
          © Backyard Shopping · Your local marketplace
        </p>
      </div>
    </div>
  );
}