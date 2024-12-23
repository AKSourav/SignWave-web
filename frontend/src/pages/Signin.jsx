import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import { StatusContext } from "../App";
import { useSocket } from "../Context/SocketProvider";


const LoginPage = () => {
  const { setLoginStatus } = useContext(StatusContext);

  // States to manage input values
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state


  const navigate = useNavigate(); // Initialize useNavigate

  const {connectUser} = useSocket();

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();


    setLoading(true); // Start loading state

    // Prepare data for API call
    const signinData = {
      username,
      password,
    };

    try {
      const response = await axios.post(
        "https://signwave-api-ydf3.onrender.com/api/login",
        signinData
      );

      if (response.status === 200 || response.status === 201) {
        alert("Signin successful!");
        // Store tokens in localStorage
        localStorage.setItem("token", response.data.access); // Access token
        localStorage.setItem("refreshToken", response.data.refresh); // Refresh token
        localStorage.setItem("user", response.data?.user?.username); // Username

        console.log("Tokens saved:", response.data);
        connectUser(response.data?.user?.username || localStorage.getItem("user"));
        navigate("/dash");

      }

    } catch (err) {
      // Display error message
      // console.error("Error during login:", err); // Log error for debugging
      setError(
        err.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form style={{ margin: '0px 20px' }}
        onSubmit={handleSubmit}
        className="set-respons bg-white p-6 rounded-lg shadow-lg max-w-sm w-full"
      >
        <h2 className="text-2xl font-bold mb-5 text-center text-gray-800">
          Login
        </h2>

        {/* Error Message */}
        {error && (
          <div className="mb-4 text-sm text-red-600">{error}</div>
        )}

        {/* Username Field */}
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter your username"
            required
          />
        </div>

        {/* Password Field */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter your password"
            required
          />
        </div>

        {/* Remember Me Checkbox */}
        <div className="fix-create-new-user flex items-center mb-4">
          <a onClick={(() => {
            navigate('/signup');
          })}>Create new user</a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-lg ${loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 text-white"
            }`}
          disabled={loading} // Disable button when loading
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
