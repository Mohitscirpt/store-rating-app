import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function StoreOwnerDashboard() {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState({ stores: [], users: [] });
  const [loading, setLoading] = useState(true);

  // Create store modal state
  const [createStoreModal, setCreateStoreModal] = useState(false);
  const [createStoreData, setCreateStoreData] = useState({ name: "", email: "", address: "" });
  const [createStoreError, setCreateStoreError] = useState("");
  const [creatingStore, setCreatingStore] = useState(false);

  const [passwordModal, setPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/store-owner/dashboard");
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async () => {
    setCreateStoreError("");
    if (!createStoreData.name || !createStoreData.email || !createStoreData.address) {
      setCreateStoreError("All fields are required");
      return;
    }
    setCreatingStore(true);
    try {
      await api.post("/store-owner/stores", createStoreData);
      setCreateStoreModal(false);
      setCreateStoreData({ name: "", email: "", address: "" });
      await fetchDashboardData();
    } catch (error) {
      setCreateStoreError(error.response?.data?.error || "Error creating store");
    } finally {
      setCreatingStore(false);
    }
  };

  const handlePasswordChange = async () => {
    setErrors({});
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }
    try {
      await api.put("/store-owner/change-password", passwordData);
      alert("Password changed successfully!");
      setPasswordModal(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setErrors({ apiError: error.response?.data?.message || "Error changing password" });
    }
  };

  if (loading) return <p className="text-center mt-6">Loading dashboard...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="flex justify-between items-center bg-white shadow-md p-4 rounded-lg mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {user?.name || "Store Owner"}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setCreateStoreModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Create Store
          </button>
          <button
            onClick={() => setPasswordModal(true)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            Change Password
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Stores Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Your Stores</h2>
        {dashboardData.stores.length === 0 ? (
          <p className="text-gray-500">No stores found.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.stores.map((store) => (
              <div key={store.id} className="bg-white shadow-md rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-800">{store.name}</h3>
                <p className="text-gray-600">{store.address}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-yellow-600 font-semibold">⭐ {Number(store.averageRating || 0).toFixed(1)}</p>
                  <p className="text-sm text-gray-500">
                    {store.totalRatings || 0} ratings
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* User Ratings Section */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">
          User Ratings
        </h2>
        {dashboardData.users.length === 0 ? (
          <p className="text-gray-500">No user ratings yet.</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border-b">Name</th>
                  <th className="p-3 border-b">Email</th>
                  <th className="p-3 border-b">Store</th>
                  <th className="p-3 border-b">Rating</th>
                  <th className="p-3 border-b">Date</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.users.map((u, index) => (
                  <tr
                    key={u.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="p-3">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.storeName}</td>
                    <td className="p-3">⭐ {u.rating}</td>
                    <td className="p-3">{new Date(u.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Change Password Modal */}
      {passwordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Change Password</h2>
            {errors.apiError && (
              <p className="text-red-500 mb-2">{errors.apiError}</p>
            )}
            <input
              type="password"
              placeholder="Current Password"
              className="w-full border p-2 rounded mb-3"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="New Password"
              className="w-full border p-2 rounded mb-3"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full border p-2 rounded mb-3"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
            />
            {errors.confirmPassword && (
              <p className="text-red-500 mb-2">{errors.confirmPassword}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPasswordModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Store Modal */}
      {createStoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Create Store</h2>
            {createStoreError && (
              <p className="text-red-500 mb-2">{createStoreError}</p>
            )}
            <input
              type="text"
              placeholder="Store Name"
              className="w-full border p-2 rounded mb-3"
              value={createStoreData.name}
              onChange={(e) => setCreateStoreData({ ...createStoreData, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Store Email"
              className="w-full border p-2 rounded mb-3"
              value={createStoreData.email}
              onChange={(e) => setCreateStoreData({ ...createStoreData, email: e.target.value })}
            />
            <textarea
              placeholder="Address"
              className="w-full border p-2 rounded mb-3"
              rows="3"
              value={createStoreData.address}
              onChange={(e) => setCreateStoreData({ ...createStoreData, address: e.target.value })}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCreateStoreModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateStore}
                disabled={creatingStore}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {creatingStore ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
