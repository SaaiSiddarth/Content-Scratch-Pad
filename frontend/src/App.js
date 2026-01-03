import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [ideas, setIdeas] = useState([]);

  // Auth fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Idea fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("Twitter");

  // Helper function to switch auth views and clear messages
  const switchAuthView = (view) => {
    setAuthView(view);
    setError("");
    setSuccessMsg("");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
      fetchIdeas();
    }
  }, []);

  const fetchIdeas = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:5000/api/ideas", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setIdeas(data);
  };

  // Handle Login/Signup
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const endpoint =
      authView === "login" ? "/api/auth/login" : "/api/auth/register";
    const body =
      authView === "login" ? { email, password } : { name, email, password };

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setIsLoggedIn(true);
        setUser(data.user);
        fetchIdeas();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Something went wrong!");
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setSuccessMsg(
          `Reset code sent! Code: ${data.resetToken} (Check backend console)`
        );
        setAuthView("reset");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Something went wrong!");
    }
  };

  // Handle Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, resetToken, newPassword }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setSuccessMsg("Password reset successful! You can now login.");
        setTimeout(() => {
          switchAuthView("login");
        }, 2000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Something went wrong!");
    }
  };

  // Handle Idea Submit
  const handleIdeaSubmit = async (e) => {
    e.preventDefault();
    if (!title) return alert("Title required!");

    const token = localStorage.getItem("token");
    await fetch("http://localhost:5000/api/ideas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description, platform }),
    });

    setTitle("");
    setDescription("");
    fetchIdeas();
  };

  const updateStatus = async (id, newStatus) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:5000/api/ideas/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchIdeas();
  };

  const deleteIdea = async (id) => {
    if (!window.confirm("Delete this idea?")) return;
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:5000/api/ideas/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchIdeas();
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setIdeas([]);
    setUser(null);
  };

  // AUTH SCREENS
  if (!isLoggedIn) {
    return (
      <div className="App auth-screen">
        <div className="auth-box">
          <h1> Content Planner</h1>

          {/* LOGIN */}
          {authView === "login" && (
            <>
              <h2>Login</h2>
              {error && <div className="error">{error}</div>}
              {successMsg && <div className="success">{successMsg}</div>}

              <form onSubmit={handleAuthSubmit}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="submit">Login</button>
              </form>

              <p className="toggle">
                <span onClick={() => switchAuthView("forgot")}>
                  Forgot Password?
                </span>
              </p>
              <p className="toggle">
                Don't have an account?
                <span onClick={() => switchAuthView("signup")}> Sign Up</span>
              </p>
            </>
          )}

          {/* SIGNUP */}
          {authView === "signup" && (
            <>
              <h2>Sign Up</h2>
              {error && <div className="error">{error}</div>}

              <form onSubmit={handleAuthSubmit}>
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="submit">Sign Up</button>
              </form>

              <p className="toggle">
                Already have account?
                <span onClick={() => switchAuthView("login")}> Login</span>
              </p>
            </>
          )}

          {/* FORGOT PASSWORD */}
          {authView === "forgot" && (
            <>
              <h2>Forgot Password</h2>
              {error && <div className="error">{error}</div>}
              {successMsg && <div className="success">{successMsg}</div>}

              <form onSubmit={handleForgotPassword}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit">Get Reset Code</button>
              </form>

              <p className="toggle">
                Remember password?
                <span onClick={() => switchAuthView("login")}> Login</span>
              </p>
            </>
          )}

          {/* RESET PASSWORD */}
          {authView === "reset" && (
            <>
              <h2>Reset Password</h2>
              {error && <div className="error">{error}</div>}
              {successMsg && <div className="success">{successMsg}</div>}

              <form onSubmit={handleResetPassword}>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button type="submit">Reset Password</button>
              </form>

              <p className="toggle">
                <span onClick={() => switchAuthView("login")}>
                  Back to Login
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // MAIN APP SCREEN
  return (
    <div className="App">
      <div className="header">
        <h1> Content Planner</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}!</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="form-container">
        <h2>Create New Idea</h2>
        <form onSubmit={handleIdeaSubmit}>
          <input
            type="text"
            placeholder="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option>Twitter</option>
            <option>Instagram</option>
            <option>LinkedIn</option>
            <option>Blog</option>
          </select>
          <button type="submit">Add Idea</button>
        </form>
      </div>

      <div className="ideas-container">
        <h2>Your Ideas</h2>
        {ideas.length === 0 ? (
          <p>No ideas yet. Create one above! 👆</p>
        ) : (
          ideas.map((idea) => (
            <div key={idea._id} className="idea-card">
              <h3>{idea.title}</h3>
              <p>{idea.description}</p>
              <span className="platform">{idea.platform}</span>
              <div className="status-badge">{idea.status}</div>

              <div className="buttons">
                {idea.status === "draft" && (
                  <button onClick={() => updateStatus(idea._id, "scheduled")}>
                    📅 Schedule
                  </button>
                )}
                {idea.status === "scheduled" && (
                  <button onClick={() => updateStatus(idea._id, "published")}>
                    ✅ Publish
                  </button>
                )}
                <button
                  onClick={() => deleteIdea(idea._id)}
                  className="delete-btn"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
