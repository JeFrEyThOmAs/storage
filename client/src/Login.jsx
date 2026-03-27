// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import "./Auth.css";
// import { GoogleLogin } from "@react-oauth/google";
// import { loginWithGoogle } from "./apis/loginWithGoogle";
// // import { loginWithGoogle } from "./apis/loginWithGoogle";

// const Login = () => {
//   const BASE_URL = "http://localhost:4000";

//   const [formData, setFormData] = useState({
//     email: "anurag@gmail.com",
//     password: "abcd",
//   });

//   // serverError will hold the error message from the server
//   const [serverError, setServerError] = useState("");

//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     // Clear the server error as soon as the user starts typing in either field
//     if (serverError) {
//       setServerError("");
//     }

//     setFormData((prevFormData) => ({
//       ...prevFormData,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await fetch(`${BASE_URL}/user/login`, {
//         method: "POST",
//         body: JSON.stringify(formData),
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//       });

//       const data = await response.json();
//       if (data.error) {
//         // If there's an error, set the serverError message
//         setServerError(data.error);
//       } else {
//         // On success, navigate to home or any other protected route
//         navigate("/");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       setServerError("Something went wrong. Please try again.");
//     }
//   };

//   // If there's an error, we'll add "input-error" class to both fields
//   const hasError = Boolean(serverError);

//   return (
//     <div className="container">
//       <h2 className="heading">Login</h2>
//       <form className="form" onSubmit={handleSubmit}>
//         {/* Email */}
//         <div className="form-group">
//           <label htmlFor="email" className="label">
//             Email
//           </label>
//           <input
//             className={`input ${hasError ? "input-error" : ""}`}
//             type="email"
//             id="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             placeholder="Enter your email"
//             required
//           />
//         </div>

//         {/* Password */}
//         <div className="form-group">
//           <label htmlFor="password" className="label">
//             Password
//           </label>
//           <input
//             className={`input ${hasError ? "input-error" : ""}`}
//             type="password"
//             id="password"
//             name="password"
//             value={formData.password}
//             onChange={handleChange}
//             placeholder="Enter your password"
//             required
//           />
//           {/* Absolutely-positioned error message below password field */}
//           {serverError && <span className="error-msg">{serverError}</span>}
//         </div>

//         <button type="submit" className="submit-button">
//           Login
//         </button>
//       </form>

//       {/* Link to the register page */}
//       <p className="link-text">
//         Don't have an account? <Link to="/register">Register</Link>
//       </p>
//       <div className="or">
//         <span>Or</span>
//       </div>

//       <div className="google-login">
//         <GoogleLogin
//           onSuccess={async (credentialResponse) => {
//             const data = await loginWithGoogle(credentialResponse.credential);
//             if (data.error) {
//               console.log(data);
//               return;
//             }
//             navigate("/");
//           }}
//           theme="filled_blue"
//           text="continue_with"
//           onError={() => {
//             console.log("Login Failed");
//           }}
//           useOneTap
//         />
//       </div>
//     </div>
//   );
// };

// export default Login;


import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { loginWithGoogle } from "./apis/authApi";
import { loginUser } from "./apis/userApi";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "procodrr@gmail.com",
    password: "abcd",
  });
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (serverError) setServerError("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser(formData);
      if (data.error) setServerError(data.error);
      else navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setServerError(err.response?.data?.error || "Something went wrong.");
    }
  };

  const hasError = Boolean(serverError);

  return (
    <div className="max-w-md mx-auto p-5">
      <h2 className="text-center text-2xl font-semibold mb-3">Login</h2>
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <div className="relative mb-3">
          <label htmlFor="email" className="block mb-1 font-bold">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-2 border ${hasError ? "border-red-500" : "border-gray-300"} rounded`}
          />
        </div>

        <div className="relative mb-3">
          <label htmlFor="password" className="block mb-1 font-bold">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full p-2 border ${hasError ? "border-red-500" : "border-gray-300"} rounded`}
          />
          {serverError && (
            <span className="absolute top-full left-0 text-red-500 text-xs mt-1">
              {serverError}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded w-full font-medium hover:opacity-90"
        >
          Login
        </button>
      </form>

      <p className="text-center mt-3">
        Don't have an account?{" "}
        <Link className="text-blue-600 hover:underline" to="/register">
          Register
        </Link>
      </p>

      <div className="relative text-center my-3">
        <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 h-[2px] bg-gray-300"></div>
        <span className="relative bg-white px-2 text-sm text-gray-600">Or</span>
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            try {
              const data = await loginWithGoogle(credentialResponse.credential);
              if (!data.error) navigate("/");
            } catch (err) {
              console.error("Google login failed:", err);
            }
          }}
          onError={() => console.log("Login Failed")}
          theme="filled_blue"
          text="continue_with"
          useOneTap
        />
      </div>
    </div>
  );
};

export default Login;
