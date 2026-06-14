import { useForm } from "react-hook-form";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Mail, KeyRound, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import {
  FieldShell,
  IconInput,
  PasswordInput,
  Alert,
  StatusText,
  primaryButtonClass,
  ghostActionClass,
} from "../components/auth/AuthField";
import { cn } from "@/lib/utils";

const Password = () => {
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const [validatingOtp, setValidatingOtp] = useState(false);
  const [getOtp, setGetOtp] = useState({ message: "", success: null });
  const [verifyOtp, setVerifyOtp] = useState({ message: "", success: null });
  const [isVerified, setIsVerified] = useState(false);
  const [isGettingOtp, setIsGettingOtp] = useState(false);

  const handleFormSubmit = async (data) => {
    if (isVerified) {
      try {
        setServerError(null);
        await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/auth/password`, data);
        navigate("/login");
      } catch (error) {
        setServerError(error.response?.data?.Error || "something went wrong");
      }
    } else {
      setServerError("Please verify your email");
    }
  };

  const generateOTP = async () => {
    setIsGettingOtp(true);
    const email = await trigger("email");
    setGetOtp({ message: "", success: null });
    if (email) {
      try {
        const getOtpRes = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/otp`, {
          email: watch("email"),
        });
        if (getOtpRes.status === 200) {
          setGetOtp({ message: "OTP sent successfully", success: true });
        }
      } catch (error) {
        console.log(error);
        setGetOtp({ message: error.response?.data?.Error, success: false });
      }
    }
    setIsGettingOtp(false);
  };

  const verifyOTP = async () => {
    setVerifyOtp({ message: "", success: null });
    const email = await trigger("email");
    if (!email) return;
    setValidatingOtp(true);

    const otp = await trigger("otp");
    if (!otp) {
      setValidatingOtp(false);
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/otp/verify`, {
        email: watch("email"),
        otp: watch("otp"),
      });

      if (res.status === 200) {
        setIsVerified(true);
      }
      setVerifyOtp({ message: res.data.message, success: true });
    } catch (err) {
      console.error("OTP error", err);
      setVerifyOtp({
        message: err.response?.data.message || "Some thing went wrong",
        success: false,
      });
    }

    setValidatingOtp(false);
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Verify your email with an OTP, then choose a new password."
      footer={
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 font-medium text-violet-600 hover:text-violet-700"
        >
          <ArrowLeft className="size-4" /> Back to log in
        </Link>
      }
    >
      {serverError && <Alert>{serverError}</Alert>}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        <FieldShell label="Email" htmlFor="email" error={errors.email?.message}>
          <div className="flex gap-2">
            <IconInput
              icon={Mail}
              wrapperClassName="flex-1"
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email}
              {...register("email", { required: "Email is required" })}
            />
            <button
              type="button"
              onClick={generateOTP}
              disabled={isGettingOtp}
              className={ghostActionClass}
            >
              {isGettingOtp ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Sending
                </>
              ) : (
                "Send OTP"
              )}
            </button>
          </div>
          <StatusText success={getOtp.success}>{getOtp.message}</StatusText>
        </FieldShell>

        <FieldShell label="OTP" htmlFor="otp" error={errors.otp?.message}>
          <div className="flex gap-2">
            <IconInput
              icon={KeyRound}
              wrapperClassName="flex-1"
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit code"
              error={errors.otp}
              disabled={isVerified}
              {...register("otp", {
                required: "OTP is required",
                pattern: { value: /^\d{6}$/, message: "OTP must be exactly 6 digits" },
              })}
            />
            <button
              type="button"
              onClick={verifyOTP}
              disabled={isVerified || validatingOtp}
              className={cn(
                ghostActionClass,
                isVerified && "border-emerald-200 bg-emerald-50 text-emerald-700"
              )}
            >
              {isVerified ? (
                <>
                  <CheckCircle2 className="size-4" /> Verified
                </>
              ) : validatingOtp ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Verifying
                </>
              ) : (
                "Verify"
              )}
            </button>
          </div>
          <StatusText success={verifyOtp.success}>{verifyOtp.message}</StatusText>
        </FieldShell>

        <FieldShell label="New password" htmlFor="password" error={errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            error={errors.password}
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "minimum 6 characters needed" },
            })}
          />
        </FieldShell>

        <button
          type="submit"
          disabled={isSubmitting || validatingOtp}
          className={primaryButtonClass}
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isSubmitting ? "Updating…" : "Reset password"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Password;
