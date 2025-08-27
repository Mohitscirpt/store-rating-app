import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Dashboard stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });

  // Users management
  const [users, setUsers] = useState([]);
  const [userFilters, setUserFilters] = useState({
    search: "",
    role: ""
  });

  // Stores management
  const [stores, setStores] = useState([]);
  const [storeFilters, setStoreFilters] = useState({
    search: ""
  });

  // Forms
  const [showUserForm, setShowUserForm] = useState(false);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "user"
  });
  const [storeForm, setStoreForm] = useState({
    name: "",
    email: "",
    address: "",
    owner_id: ""
  });

  // Loading states
  const [loading, setLoading] = useState(true);
  const [userFormLoading, setUserFormLoading] = useState(false);
  const [storeFormLoading, setStoreFormLoading] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Sorting
  const [userSort, setUserSort] = useState({ field: 'name', direction: 'asc' });
  const [storeSort, setStoreSort] = useState({ field: 'name', direction: 'asc' });

  // Details modals
  const [userDetails, setUserDetails] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [storeDetails, setStoreDetails] = useState(null);
  const [showStoreDetails, setShowStoreDetails] = useState(false);

  // Store owners for dropdown
  const [storeOwners, setStoreOwners] = useState([]);

  // Toast notifications
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [userFilters, userSort]);

  useEffect(() => {
    loadStores();
  }, [storeFilters, storeSort]);

  const loadDashboardData = async () => {
    try {
      const response = await api.get("/admin/dashboard");
      setStats(response.data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to load dashboard' });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (userFilters.search) params.append("search", userFilters.search);
      if (userFilters.role) params.append("role", userFilters.role);
      params.append("sortBy", userSort.field);
      params.append("sortOrder", userSort.direction.toUpperCase());

      const response = await api.get(`/admin/users?${params}`);
      setUsers(response.data);
    } catch (error) {
      console.error("Error loading users:", error);
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to load users' });
    }
  };

  const loadStores = async () => {
    try {
      const params = new URLSearchParams();
      if (storeFilters.search) params.append("search", storeFilters.search);
      params.append("sortBy", storeSort.field);
      params.append("sortOrder", storeSort.direction.toUpperCase());

      const response = await api.get(`/admin/stores?${params}`);
      setStores(response.data);
    } catch (error) {
      console.error("Error loading stores:", error);
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to load stores' });
    }
  };

  const openUserDetails = async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      setUserDetails(response.data);
      setShowUserDetails(true);
    } catch (error) {
      console.error('Error loading user details:', error);
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to load user details' });
    }
  };

  const openStoreDetails = (store) => {
    setStoreDetails(store);
    setShowStoreDetails(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setUserFormLoading(true);
    
    try {
      await api.post("/admin/users", userForm);
      setToast({ type: 'success', message: 'User created successfully' });
      setUserForm({
        name: "",
        email: "",
        password: "",
        address: "",
        role: "user"
      });
      setShowUserForm(false);
      loadUsers();
      loadDashboardData();
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Error creating user' });
    } finally {
      setUserFormLoading(false);
    }
  };

  const handleStoreSubmit = async (e) => {
    e.preventDefault();
    setStoreFormLoading(true);
    
    try {
      await api.post("/admin/stores", storeForm);
      setToast({ type: 'success', message: 'Store created successfully' });
      setStoreForm({
        name: "",
        email: "",
        address: "",
        owner_id: ""
      });
      setShowStoreForm(false);
      loadStores();
      loadDashboardData();
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Error creating store' });
    } finally {
      setStoreFormLoading(false);
    }
  };

  // Load store owners for dropdown (role filter supported by backend)
  const loadStoreOwners = async () => {
    try {
      const response = await api.get('/admin/users?role=store_owner&sortBy=name&sortOrder=ASC');
      setStoreOwners(response.data);
    } catch (error) {
      console.error('Error loading store owners:', error);
    }
  };

  useEffect(() => {
    if (showStoreForm && storeOwners.length === 0) {
      loadStoreOwners();
    }
  }, [showStoreForm]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                <span className="text-white font-medium">{user?.name?.charAt(0)}</span>
              </div>
              <span className="text-white font-medium">Welcome, {user?.name}</span>
            </div>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-150 ease-in-out flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm7 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm1 4a1 1 0 102 0V7a1 1 0 10-2 0v4z" clipRule="evenodd" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-md rounded-lg mb-6">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex space-x-2 p-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center px-4 py-3 rounded-md font-medium transition-all duration-200 ease-in-out ${
                activeTab === "dashboard"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center px-4 py-3 rounded-md font-medium transition-all duration-200 ease-in-out ${
                activeTab === "users"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Users
            </button>
            <button
              onClick={() => setActiveTab("stores")}
              className={`flex items-center px-4 py-3 rounded-md font-medium transition-all duration-200 ease-in-out ${
                activeTab === "stores"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              Stores
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-8 px-4">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-blue-500 transform transition-all hover:scale-105">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-600">Total Users</h3>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-green-500 transform transition-all hover:scale-105">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-600">Total Stores</h3>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalStores}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-purple-500 transform transition-all hover:scale-105">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-600">Total Ratings</h3>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalRatings}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <button
                onClick={() => setShowUserForm(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center transition duration-150 ease-in-out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New User
              </button>
            </div>

            {/* User Filters */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search by Name or Email
                  </label>
                    <input
                      type="text"
                    placeholder="Search by name, email, or address"
                    value={userFilters.search}
                    onChange={(e) => setUserFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Role
                  </label>
                    <select
                    value={userFilters.role}
                    onChange={(e) => setUserFilters(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">All Roles</option>
                    <option value="user">Normal User</option>
                    <option value="store_owner">Store Owner</option>
                      <option value="admin">Admin</option>
                    </select>
                </div>
                  </div>
                </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {users.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No users found. Adjust filters or add a new user.</div>
              ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => {
                        const direction = userSort.field === 'name' && userSort.direction === 'asc' ? 'desc' : 'asc';
                        setUserSort({ field: 'name', direction });
                      }}
                    >
                      <div className="flex items-center">
                        Name
                        {userSort.field === 'name' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 ${userSort.direction === 'asc' ? '' : 'transform rotate-180'}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => {
                        const direction = userSort.field === 'email' && userSort.direction === 'asc' ? 'desc' : 'asc';
                        setUserSort({ field: 'email', direction });
                      }}
                    >
                      <div className="flex items-center">
                        Email
                        {userSort.field === 'email' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 ${userSort.direction === 'asc' ? '' : 'transform rotate-180'}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => {
                        const direction = userSort.field === 'address' && userSort.direction === 'asc' ? 'desc' : 'asc';
                        setUserSort({ field: 'address', direction });
                      }}
                    >
                      <div className="flex items-center">
                        Address
                        {userSort.field === 'address' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 ${userSort.direction === 'asc' ? '' : 'transform rotate-180'}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => {
                        const direction = userSort.field === 'role' && userSort.direction === 'asc' ? 'desc' : 'asc';
                        setUserSort({ field: 'role', direction });
                      }}
                    >
                      <div className="flex items-center">
                        Role
                        {userSort.field === 'role' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 ${userSort.direction === 'asc' ? '' : 'transform rotate-180'}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-indigo-50 cursor-pointer" onClick={() => openUserDetails(user.id)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 truncate max-w-xs">{user.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'store_owner' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role}
                            </span>
                            {user.role === 'store_owner' && user.rating && (
                          <div className="mt-1 flex items-center">
                            <span className="text-xs text-gray-500 mr-1">Rating:</span>
                            <span className="text-xs font-medium text-amber-500">{user.rating}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                        )}
                          </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={(e) => { e.stopPropagation(); openUserDetails(user.id); }} className="text-indigo-600 hover:text-indigo-900 mr-3">
                          View Details
                        </button>
                      </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              )}
            </div>
          </div>
        )}

        {/* Stores Tab */}
        {activeTab === "stores" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Store Management</h2>
              <button
                onClick={() => setShowStoreForm(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center transition duration-150 ease-in-out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Store
              </button>
            </div>

            {/* Store Filters */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search by Name or Address
                </label>
                <input
                  type="text"
                  placeholder="Search by name, email, or address"
                  value={storeFilters.search}
                  onChange={(e) => setStoreFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Stores Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {stores.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No stores found. Adjust filters or add a new store.</div>
              ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => {
                        const direction = storeSort.field === 'name' && storeSort.direction === 'asc' ? 'desc' : 'asc';
                        setStoreSort({ field: 'name', direction });
                      }}
                    >
                      <div className="flex items-center">
                        Name
                        {storeSort.field === 'name' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 ${storeSort.direction === 'asc' ? '' : 'transform rotate-180'}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => {
                        const direction = storeSort.field === 'email' && storeSort.direction === 'asc' ? 'desc' : 'asc';
                        setStoreSort({ field: 'email', direction });
                      }}
                    >
                      <div className="flex items-center">
                        Email
                        {storeSort.field === 'email' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 ${storeSort.direction === 'asc' ? '' : 'transform rotate-180'}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => {
                        const direction = storeSort.field === 'address' && storeSort.direction === 'asc' ? 'desc' : 'asc';
                        setStoreSort({ field: 'address', direction });
                      }}
                    >
                      <div className="flex items-center">
                        Address
                        {storeSort.field === 'address' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 ${storeSort.direction === 'asc' ? '' : 'transform rotate-180'}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => {
                        const direction = storeSort.field === 'average_rating' && storeSort.direction === 'asc' ? 'desc' : 'asc';
                        setStoreSort({ field: 'average_rating', direction });
                      }}
                    >
                      <div className="flex items-center">
                        Rating
                        {storeSort.field === 'average_rating' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 ${storeSort.direction === 'asc' ? '' : 'transform rotate-180'}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stores.map((store) => (
                    <tr key={store.id} className="hover:bg-indigo-50 cursor-pointer" onClick={() => openStoreDetails(store)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{store.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{store.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 truncate max-w-xs">{store.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {store.average_rating ? (
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900 mr-1">{parseFloat(store.average_rating).toFixed(1)}</span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg 
                                  key={star}
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className={`h-4 w-4 ${star <= Math.round(parseFloat(store.average_rating)) ? 'text-amber-500' : 'text-gray-300'}`} 
                                  viewBox="0 0 20 20" 
                                  fill="currentColor"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No ratings</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => { e.stopPropagation(); openStoreDetails(store); }}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Add User Drawer */}
      {showUserForm && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowUserForm(false)}></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Add New User</h3>
              <button aria-label="Close" onClick={() => setShowUserForm(false)} className="p-2 rounded hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
              </button>
            </div>
            <form onSubmit={handleUserSubmit} className="space-y-4 p-6 overflow-y-auto h-[calc(100%-64px)]">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  required
                  value={userForm.password}
                  onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  required
                  value={userForm.address}
                  onChange={(e) => setUserForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  required
                  value={userForm.role}
                  onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="user">Normal User</option>
                  <option value="store_owner">Store Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={userFormLoading}
                  className={`flex-1 px-4 py-2 rounded-md text-white ${userFormLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                  {userFormLoading ? "Creating..." : "Create User"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUserForm(false)}
                  className="flex-1 px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Store Drawer */}
      {showStoreForm && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowStoreForm(false)}></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Add New Store</h3>
              <button aria-label="Close" onClick={() => setShowStoreForm(false)} className="p-2 rounded hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
              </button>
            </div>
            <form onSubmit={handleStoreSubmit} className="space-y-4 p-6 overflow-y-auto h-[calc(100%-64px)]">
              <div>
                <label className="block text-sm font-medium text-gray-700">Store Name</label>
                <input
                  type="text"
                  required
                  value={storeForm.name}
                  onChange={(e) => setStoreForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  value={storeForm.email}
                  onChange={(e) => setStoreForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  required
                  value={storeForm.address}
                  onChange={(e) => setStoreForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Owner (Optional)</label>
                <select
                  value={storeForm.owner_id}
                  onChange={(e) => setStoreForm(prev => ({ ...prev, owner_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">No owner</option>
                  {storeOwners.map((o) => (
                    <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={storeFormLoading}
                  className={`flex-1 px-4 py-2 rounded-md text-white ${storeFormLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                  {storeFormLoading ? "Creating..." : "Create Store"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowStoreForm(false)}
                  className="flex-1 px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
            </div>
          </div>
        )}
      
      {/* User Details Modal */}
      {showUserDetails && userDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-gray-600">Name</span><span className="font-medium">{userDetails.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Email</span><span className="font-medium">{userDetails.email}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Address</span><span className="font-medium text-right max-w-[60%] truncate">{userDetails.address}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Role</span><span className="font-medium">{userDetails.role}</span></div>
              {userDetails.role === 'store_owner' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating</span>
                  <span className="font-medium">{userDetails.average_rating ? parseFloat(userDetails.average_rating).toFixed(1) : 'N/A'}</span>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => { setShowUserDetails(false); setUserDetails(null); }} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Store Details Modal */}
      {showStoreDetails && storeDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Store Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-gray-600">Name</span><span className="font-medium">{storeDetails.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Email</span><span className="font-medium">{storeDetails.email}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Address</span><span className="font-medium text-right max-w-[60%] truncate">{storeDetails.address}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Average Rating</span><span className="font-medium">{storeDetails.average_rating ? parseFloat(storeDetails.average_rating).toFixed(1) : 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Total Ratings</span><span className="font-medium">{storeDetails.total_ratings ?? 0}</span></div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => { setShowStoreDetails(false); setStoreDetails(null); }} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700">Close</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
