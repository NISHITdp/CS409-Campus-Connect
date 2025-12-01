import { useState } from "react";
import axios from "axios";

const API = "https://cs409-campus-connect-1.onrender.com/api";
// FOR LOCAL DEV
// const API = "http://localhost:8000/api";


export default function App() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("login");
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  const signup = async () => {
    const name = prompt("Enter your name");
    const major = prompt("Enter your major");

    if (!name || !form.email || !form.password) {
      alert("Fill all fields");
      return;
    }

    try {
      await axios.post(`${API}/users/register`, {
        name,
        email: form.email,
        password: form.password,
        major,
      });
      alert("Signup successful! Now login.");
    } catch {
      alert("Signup failed — email may already exist.");
    }
  };

  const login = async () => {
    try {
      const res = await axios.post(`${API}/users/login`, form);
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      setPage("dashboard");
      setError("");
    } catch {
      setError("Invalid credentials or server not running");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setPage("login");
  };

  const loadGroups = async () => {
    try {
      const res = await axios.get(`${API}/groups`);
      setGroups(res.data);
    } catch {
      alert("Could not load groups");
    }
  };

  const createGroup = async () => {
    const name = prompt("Group name:");
    const description = prompt("Description:");

    if (!name || !description) {
      alert("Enter both name & description");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `${API}/groups`,
        { name, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Group created!");
      loadGroups();
    } catch {
      alert("Failed to create group (must be logged in)");
    }
  };

  const loadEvents = async () => {
    try {
      const res = await axios.get(`${API}/events`);
      setEvents(res.data);
    } catch {
      alert("Could not load events");
    }
  };

  const createEvent = async () => {
    const title = prompt("Event title:");
    const description = prompt("Description:");
    const location = prompt("Location:");
    const date = prompt("Date (YYYY-MM-DD):");
    const time = prompt("Time (e.g., 5 PM):");

    if (!title || !location || !date || !time) {
      alert("Fill all required fields");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `${API}/events`,
        {
          title,
          description,
          location,
          date,
          time,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Event created!");
      loadEvents();
    } catch {
      alert("Failed to create event (must be logged in)");
    }
  };

  const rsvpEvent = async (id) => {
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `${API}/events/${id}/rsvp`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("RSVP successful!");
      loadEvents();
    } catch {
      alert("You have already RSVP’d or event error.");
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">
          Campus Connect Login
        </h1>

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
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-4"
        >
          Login
        </button>

        <button
          onClick={signup}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Create Account
        </button>

        {error && <p className="text-red-600 mt-4">{error}</p>}
      </div>
    );
  }

  const Nav = () => (
    <div className="flex gap-4 mb-6">
      <button
        onClick={() => setPage("dashboard")}
        className="px-4 py-2 bg-blue-200 rounded"
      >
        Dashboard
      </button>

      <button
        onClick={() => {
          loadGroups();
          setPage("groups");
        }}
        className="px-4 py-2 bg-green-200 rounded"
      >
        Groups
      </button>

      <button
        onClick={() => {
          loadEvents();
          setPage("events");
        }}
        className="px-4 py-2 bg-yellow-200 rounded"
      >
        Events
      </button>

      <button
        onClick={logout}
        className="px-4 py-2 bg-red-400 text-white rounded"
      >
        Logout
      </button>
    </div>
  );

  if (page === "dashboard") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-6">
        <Nav />
        <h1 className="text-3xl font-bold text-green-700 mb-4">
          Welcome, {user.name} 👋
        </h1>
        <p className="text-gray-600">Email: {user.email}</p>
        <p className="text-gray-600 mb-4">Major: {user.major}</p>
      </div>
    );
  }

  if (page === "groups") {
    return (
      <div className="min-h-screen bg-yellow-50 p-6">
        <Nav />

        <h1 className="text-2xl font-bold mb-4">Groups</h1>

        <button
          onClick={createGroup}
          className="mb-4 px-4 py-2 bg-purple-600 text-white rounded"
        >
          + Create Group
        </button>

        <div className="grid grid-cols-1 gap-4">
          {groups.map((g) => (
            <div key={g._id} className="p-4 bg-white shadow rounded">
              <h2 className="text-xl font-bold">{g.name}</h2>
              <p className="text-gray-600">{g.description}</p>
              <p className="text-sm text-gray-400 mt-2">
                Members: {g.members?.length || 1}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (page === "events") {
    return (
      <div className="min-h-screen bg-blue-50 p-6">
        <Nav />

        <h1 className="text-2xl font-bold mb-4">Events</h1>

        <button
          onClick={createEvent}
          className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded"
        >
          + Create Event
        </button>

        <div className="grid grid-cols-1 gap-4">
          {events.map((ev) => (
            <div key={ev._id} className="p-4 bg-white shadow rounded">
              <h2 className="text-xl font-bold">{ev.title}</h2>
              <p className="text-gray-600">{ev.description}</p>
              <p className="text-gray-500 text-sm">
                {ev.location} — {ev.date} @ {ev.time}
              </p>
              <p className="text-gray-400 mt-1 text-sm">
                Attendees: {ev.attendees?.length || 1}
              </p>

              <button
                onClick={() => rsvpEvent(ev._id)}
                className="mt-3 px-3 py-1 bg-green-500 text-white rounded"
              >
                RSVP
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
