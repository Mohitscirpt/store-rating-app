const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");
const { auth, authorize, JWT_SECRET } = require("./middleware/auth");
const { 
  validateName, 
  validateEmail, 
  validatePassword, 
  validateAddress, 
  validateRating 
} = require("./utils/validation");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Test route
app.get("/", (req, res) => {
  res.send("Store Rating App Backend Running...");
});

// Authentication Routes
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ error: emailValidation.error });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const user = results[0];
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          address: user.address
        }
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, address, role = 'user' } = req.body;

    // Validation
    const nameValidation = validateName(name);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const addressValidation = validateAddress(address);

    if (!nameValidation.isValid) {
      return res.status(400).json({ error: nameValidation.error });
    }
    if (!emailValidation.isValid) {
      return res.status(400).json({ error: emailValidation.error });
    }
    if (!passwordValidation.isValid) {
      return res.status(400).json({ error: passwordValidation.error });
    }
    if (!addressValidation.isValid) {
      return res.status(400).json({ error: addressValidation.error });
    }

    // Validate role
    if (!['user', 'store_owner', 'admin'].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Check if email already exists
    db.query("SELECT id FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      db.query(
        "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)",
        [name, email, hashedPassword, address, role],
        (err, result) => {
          if (err) {
            console.error("Error creating user:", err);
            return res.status(500).json({ error: "Database error" });
          }

          res.status(201).json({ message: "User registered successfully" });
        }
      );
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// User Routes
app.put("/api/users/password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ error: passwordValidation.error });
    }

    // Get current user
    db.query("SELECT password FROM users WHERE id = ?", [userId], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = results[0];
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      
      if (!isValidPassword) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      db.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedNewPassword, userId],
        (err) => {
          if (err) {
            console.error("Error updating password:", err);
            return res.status(500).json({ error: "Database error" });
          }

          res.json({ message: "Password updated successfully" });
        }
      );
    });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin Routes
app.get("/api/admin/dashboard", auth, authorize(['admin']), (req, res) => {
  const queries = [
    "SELECT COUNT(*) as total FROM users",
    "SELECT COUNT(*) as total FROM stores",
    "SELECT COUNT(*) as total FROM ratings"
  ];

  Promise.all(queries.map(query => {
    return new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }))
  .then(results => {
    res.json({
      totalUsers: results[0].total,
      totalStores: results[1].total,
      totalRatings: results[2].total
    });
  })
  .catch(err => {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Database error" });
  });
});

app.post("/api/admin/users", auth, authorize(['admin']), async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    // Validation
    const nameValidation = validateName(name);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const addressValidation = validateAddress(address);

    if (!nameValidation.isValid) {
      return res.status(400).json({ error: nameValidation.error });
    }
    if (!emailValidation.isValid) {
      return res.status(400).json({ error: emailValidation.error });
    }
    if (!passwordValidation.isValid) {
      return res.status(400).json({ error: passwordValidation.error });
    }
    if (!addressValidation.isValid) {
      return res.status(400).json({ error: addressValidation.error });
    }

    if (!['admin', 'user', 'store_owner'].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Check if email already exists
    db.query("SELECT id FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      db.query(
        "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)",
        [name, email, hashedPassword, address, role],
        (err, result) => {
          if (err) {
            console.error("Error creating user:", err);
            return res.status(500).json({ error: "Database error" });
          }

          res.status(201).json({ message: "User created successfully", id: result.insertId });
        }
      );
    });
  } catch (error) {
    console.error("User creation error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/admin/users", auth, authorize(['admin']), (req, res) => {
  const { search, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;
  
  let query = "SELECT id, name, email, address, role FROM users WHERE 1=1";
  const params = [];

  if (search) {
    query += " AND (name LIKE ? OR email LIKE ? OR address LIKE ?)";
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (role) {
    query += " AND role = ?";
    params.push(role);
  }

  query += ` ORDER BY ${sortBy} ${sortOrder}`;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

app.get("/api/admin/users/:id", auth, authorize(['admin']), (req, res) => {
  const userId = req.params.id;

  db.query(
    `SELECT u.id, u.name, u.email, u.address, u.role, 
     AVG(r.rating) as average_rating, COUNT(r.id) as total_ratings
     FROM users u 
     LEFT JOIN stores s ON u.id = s.owner_id 
     LEFT JOIN ratings r ON s.id = r.store_id 
     WHERE u.id = ?
     GROUP BY u.id`,
    [userId],
    (err, results) => {
      if (err) {
        console.error("Error fetching user details:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(results[0]);
    }
  );
});

app.post("/api/admin/stores", auth, authorize(['admin']), (req, res) => {
  const { name, email, address, owner_id } = req.body;

  if (!name || !email || !address) {
    return res.status(400).json({ error: "Name, email, and address are required" });
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return res.status(400).json({ error: emailValidation.error });
  }

  const addressValidation = validateAddress(address);
  if (!addressValidation.isValid) {
    return res.status(400).json({ error: addressValidation.error });
  }

  // Check if email already exists
  db.query("SELECT id FROM stores WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: "Store email already registered" });
    }

    // Insert new store
    db.query(
      "INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)",
      [name, email, address, owner_id || null],
      (err, result) => {
        if (err) {
          console.error("Error creating store:", err);
          return res.status(500).json({ error: "Database error" });
        }

        res.status(201).json({ message: "Store created successfully", id: result.insertId });
      }
    );
  });
});

app.get("/api/admin/stores", auth, authorize(['admin']), (req, res) => {
  const { search, sortBy = 'name', sortOrder = 'ASC' } = req.query;
  
  let query = `
    SELECT s.id, s.name, s.email, s.address, 
           AVG(r.rating) as average_rating, COUNT(r.id) as total_ratings
    FROM stores s 
    LEFT JOIN ratings r ON s.id = r.store_id 
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    query += " AND (s.name LIKE ? OR s.email LIKE ? OR s.address LIKE ?)";
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  // Group by all selected non-aggregated store columns to satisfy ONLY_FULL_GROUP_BY
  query += " GROUP BY s.id, s.name, s.email, s.address";
  query += ` ORDER BY ${sortBy} ${sortOrder}`;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching stores:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Store Routes (for normal users)
app.get("/api/stores", auth, (req, res) => {
  const { search, sortBy = 'name', sortOrder = 'ASC', storeId } = req.query;
  
  let query = `
    SELECT s.id, s.name, s.email, s.address,
           u.name AS owner_name,
           AVG(r.rating) as average_rating,
           COUNT(r.id) as total_ratings,
           MAX(ur.rating) as user_rating
    FROM stores s
    LEFT JOIN users u ON s.owner_id = u.id
    LEFT JOIN ratings r ON s.id = r.store_id
    LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = ?
    WHERE 1=1
  `;
  const params = [req.user.id];

  if (search) {
    query += " AND (s.name LIKE ? OR s.address LIKE ?)";
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  if (storeId) {
    query += " AND s.id = ?";
    params.push(storeId);
  }

  // Group by non-aggregated columns to satisfy ONLY_FULL_GROUP_BY
  query += " GROUP BY s.id, s.name, s.email, s.address, u.name";
  query += ` ORDER BY ${sortBy} ${sortOrder}`;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching stores:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Rating Routes
app.post("/api/ratings", auth, (req, res) => {
  const { store_id, rating } = req.body;
  const user_id = req.user.id;

  const ratingValidation = validateRating(rating);
  if (!ratingValidation.isValid) {
    return res.status(400).json({ error: ratingValidation.error });
  }

  // Check if store exists
  db.query("SELECT id FROM stores WHERE id = ?", [store_id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Store not found" });
    }

    // Insert or update rating
    db.query(
      `INSERT INTO ratings (user_id, store_id, rating) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE rating = ?`,
      [user_id, store_id, rating, rating],
      (err, result) => {
        if (err) {
          console.error("Error submitting rating:", err);
          return res.status(500).json({ error: "Database error" });
        }

        res.json({ message: "Rating submitted successfully" });
      }
    );
  });
});

// Store Owner Dashboard
app.get("/api/store-owner/dashboard", auth, authorize(['store_owner']), (req, res) => {
  const owner_id = req.user.id;

  db.query(
    `SELECT s.id, s.name, s.address,
            AVG(r.rating) as averageRating,
            COUNT(r.id) as totalRatings
     FROM stores s 
     LEFT JOIN ratings r ON s.id = r.store_id 
     WHERE s.owner_id = ?
     GROUP BY s.id`,
    [owner_id],
    (err, storeResults) => {
      if (err) {
        console.error("Error fetching store data:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (storeResults.length === 0) {
        return res.json({ stores: [], users: [] });
      }

      const storeIds = storeResults.map(store => store.id);

      db.query(
        `SELECT u.id, u.name, u.email, u.address, s.name AS storeName, r.rating, r.created_at AS date
         FROM users u 
         JOIN ratings r ON u.id = r.user_id 
         JOIN stores s ON r.store_id = s.id
         WHERE r.store_id IN (${storeIds.map(() => '?').join(',')})
         ORDER BY r.created_at DESC`,
        storeIds,
        (err, userResults) => {
          if (err) {
            console.error("Error fetching user ratings:", err);
            return res.status(500).json({ error: "Database error" });
          }

          res.json({
            stores: storeResults,
            users: userResults
          });
        }
      );
    }
  );
});

// Store Owner: Create a store owned by the logged-in owner
app.post("/api/store-owner/stores", auth, authorize(['store_owner']), (req, res) => {
  const owner_id = req.user.id;
  const { name, email, address } = req.body;

  if (!name || !email || !address) {
    return res.status(400).json({ error: "Name, email, and address are required" });
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return res.status(400).json({ error: emailValidation.error });
  }

  const addressValidation = validateAddress(address);
  if (!addressValidation.isValid) {
    return res.status(400).json({ error: addressValidation.error });
  }

  // Ensure store email is unique
  db.query("SELECT id FROM stores WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: "Store email already registered" });
    }

    db.query(
      "INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)",
      [name, email, address, owner_id],
      (err, result) => {
        if (err) {
          console.error("Error creating store:", err);
          return res.status(500).json({ error: "Database error" });
        }

        res.status(201).json({ message: "Store created successfully", id: result.insertId });
      }
    );
  });
});

// Store Owner: Change password (alias to general user password change)
app.put("/api/store-owner/change-password", auth, authorize(['store_owner']), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ error: passwordValidation.error });
    }

    db.query("SELECT password FROM users WHERE id = ?", [userId], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = results[0];
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      db.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedNewPassword, userId],
        (err) => {
          if (err) {
            console.error("Error updating password:", err);
            return res.status(500).json({ error: "Database error" });
          }

          res.json({ message: "Password updated successfully" });
        }
      );
    });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
