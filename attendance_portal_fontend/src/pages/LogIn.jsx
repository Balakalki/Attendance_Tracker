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
} from "../components/auth/AuthField";

const LogIn = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const handleFormSubmit = async (data) => {
    try {
      setServerError(null);
      await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/auth/login`,
        data,
        { withCredentials: true }
      );
      navigate("/");
    } catch (error) {
      setServerError(error.response?.data?.message || "something went wrong");
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

        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
        <span className="font-semibold text-slate-600">Demo access</span> — log in with{" "}
        <code className="rounded bg-white px-1.5 py-0.5 text-[11px] text-slate-700 ring-1 ring-slate-200">
          aluribalakalki5@gmail.com
        </code>{" "}
        /{" "}
        <code className="rounded bg-white px-1.5 py-0.5 text-[11px] text-slate-700 ring-1 ring-slate-200">
          123456
        </code>
      </div>
    </AuthLayout>
  );
};

export default LogIn;
