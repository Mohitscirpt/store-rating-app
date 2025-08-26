# 🧪 Store Rating App - Complete System Guide

## 🔐 Login System

### **Login Page Features:**
- **User Type Selection:** Choose between Normal User, Store Owner, or Admin
- **Email & Password:** Standard login credentials
- **Auto Redirect:** Based on user role after login

### **Register Page Features:**
- **Account Type Selection:** Register as Normal User, Store Owner, or Admin
- **Complete Registration:** All user types can be created here
- **Validation:** Proper form validation for all fields

---

## 👑 Default Admin Account (Pre-created)
| Email | Password | Role | Description |
|-------|----------|------|-------------|
| `admin@storeapp.com` | `Admin123!` | Admin | Default admin account |

---

## 🚀 How to Use the System:

### **1. Registration Process:**
1. Go to: `http://localhost:5174/register`
2. **Select Account Type:**
   - 🔵 **Normal User** - Rate stores and view ratings
   - 🟢 **Store Owner** - Manage your store and view ratings  
   - 🟣 **Admin** - Manage all users and stores
3. **Fill Details:** Name, email, address, password
4. **Create Account:** Click "Create account"

### **2. Login Process:**
1. Go to: `http://localhost:5174/login`
2. **Select User Type:** Choose your account type
3. **Enter Credentials:** Email and password
4. **Login:** You'll be redirected to appropriate dashboard

---

## 👤 **Normal User Dashboard Features:**

### **📋 Core Functionality:**
- ✅ **Sign up and log in** to the platform
- ✅ **Update password** after logging in
- ✅ **View list of all registered stores**
- ✅ **Search stores** by Name and Address
- ✅ **Submit ratings** (1-5 stars) for individual stores
- ✅ **Modify submitted ratings**
- ✅ **Log out** from the system

### **🏪 Store Listings Display:**
- ✅ **Store Name**
- ✅ **Address**
- ✅ **Overall Rating** (with star display)
- ✅ **User's Submitted Rating** (if any)
- ✅ **Option to submit rating** (star selection)
- ✅ **Option to modify rating**

### **🔍 Search & Filter Features:**
- ✅ **Search by store name**
- ✅ **Search by store address**
- ✅ **Sort by name** (A-Z, Z-A)
- ✅ **Sort by rating** (High-Low, Low-High)
- ✅ **Sort by number of ratings**

### **⭐ Rating System:**
- ✅ **Interactive star rating** (1-5 stars)
- ✅ **Visual star display** for ratings
- ✅ **Real-time rating submission**
- ✅ **Rating modification** capability
- ✅ **Success/error feedback**

### **🔐 Password Management:**
- ✅ **Current password verification**
- ✅ **New password validation**
- ✅ **Password confirmation**
- ✅ **Success/error messages**
- ✅ **Modal form interface**

---

## 👑 **Admin Dashboard Features:**

### **📊 Dashboard Overview:**
- ✅ **Total Users Count**
- ✅ **Total Stores Count** 
- ✅ **Total Ratings Count**

### **👥 User Management:**
- ✅ **Add New Users** with:
  - Name, Email, Password, Address, Role
- ✅ **View All Users** with:
  - Name, Email, Address, Role
- ✅ **Filter Users** by:
  - Name, Email, Address, Role
- ✅ **View User Details** including ratings for store owners

### **🏪 Store Management:**
- ✅ **Add New Stores** with:
  - Name, Email, Address, Owner ID
- ✅ **View All Stores** with:
  - Name, Email, Address, Rating
- ✅ **Filter Stores** by:
  - Name, Email, Address
- ✅ **Store Statistics:**
  - Average Rating
  - Total Ratings Count

### **🔍 Advanced Features:**
- ✅ **Search & Filter** functionality
- ✅ **Tabbed Interface** (Dashboard, Users, Stores)
- ✅ **Modal Forms** for adding users/stores
- ✅ **Real-time Updates** after operations
- ✅ **Responsive Design**

---

## 🏪 **Store Owner Dashboard Features:**
- ✅ View store performance metrics
- ✅ See users who rated your store
- ✅ View average store rating
- ✅ Update password
- ✅ Logout functionality

---

## 🔧 Quick Setup Commands:

```bash
# Start backend server
cd backend && npm run dev

# Start frontend server  
cd frontend && npm run dev

# Create test users (optional)
node create-test-users.js
```

---

## 📱 Access URLs:
- **Frontend:** `http://localhost:5174`
- **Backend:** `http://localhost:5000`
- **Login:** `http://localhost:5174/login`
- **Register:** `http://localhost:5174/register`
- **Admin Dashboard:** `http://localhost:5174/admin/dashboard`
- **User Dashboard:** `http://localhost:5174/user/dashboard`
- **Store Owner Dashboard:** `http://localhost:5174/store-owner/dashboard`

---

## 🎯 Complete System Features:

### **👤 Normal User Features:**
✅ **Sign up and login** system  
✅ **Password update** functionality  
✅ **Store browsing** with search  
✅ **Interactive rating** system (1-5 stars)  
✅ **Rating modification** capability  
✅ **Real-time updates** after rating  
✅ **Responsive store cards**  
✅ **Search and filter** options  
✅ **Logout functionality**  

### **👑 Admin Features:**
✅ **Dashboard statistics** (Users, Stores, Ratings)  
✅ **User management** (Add, View, Filter)  
✅ **Store management** (Add, View, Filter)  
✅ **Role-based access control**  
✅ **Search & filter functionality**  
✅ **Modal forms** for data entry  
✅ **Real-time data updates**  
✅ **Responsive design**  

### **🏪 Store Owner Features:**
✅ **Store performance** metrics  
✅ **User rating reviews**  
✅ **Average rating** display  
✅ **Password management**  
✅ **Logout functionality**  

### **🔧 System Features:**
✅ **Multi-role registration** system  
✅ **Role-based login** selection  
✅ **User type radio buttons**  
✅ **Form validation**  
✅ **Error handling**  
✅ **Responsive design**  
✅ **Modern UI/UX**  
✅ **Database integration**  
✅ **API endpoints**  
✅ **Authentication system**
