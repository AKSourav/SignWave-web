import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom"; // Import useNavigate hook

const SignupPage = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  // States to manage input values
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    setLoading(true); // Start loading state

    // Proceed with registration
    const signupData = {
      first_name,
      last_name,
      email,
      password,
    };

    try {
      const response = await axios.post('https://signwave-api-ydf3.onrender.com/api/signup', signupData);

      if (response.status === 201) {
        alert('Signup successful!');
        // Clear all input fields after successful signup
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError(''); // Clear error message

        // Optionally, redirect to login page or perform another action after signup
      }
    } catch (err) {
      // Display error message
      // console.error('Error during signup', err); // This will log the error for debugging purposes
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="mx-3 my-3 bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Sign Up</h2>

        {/* Display error message */}
        {error && <div className="text-red-600 mb-4">{error}</div>}

        {/* First Name */}
        <div className="mb-4">
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            id="first_name"
            value={first_name}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter your first name"
            required
          />
        </div>

        {/* Last Name */}
        <div className="mb-4">
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            id="last_name"
            value={last_name}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter your last name"
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="you@example.com"
            required
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="********"
            required
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="********"
            required
          />
        </div>
        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
          disabled={loading} // Disable button during loading state
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
        {/* Remember Me Checkbox */}
        <div className="fix-create-new-user flex items-center " style={{ display: 'flex', justifyContent: 'center' }}>
          <h6 style={{ cursor: 'pointer', fontSize: '15px', fontWeight: '400' }} onClick={(() => {
            navigate('/signin');
          })}>Already have an account</h6>
        </div>
      </form>
    </div>
  );
};

export default SignupPage;
