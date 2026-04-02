import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await login(email, password);
      navigate("/admin");
    } catch (err: any) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form
        onSubmit={handleSubmit}
        className="glass-panel p-6 rounded-xl w-full max-w-sm space-y-4"
      >
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Customer Login
        </h1>

        {error && (
          <p className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Input
          type="email"
          placeholder="customer@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={loading || !email || !password}
        >
          {loading ? "Signing in..." : "Login"}
        </Button>

        <p className="text-sm text-muted-foreground text-center">
          New here?{" "}
          <Link to="/signup" className="text-primary">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
