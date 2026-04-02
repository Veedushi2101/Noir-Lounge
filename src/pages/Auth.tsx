import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ADMIN_EMAILS = ["viean.growthos@gmail.com"];
const googleProvider = new GoogleAuthProvider();

const AuthPage = () => {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
const [passwordVisible, setPasswordVisible] = useState(false);
  const routeAfterLogin = (userEmail: string | null) => {
    if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
      navigate("/admin");
    } else {
      navigate("/book");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  // Basic client-side validation
  if (!email.includes("@")) {
    setError("Please enter a valid email address.");
    return;
  }

  if (password.length < 6) {
    setError("Password must be at least 6 characters long.");
    return;
  }

  setLoading(true);

  try {
    if (mode === "signup") {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      routeAfterLogin(cred.user.email ?? "");
    } else {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      routeAfterLogin(cred.user.email ?? "");
    }
  } catch (err: any) {
    const code = err?.code;
 console.error("Auth error:", err);   // 🔹 this will show the real error in DevTools
    if (mode === "signup" && code === "auth/email-already-in-use") {
      setError("An account with this email already exists. Please login instead.");
      setMode("login");
    } else if (mode === "login" && code === "auth/wrong-password") {
      setError("Incorrect password. Please try again or reset your password.");
    } else if (code === "auth/user-not-found") {
      setError("No account found with this email. Try signing up first.");
    } else if (code === "auth/invalid-email") {
      setError("This email address is not valid.");
    } else if (code === "auth/weak-password") {
      setError("Password is too weak. Please choose a stronger one.");
    } else {
      setError("Something went wrong. Please check your details and try again.");
    }
  } finally {
    setLoading(false);
  }
};


  const handleGoogleLogin = async () => {
  setError(null);
  setLoading(true);
  try {
    const result = await signInWithPopup(auth, googleProvider);
    routeAfterLogin(result.user.email);
  } catch (err: any) {
    console.error("Google sign-in error:", err); // <- check DevTools console
    setError("Google sign-in failed. Please try again.");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="glass-panel p-6 rounded-xl w-full max-w-sm">
        {/* Tabs */}
        <div className="flex justify-center gap-6 mb-6">
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`text-sm font-medium border-b-2 pb-1 ${
              mode === "signup"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Signup
          </button>
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`text-sm font-medium border-b-2 pb-1 ${
              mode === "login"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Login
          </button>
        </div>

        {/* Title */}
        <h1 className="font-serif text-2xl font-bold text-foreground mb-2 text-center">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive mb-4 text-center">{error}</p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
  <Input
    type="email"
    placeholder="you@example.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
  />

  {/* Password with show/hide toggle */}
  <div className="relative">
    <Input
      type={passwordVisible ? "text" : "password"}
      placeholder={mode === "signup" ? "Choose a password" : "Your password"}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      className="pr-16"
    />
    <button
      type="button"
      onClick={() => setPasswordVisible((v) => !v)}
      className="absolute inset-y-0 right-0 flex items-center px-3 text-xs text-muted-foreground hover:text-foreground"
    >
      {passwordVisible ? "Hide" : "Show"}
    </button>
  </div>

  <Button
    type="submit"
    className="w-full gold-glow-sm"
    disabled={loading || !email || !password}
  >
    {loading
      ? mode === "signup"
        ? "Signing up..."
        : "Logging in..."
      : mode === "signup"
      ? "Sign Up"
      : "Login"}
  </Button>
</form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-border" />
          <span className="px-2 text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Google button */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          Continue with Google
        </Button>
      </div>
    </div>
  );
};

export default AuthPage;
