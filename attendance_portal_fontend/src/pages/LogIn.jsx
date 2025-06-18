import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Link } from "react-router-dom";

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
      const response = await axios.post(
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
    <div className="flex justify-center items-center h-screen">
      <div className="bg-slate-100 border rounded-md p-8">
        <div className="flex justify-center text-2xl font-bold p-4 pb-8 min-w-60 text-blue-950">
          <h1>Log In</h1>
        </div>
        {serverError && <p className="text-red-700 max-w-50">{serverError}</p>}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col">
            <label htmlFor="email" className="font-semibold">
              Email
            </label>
            <input
              {...register("email", { required: "eamil is required" })}
              autoComplete="email"
              type="email"
              id="email"
              placeholder="yourname.example.com"
              className="border rounded-md px-2 py-1"
            />
            {errors.email && (
              <p className="text-sm text-red-700">{errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col">
            <label htmlFor="password" className="font-semibold">
              Password
            </label>
            <input
              {...register("password", { required: "password is required" })}
              autoComplete="current-password"
              type="password"
              id="password"
              placeholder="password"
              className="border rounded-md px-2 py-1"
            />
            {errors.password && (
              <p className="text-sm text-red-700">{errors.password.message}</p>
            )}
          </div>
          <Link className="text-sm text-blue-600 hover:underline ml-auto" to="/forgot-password">
  Forgot Password?
</Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`${
              isSubmitting ? "bg-blue-400" : "bg-blue-600"
            } text-white w-32 rounded-md p-2 font-semibold`}
          >
            {isSubmitting ? "Loging In..." : "Log In"}
          </button>
        </form>
        <div className="flex gap-2 mt-2">
          <p>don't have an account</p>
          <Link className="text-blue-600" to={"/signup"}>
            Signup
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
