import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { validateEmail } from "../utils/validation";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userType: "user" // Default to normal user
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'radio' ? value : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (!formData.userType) {
      newErrors.userType = "Please select user type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", formData);
      login(response.data.user, response.data.token);
      
      // Redirect based on user role
      switch (response.data.user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'store_owner':
          navigate('/store-owner/dashboard');
          break;
        default:
          navigate('/user/dashboard');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Login failed. Please try again.";
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-8 px-4">
      <div className="mx-auto w-full max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a href="/register" className="font-medium text-indigo-600">
            Register here
          </a>
        </p>
      </div>

      <div className="mt-8 mx-auto w-full max-w-md">
        <div className="bg-white py-8 px-4 shadow rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="alert alert-error">
                {errors.general}
              </div>
            )}

            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Login as:
              </label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="user-type-user"
                    name="userType"
                    type="radio"
                    value="user"
                    checked={formData.userType === "user"}
                    onChange={handleChange}
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <label htmlFor="user-type-user" className="ml-3 flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Normal User</div>
                      <div className="text-xs text-gray-500">Rate stores and view ratings</div>
                    </div>
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="user-type-store-owner"
                    name="userType"
                    type="radio"
                    value="store_owner"
                    checked={formData.userType === "store_owner"}
                    onChange={handleChange}
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <label htmlFor="user-type-store-owner" className="ml-3 flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Store Owner</div>
                      <div className="text-xs text-gray-500">Manage your store and view ratings</div>
                    </div>
                  </label>
                </div>

                <div className="flex items-center">
                  {/* <input
                    id="user-type-admin"
                    name="userType"
                    type="radio"
                    // value="admin"
                    checked={formData.userType === "admin"}
                    onChange={handleChange}
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  /> */}
                  <label htmlFor="user-type-admin" className="ml-3 flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      
                    </div>
                  </label>
                </div>
              </div>
              {errors.userType && (
                <p className="mt-2 text-sm text-red-600">{errors.userType}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
