import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {toast} from 'react-toastify'

const SignupPage = () => {
  // States to manage input values
  const navigate = useNavigate();

  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [confirmPassword, setConfirmPassword] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();


    if (!signupData.email.includes('@gmail.com')) {
      alert('Enter a valid password....');
      return;
    }
    if (signupData.password !== confirmPassword) {
      alert('Passwords do not match....');
      return;
    }
    console.log("import.meta.VITE_DJANGO_URL",import.meta.env.VITE_DJANGO_URL)
    const response = await fetch('http://localhost:8000'+'/api/signup', {
      method: "POST",
      headers: {
        'Content-Type': "application/json",
      },
      body: JSON.stringify({ ...signupData })
    }).then(res => {
      if(!(res.status>=200 && res.status<=299)) {
        throw new Error("Failed")
      }
      return  res.json()
    }).then(data =>{
      localStorage.setItem('userInfo',JSON.stringify(data.data))
      localStorage.setItem('user',data.data.username)
      navigate('/call')
    }).catch(error => {console.log(error);toast.error(String(error))})
    console.log(response);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full"
      >
        <h2 className="text-2xl font-bold mb-5 text-center text-gray-800">
          Sign Up
        </h2>

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
            value={signupData.username}
            name="username"
            onChange={(e) => setSignupData({ ...signupData, [e.target.name]: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter your username"
            required
          />
        </div>

        {/* Email Field */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={signupData.email}
            onChange={(e) => setSignupData({ ...signupData, [e.target.name]: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="you@example.com"
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
            name="password"
            value={signupData.password}
            onChange={(e) => setSignupData({ ...signupData, [e.target.name]: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="********"
            required
          />
        </div>

        {/* Confirm Password Field */}
        <div className="mb-4">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Confirm Password
          </label>
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
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignupPage;
