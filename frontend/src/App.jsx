import { useState } from "react";
import axios from "axios";

export default function App() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const login = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/users/login", form);
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      setError("");
    } catch (err) {
      setError("Invalid credentials or server not running");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  if (user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
        <h1 className="text-3xl font-bold text-green-700 mb-4">
          Welcome, {user.name} 👋
        </h1>
        <p className="text-gray-600 mb-2">Email: {user.email}</p>
        <p className="text-gray-600 mb-4">Major: {user.major}</p>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">Campus Connect Login</h1>

      <input
        className="border p-2 mb-2 rounded w-64"
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        className="border p-2 mb-4 rounded w-64"
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button
        onClick={login}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Login
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}
