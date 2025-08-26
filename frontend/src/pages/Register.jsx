import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { validateName, validateEmail, validatePassword, validateAddress } from "../utils/validation";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "user" // Default to normal user
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

    const nameValidation = validateName(formData.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error;
    }

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error;
    }

    const addressValidation = validateAddress(formData.address);
    if (!addressValidation.isValid) {
      newErrors.address = addressValidation.error;
    }

    if (!formData.role) {
      newErrors.role = "Please select account type";
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
      await api.post("/auth/register", formData);
      alert("Registration successful! Please log in.");
      navigate('/login');
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Registration failed. Please try again.";
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-8 px-4">
      <div className="mx-auto w-full max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-indigo-600">
            Sign in here
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

            {/* Account Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Register as:
              </label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="role-user"
                    name="role"
                    type="radio"
                    value="user"
                    checked={formData.role === "user"}
                    onChange={handleChange}
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <label htmlFor="role-user" className="ml-3 flex items-center">
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
                    id="role-store-owner"
                    name="role"
                    type="radio"
                    value="store_owner"
                    checked={formData.role === "store_owner"}
                    onChange={handleChange}
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <label htmlFor="role-store-owner" className="ml-3 flex items-center">
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
                    id="role-admin"
                    name="role"
                    type="radio"
                    value="admin"
                    checked={formData.role === "admin"}
                    onChange={handleChange}
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  /> */}
                  <label htmlFor="role-admin" className="ml-3 flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      {/* <div className="text-sm font-medium text-gray-900">Admin</div>
                      <div className="text-xs text-gray-500">Manage all users and stores</div> */}
                    </div>
                  </label>
                </div>
              </div>
              {errors.role && (
                <p className="mt-2 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name (20-60 characters)"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
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
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <div className="mt-1">
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  required
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.address ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your address (max 400 characters)"
                  value={formData.address}
                  onChange={handleChange}
                />
                {errors.address && (
                  <p className="mt-2 text-sm text-red-600">{errors.address}</p>
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
                  autoComplete="new-password"
                  required
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="8-16 characters, uppercase + special char"
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
                {loading ? "Creating account..." : "Create account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
