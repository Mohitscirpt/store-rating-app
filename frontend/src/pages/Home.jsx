import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-indigo-600">⭐ Store Rating App</h1>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-gray-700 font-medium">Welcome, {user.name}</span>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 font-medium hover:text-indigo-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left Content */}
        <div className="text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            Discover. Rate. Connect.
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-md mx-auto md:mx-0">
            Explore the best stores in your area, share your honest reviews, 
            and connect with a community of smart shoppers.
          </p>

          {!user && (
            <div className="mt-6 flex justify-center md:justify-start gap-4">
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 rounded-xl border border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-50 transition"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Right Image (responsive size) */}
        <div className="flex justify-center md:justify-end">
          {/* <img
            src="" // apni image ka path
            alt=""
            className="w-72 md:w-96 lg:w-[28rem] rounded-2xl shadow-lg object-cover"
          /> */}
        </div>
      </main>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition text-center">
          <div className="w-12 h-12 mx-auto bg-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">⭐</span>
          </div>
          <h3 className="mt-4 text-lg font-bold text-gray-900">Rate Stores</h3>
          <p className="text-gray-600">Share your shopping experience</p>
        </div>

        <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition text-center">
          <div className="w-12 h-12 mx-auto bg-green-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">🔍</span>
          </div>
          <h3 className="mt-4 text-lg font-bold text-gray-900">Discover</h3>
          <p className="text-gray-600">Find hidden gems near you</p>
        </div>

        <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition text-center">
          <div className="w-12 h-12 mx-auto bg-yellow-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">👥</span>
          </div>
          <h3 className="mt-4 text-lg font-bold text-gray-900">Community</h3>
          <p className="text-gray-600">Be part of smart shopping</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Store Rating App. All rights reserved.
      </footer>
    </div>
  );
}
