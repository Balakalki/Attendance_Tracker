import { useForm } from "react-hook-form";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import {
  FieldShell,
  IconInput,
  PasswordInput,
  Alert,
  primaryButtonClass,
  ghostActionClass,
} from "../components/auth/AuthField";

// Shared demo account so visitors can try the app without signing up.
const DEMO_CREDENTIALS = {
  email: "aluribalakalki5@gmail.com",
  password: "123456",
};

const LogIn = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);

  const login = async (credentials) => {
    setServerError(null);
    await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/api/auth/login`,
      credentials,
      { withCredentials: true }
    );
    navigate("/");
  };

  const handleFormSubmit = async (data) => {
    try {
      await login(data);
    } catch (error) {
      setServerError(error.response?.data?.message || "something went wrong");
    }
  };

  const handleDemoLogin = async () => {
    try {
      setDemoLoading(true);
      await login(DEMO_CREDENTIALS);
    } catch (error) {
      setServerError(error.response?.data?.message || "something went wrong");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to track your attendance and stay in the safe zone."
      footer={
        <>
          Don&rsquo;t have an account?{" "}
          <Link to="/signup" className="font-semibold text-violet-600 hover:text-violet-700">
            Sign up
          </Link>
        </>
      }
    >
      {serverError && <Alert>{serverError}</Alert>}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        <FieldShell label="Email" htmlFor="email" error={errors.email?.message}>
          <IconInput
            icon={Mail}
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email}
            {...register("email", { required: "Email is required" })}
          />
        </FieldShell>

        <FieldShell
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
          labelRight={
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-violet-600 hover:text-violet-700"
            >
              Forgot password?
            </Link>
          }
        >
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            error={errors.password}
            {...register("password", { required: "Password is required" })}
          />
        </FieldShell>

        <button
          type="submit"
          disabled={isSubmitting || demoLoading}
          className={primaryButtonClass}
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <button
        type="button"
        onClick={handleDemoLogin}
        disabled={isSubmitting || demoLoading}
        className={`${ghostActionClass} w-full`}
      >
        {demoLoading && <Loader2 className="size-4 animate-spin" />}
        {demoLoading ? "Signing in…" : "Try the demo account"}
      </button>
    </AuthLayout>
  );
};

export default LogIn;
