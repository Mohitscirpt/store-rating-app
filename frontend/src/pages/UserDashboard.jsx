import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const storeId = new URLSearchParams(location.search).get("storeId");

  // Stores data
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("ASC");

  // Password update
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Rating submission
  const [ratingStore, setRatingStore] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingLoading, setRatingLoading] = useState(false);

  // ✅ Load stores
  useEffect(() => {
    loadStores();
  }, [searchTerm, sortBy, sortOrder]);

  const loadStores = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);
      if (storeId) params.append("storeId", storeId);

      const response = await api.get(`/stores?${params}`);
      setStores(response.data);
    } catch (error) {
      console.error("Error loading stores:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Rating
  const handleRatingSubmit = async (storeId) => {
    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      alert("Please select a rating between 1 and 5");
      return;
    }
    setRatingLoading(true);
    try {
      await api.post("/ratings", { store_id: storeId, rating: ratingValue });
      await loadStores();
      setRatingStore(null);
      setRatingValue(5);
    } catch (error) {
      alert(error.response?.data?.error || "Error submitting rating");
    } finally {
      setRatingLoading(false);
    }
  };

  // ✅ Handle Password Update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");
    try {
      await api.put("/users/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess("Password updated successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        setPasswordSuccess("");
        setShowPasswordForm(false);
      }, 2000);
    } catch (error) {
      setPasswordError(error.response?.data?.error || "Error updating password");
    } finally {
      setPasswordLoading(false);
    }
  };

  // ✅ Logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // ⭐ Helper for star rating UI
  const renderStars = (rating, interactive = false, onStarClick = null) =>
    Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-2xl ${
          interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""
        } ${i < rating ? "text-yellow-500" : "text-gray-300"}`}
        onClick={() => interactive && onStarClick?.(i + 1)}
      >
        ★
      </span>
    ));

  // ✅ Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading Stores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-purple-100">
      {/* ✅ HEADER */}
      <header className="bg-indigo-700 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">
            ⭐ Store Ratings
            {storeId && stores.length > 0 && (
              <span className="ml-3 text-indigo-100 text-base font-medium">
                {stores.find((s) => String(s.id) === String(storeId))?.name || ""}
              </span>
            )}
          </h1>
          <div className="flex items-center space-x-3">
            <p className="hidden md:block text-white font-medium">
              Welcome, {user?.name}
            </p>
            <button
              onClick={() => setShowPasswordForm(true)}
              className="bg-white text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 shadow-md text-sm"
            >
              Update Password
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 shadow-md text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ✅ MAIN CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full">
        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🔍 Find Stores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by name or address"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 w-full"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 w-full"
            >
              <option value="name">Sort by Name</option>
              <option value="address">Sort by Address</option>
              <option value="average_rating">Sort by Rating</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 w-full"
            >
              <option value="ASC">Ascending</option>
              <option value="DESC">Descending</option>
            </select>
          </div>
        </div>

        {/* Stores Grid */}
        {stores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div
                key={store.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition"
              >
                <div className="bg-indigo-600 p-4">
                  <h3 className="text-xl font-bold text-white">{store.name}</h3>
                  <p className="text-indigo-100 text-sm">{store.email}</p>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-600 mb-2">{store.address}</p>
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-sm text-gray-700">Overall Rating</p>
                      <div className="flex items-center">
                        <span className="font-bold text-indigo-700 mr-2">
                          {Number(store.average_rating || 0).toFixed(1)}
                        </span>
                        {renderStars(Math.round(store.average_rating || 0))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{store.total_ratings || 0} ratings</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">Your Rating</p>
                      <div className="flex items-center">
                        <span className="font-bold text-indigo-700 mr-2">
                          {store.user_rating || "N/A"}
                        </span>
                        {store.user_rating ? renderStars(store.user_rating) : renderStars(0)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setRatingStore(store)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md"
                  >
                    {store.user_rating ? "Update Rating" : "Rate this Store"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-700">No Stores Found</h2>
            <p className="text-gray-500">Try changing search or filters</p>
          </div>
        )}
      </main>

      {/* ✅ Rating Modal */}
      {ratingStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Rate {ratingStore.name}</h3>
            <div className="flex justify-center mb-4">
              {renderStars(ratingValue, true, setRatingValue)}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => handleRatingSubmit(ratingStore.id)}
                disabled={ratingLoading}
                className="flex-1 bg-yellow-600 text-white py-2 rounded-lg"
              >
                {ratingLoading ? "Submitting..." : "Submit"}
              </button>
              <button
                onClick={() => setRatingStore(null)}
                className="flex-1 bg-gray-300 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Password Modal */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Update Password</h3>
            <form onSubmit={handlePasswordUpdate} className="space-y-3">
              {passwordError && <p className="text-red-600">{passwordError}</p>}
              {passwordSuccess && <p className="text-green-600">{passwordSuccess}</p>}
              <input
                type="password"
                placeholder="Current Password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                className="w-full border px-4 py-2 rounded-lg"
                required
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                className="w-full border px-4 py-2 rounded-lg"
                required
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                className="w-full border px-4 py-2 rounded-lg"
                required
              />
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg"
                >
                  {passwordLoading ? "Updating..." : "Update"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="flex-1 bg-gray-300 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
