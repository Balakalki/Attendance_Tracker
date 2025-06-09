import { useForm } from "react-hook-form";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const SignUp = () => {
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const [validatingOtp, setValidatingOtp] = useState(false);
  const [getOtp, setGetOtp] = useState({message: "", success: null});
  const [verifyOtp, setVerifyOtp] = useState({message: "", success: null});
  const [isVerified, setIsVerified] = useState(false);

  const handleFormSubmit = async (data) => {
    if (isVerified){
      try {
        setServerError(null);
        await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/api/auth/signup`,
          data
        );
        navigate("/login");
      } catch (error) {
        setServerError(error.response?.data?.Error || "something went wrong");
      }
    }else{
      setServerError("Please verify your email")
    }
  };

  const generateOTP = async () => {
    const email = await trigger("email");
    setGetOtp({message: "", success: null});
    if (email) {
      try {
        const getOtpRes = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/otp`, {
          email: watch("email"),
        });
        if(getOtpRes.status === 200){
          setGetOtp({message:"otp send successfully", success: true});
        }
      } catch (error) {
        console.log(error);
        setGetOtp({message: error.response?.data?.Error, success: false});
      }
    }
  };

  const verifyOTP = async () => {
    setVerifyOtp({message: "", success: null})
    const email = await trigger("email");
    if (!email) return;
    setValidatingOtp(true);

    const otp = await trigger("otp");

    if (!otp) return;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/otp/verify`,
        {
          email: watch("email"),
          otp: watch("otp"),
        }
      );

      if (res.status === 200) {
        setIsVerified(true);
      }
      setVerifyOtp(
          {message: res.data.message, success: true}
        );
    } catch (err) {
      console.error("OTP error", err);
      setVerifyOtp(
          {message: err.response?.data.message || "Some thing went wrong", success: false}
        );
    }

    setValidatingOtp(false);
  };
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="border p-8 rounded-md bg-slate-100">
        <div className="flex justify-center pb-8 p-4 min-w-60 text-2xl font-bold text-blue-950">
          <h1>Sign Up</h1>
        </div>
        {serverError && <p className="text-red-700 max-w-50">{serverError}</p>}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col">
            <label htmlFor="fullName" className="font-semibold ">
              Full Name
            </label>
            <input
              type="text"
              autoComplete="name"
              {...register("fullName", { required: "Full Name is required" })}
              id="fullName"
              placeholder="Full Name"
              className="border rounded-md px-2 py-1"
            />
            {errors.fullName && (
              <p className="text-red-700 text-sm">{errors.fullName.message}</p>
            )}
          </div>
          <div className="flex flex-col">
            <label htmlFor="email" className="font-semibold">
              Email
            </label>
            <div className="grid grid-cols-[1fr_auto]">
              <input
                type="email"
                autoComplete="email"
                id="email"
                {...register("email", { required: "email is required" })}
                placeholder="yourname@example.com"
                className="border rounded-l-md px-2 py-1"
              />
              <button
                type="button"
                className="bg-blue-600 text-white px-2 rounded-r-md"
                onClick={generateOTP}
              >
                get Otp
              </button>
            </div>
            {getOtp.message && (
              <p
                className={`text-sm ${
                  getOtp.success ? "text-green-700" : "text-red-700"
                }`}
              >
                {getOtp.message}
              </p>
            )}
            {errors.email && (
              <p className="text-sm text-red-700">{errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col">
            <label htmlFor="otp" className="font-semibold">
              OTP
            </label>
            <div className="grid grid-cols-[1fr_auto]">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                id="otp"
                {...register("otp", {
                  required: "OTP is required",
                  pattern: {
                    value: /^\d{6}$/,
                    message: "OTP must be exactly 6 digits",
                  },
                })}
                placeholder="Enter 6-digit code"
                className="border rounded-l-md px-2 py-1"
              />
              <button
                type="button"
                className="bg-blue-600 text-white px-2 rounded-r-md"
                onClick={verifyOTP}
              >
                Verify OTP
              </button>
            </div>
            {verifyOtp.message && (
              <p
                className={`text-sm ${
                  verifyOtp.success ? "text-green-700" : "text-red-700"
                }`}
              >
                {verifyOtp.message}
              </p>
            )}

            {errors.otp && (
              <p className="text-sm text-red-700">{errors.otp.message}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="font-semibold">
              Password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "minimum 6 characters needed" },
              })}
              id="password"
              placeholder="password"
              className="border rounded-md px-2 py-1"
            />
            {errors.password && (
              <p className="text-sm text-red-700">{errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            className={`${
              isSubmitting || validatingOtp ? "bg-blue-400" : "bg-blue-600"
            } w-32 rounded-md p-2 text-white cursor-pointer font-semibold`}
            disabled={isSubmitting || validatingOtp}
          >
            {isSubmitting ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        <div className="flex gap-2 mt-2">
          <p>have an account</p>
          <Link className="text-blue-600" to={"/login"}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
