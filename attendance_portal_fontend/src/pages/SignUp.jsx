import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const SignUp = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const handleFormSubmit = async (data) => {
    try{
        setServerError(null);
        const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/auth/signup`, data);
          navigate('/login');
        
      }catch(error){
          setServerError(error.response?.data?.message || "something went wrong");
    }
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
            <input
              type="email"
              autoComplete="email"
              id="email"
              {...register("email", { required: "email is required" })}
              placeholder="yourname@example.com"
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
              isSubmitting ? "bg-blue-400" : "bg-blue-600"
            } w-32 rounded-md p-2 text-white cursor-pointer font-semibold`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
