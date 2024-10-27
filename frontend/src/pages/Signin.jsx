import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LoginPage = () => {

  const navigate = useNavigate();

  const [signinData, setSigninData] = useState({
    username: "",
    password: ""
  });

  const [remember, setRemember] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Remember me:", remember);
    const response = await fetch('https://signwave-api.onrender.com'+'/api/login', {
      method: "POST",
      headers: {
        'Content-Type': "application/json",
      },
      body: JSON.stringify({ ...signinData })
    }).then(res => {
      if(!(res.status>=200 && res.status<=299)) {
        throw new Error("Failed")
      }
      return  res.json()
    }).then(data =>{
      localStorage.setItem('userInfo',JSON.stringify(data.user))
      localStorage.setItem('user',data.user.username)
      localStorage.setItem('access',data.refresh)
      localStorage.setItem('refresh',data.refresh)
      navigate('/call')
    }).catch(error => {console.log(error);toast.error(String(error))})
  };




  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full"
      >
        <h2 className="text-2xl font-bold mb-5 text-center text-gray-800">
          Login
        </h2>

        {/* Email Field */}
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
            name="username"
            value={signinData.username}
            onChange={(e) => setSigninData({ ...signinData, [e.target.name]: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="you"
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
            value={signinData.password}
            onChange={(e) => setSigninData({ ...signinData, [e.target.name]: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="********"
            required
          />
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center mb-4">
          <input
            id="remember"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label
            htmlFor="remember"
            className="ml-2 block text-sm text-gray-900"
          >
            Remember me
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
        >
          Sign In
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
