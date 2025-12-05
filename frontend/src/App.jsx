import { useState, useEffect } from "react";
import axios from "axios";

const API =
  import.meta.env.PROD
    ? "https://cs409-campus-connect-1.onrender.com/api"
    : "http://localhost:8000/api";

export default function App() {
  // ---- Auth / nav ----
  const [form, setForm] = useState({ email: "", password: "" });
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("login");
  const [error, setError] = useState("");

  // ---- Data ----
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);

  // ---- UI state (dialogs) ----
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  // ---- Event modal state ----
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    time: "",
  });
  const [savingEvent, setSavingEvent] = useState(false);

  // RSVP visual toggle
  const [rsvpedEvents, setRsvpedEvents] = useState(new Set());

  // axios helper (always reads the latest token)
  const axiosAuth = () =>
    axios.create({
      baseURL: API,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });

  // ---------- SIGNUP ----------
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

  // ---------- LOGIN ----------
  const login = async () => {
    try {
      const res = await axios.post(`${API}/users/login`, form);
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      setError("");
      setPage("dashboard");
      loadGroups();
      loadEvents();
    } catch {
      setError("Invalid credentials or server not running");
    }
  };

  // ---------- LOGOUT ----------
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setPage("login");
  };

  // ---------- GROUPS ----------
  const loadGroups = async () => {
    try {
      const res = await axios.get(`${API}/groups`);
      setGroups(res.data || []);
    } catch {
      alert("Could not load groups");
    }
  };

  const isMember = (g) =>
    !!user && g?.members?.some((m) => (m._id || m) === user._id);

  const joinGroup = async (groupId) => {
    try {
      await axiosAuth().post(`/groups/${groupId}/join`, {});
      await loadGroups();
    } catch {
      alert("Could not join group");
    }
  };

  const leaveGroup = async (groupId) => {
    try {
      await axiosAuth().post(`/groups/${groupId}/leave`, {});
      await loadGroups();
    } catch {
      alert("Could not leave group");
    }
  };

  const createGroup = () => setShowCreateGroup(true);

  const submitCreateGroup = async () => {
    if (!newGroup.name.trim() || !newGroup.description.trim()) {
      alert("Please enter a name and description.");
      return;
    }
    try {
      setSaving(true);
      await axiosAuth().post(`/groups`, newGroup);
      setShowCreateGroup(false);
      setNewGroup({ name: "", description: "" });
      await loadGroups();
    } catch {
      alert("Failed to create group.");
    } finally {
      setSaving(false);
    }
  };

  // ---------- EVENTS ----------
  const loadEvents = async () => {
    try {
      const res = await axios.get(`${API}/events`);
      setEvents(res.data || []);

      if (user) {
        const mine = new Set(
          (res.data || [])
            .filter((ev) =>
              ev.attendees?.some((a) => (a._id || a) === user._id)
            )
            .map((ev) => ev._id)
        );
        setRsvpedEvents(mine);
      }
    } catch {
      alert("Could not load events");
    }
  };

  // open/close event modal
  const openCreateEvent = () => setShowCreateEvent(true);
  const closeCreateEvent = () => {
    setShowCreateEvent(false);
    setNewEvent({ title: "", description: "", location: "", date: "", time: "" });
  };

  // submit event from modal
  const submitCreateEvent = async () => {
    const { title, location, date, time } = newEvent;
    if (!title.trim() || !location.trim() || !date.trim() || !time.trim()) {
      alert("Please fill title, location, date, and time.");
      return;
    }
    try {
      setSavingEvent(true);
      await axiosAuth().post(`/events`, newEvent);
      closeCreateEvent();
      await loadEvents();
    } catch {
      alert("Failed to create event (must be logged in).");
    } finally {
      setSavingEvent(false);
    }
  };

  const rsvpEvent = async (id) => {
    try {
      await axiosAuth().post(`/events/${id}/rsvp`);
      const next = new Set(rsvpedEvents);
      next.add(id);
      setRsvpedEvents(next);
      loadEvents();
    } catch {
      alert("You have already RSVP’d or event error.");
    }
  };

  // ---------- Helpers ----------
  // Is a YYYY-MM-DD date within the next N days?
  const isWithinNextNDays = (yyyy_mm_dd, n = 7) => {
    if (!yyyy_mm_dd) return false;
    const dt = new Date(`${yyyy_mm_dd}T00:00:00`);
    const now = new Date();
    const diffDays = (dt - now) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= n;
  };

  // ---------- Effects ----------
  useEffect(() => {
    if (!user) return;
    if (page === "dashboard") {
      loadGroups();
      loadEvents();
    } else if (page === "groups") {
      loadGroups();
    } else if (page === "events") {
      loadEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page]);

  // ---------- NAV ----------
  const Nav = () => (
    <div className="nav-illini">
      <div className="section" style={{ padding: "14px 20px" }}>
        <div className="flex items-center gap-3">
          <div className="brand">
            <span className="dot" />
            <span>Campus Connect</span>
          </div>
          <div className="ml-4 flex gap-8">
            <button
              onClick={() => {
                setPage("dashboard");
                loadGroups();
                loadEvents();
              }}
              className="btn-outline-illini"
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setPage("groups");
                loadGroups();
              }}
              className="btn-outline-illini"
            >
              Groups
            </button>
            <button
              onClick={() => {
                setPage("events");
                loadEvents();
              }}
              className="btn-outline-illini"
            >
              Events
            </button>
          </div>
          <div className="ml-auto flex items-center gap-3 text-white/90">
            <span className="kv">
              Signed in as <b>{user?.name}</b>
            </span>
            <button onClick={logout} className="btn-illini">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ---------- AUTH SCREEN ----------
  if (!user) {
    return (
      <div className="min-h-screen flex items-center">
        <div className="container-illini w-full">
          <div className="mb-8">
            <h1 className="h1">🎓 Campus Connect</h1>
            <p className="muted mt-1">University of Illinois Urbana-Champaign</p>
          </div>

          <div className="card">
            <h2 className="h2 mb-4">Login</h2>
            <div className="grid gap-3 max-w-md">
              <input
                className="border p-2 rounded"
                placeholder="Email"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                className="border p-2 rounded"
                type="password"
                placeholder="Password"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <div className="flex gap-3">
                <button onClick={login} className="btn-illini">
                  Login
                </button>
                <button onClick={signup} className="btn-outline-illini">
                  Create Account
                </button>
              </div>
              {error && <p className="text-red-600 mt-2">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- DASHBOARD ----------
  if (page === "dashboard") {
    const myGroups = (groups || []).filter(g =>
      g?.members?.some(m => (m._id || m) === user._id)
    );
    const myEvents = (events || []).filter(ev =>
      ev?.attendees?.some(a => (a._id || a) === user._id)
    );
    const upcoming = (events || []).filter(ev => isWithinNextNDays(ev.date, 7));

    return (
      <div className="min-h-screen">
        <Nav />

        <div className="container-illini grid gap-6">
          {/* Header card */}
          <div className="card">
            <h1 className="h1 mb-2">Welcome, {user.name} 👋</h1>
            <p className="muted">Email: {user.email} • Major: {user.major}</p>
            <div className="mt-4 flex gap-3">
              <span className="badge-navy">Auth: JWT</span>
              <span className="badge-orange">Database: MongoDB Atlas</span>
            </div>
          </div>

          {/* Upcoming this week */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="h2">Upcoming (next 7 days)</h2>
              <button
                className="btn-illini"
                onClick={() => {
                  setPage("events");
                  loadEvents();
                }}
              >
                View All Events
              </button>
            </div>

            {upcoming.length === 0 ? (
              <div className="flex items-center justify-between">
                <p className="muted">No events in the next week.</p>
                <button className="btn-illini" onClick={() => setShowCreateEvent(true)}>
                  + Create Event
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {upcoming.map(ev => (
                  <div key={ev._id} className="card card-hover">
                    <div className="text-lg font-semibold text-[var(--illini-navy)]">{ev.title}</div>
                    <div className="muted mt-1">{ev.description}</div>
                    <div className="mt-2 text-sm muted">{ev.location} — {ev.date} @ {ev.time}</div>
                    <div className="mt-3">
                      <button className="btn-illini" onClick={() => rsvpEvent(ev._id)}>RSVP</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Groups */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="h2">My Groups</h2>
              <button
                className="btn-illini"
                onClick={() => {
                  setPage("groups");
                  loadGroups();
                }}
              >
                Browse Groups
              </button>
            </div>

            {myGroups.length === 0 ? (
              <div className="flex items-center justify-between">
                <p className="muted">You haven’t joined any groups yet.</p>
                <div className="flex gap-2">
                  <button
                    className="btn-outline-illini"
                    onClick={() => { setPage("groups"); loadGroups(); }}
                  >
                    Browse Groups
                  </button>
                  <button
                    className="btn-illini"
                    onClick={() => { setPage("groups"); setShowCreateGroup(true); }}
                  >
                    + Create Group
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myGroups.map(g => (
                  <div key={g._id} className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-lg font-semibold text-[#13294B]">{g.name}</div>
                        <div className="text-gray-600 mt-1">{g.description}</div>
                        <div className="text-sm text-gray-400 mt-2">Members: {g.members?.length || 0}</div>
                      </div>
                      <span className="pill pill-joined">Joined ✓</span>
                    </div>
                    <div className="mt-3">
                      <button
                        onClick={() => leaveGroup(g._id)}
                        className="px-4 py-2 rounded-md text-white"
                        style={{ background: "linear-gradient(135deg,#B23A48,#26374A)" }}
                      >
                        Leave Group
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Events */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="h2">My Events</h2>
              <button
                className="btn-illini"
                onClick={() => {
                  setPage("events");
                  loadEvents();
                }}
              >
                Explore Events
              </button>
            </div>

            {myEvents.length === 0 ? (
              <div className="flex items-center justify-between">
                <p className="muted">You haven’t RSVP’d to any events yet.</p>
                <div className="flex gap-2">
                  <button
                    className="btn-outline-illini"
                    onClick={() => { setPage("events"); loadEvents(); }}
                  >
                    Explore Events
                  </button>
                  <button
                    className="btn-illini"
                    onClick={() => setShowCreateEvent(true)}
                  >
                    + Create Event
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myEvents.map(ev => (
                  <div key={ev._id} className="card card-hover">
                    <div className="text-lg font-semibold text-[var(--illini-navy)]">{ev.title}</div>
                    <div className="muted mt-1">{ev.description}</div>
                    <div className="mt-2 text-sm muted">
                      {ev.location} — {ev.date} @ {ev.time}
                    </div>
                    <div className="text-sm muted mt-1">Attendees: {ev.attendees?.length ?? 1}</div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="badge-navy">RSVP’d ✓</span>
                      <button
                        onClick={() => rsvpEvent(ev._id)}
                        className="btn-illini"
                      >
                        RSVP Again
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- GROUPS ----------
  if (page === "groups") {
    const empty = !groups || groups.length === 0;
    return (
      <div className="min-h-screen">
        <Nav />
        <div className="container-illini">
          <div className="flex items-center justify-between mb-4">
            <h2 className="h2">Groups</h2>
            <button onClick={createGroup} className="btn-illini">
              + Create Group
            </button>
          </div>

          {empty ? (
            <div className="card">
              <p className="muted">No groups yet. Be the first to create one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groups.map((g) => {
                const joined = isMember(g);
                return (
                  <div
                    key={g._id}
                    className="p-5 bg-white rounded-xl shadow-sm border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-[#13294B]">
                          {g.name}
                        </h2>
                        <p className="text-gray-600 mt-1">{g.description}</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Members: {g.members?.length || 0}
                        </p>
                      </div>

                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          joined
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {joined ? "Joined ✓" : "Open"}
                      </span>
                    </div>

                    <div className="mt-4">
                      {joined ? (
                        <button
                          onClick={() => leaveGroup(g._id)}
                          className="px-4 py-2 rounded-md text-white"
                          style={{
                            background:
                              "linear-gradient(135deg,#B23A48,#26374A)",
                          }}
                        >
                          Leave Group
                        </button>
                      ) : (
                        <button
                          onClick={() => joinGroup(g._id)}
                          className="px-4 py-2 rounded-md text-white"
                          style={{
                            background:
                              "linear-gradient(135deg,#B23A48,#26374A)",
                          }}
                        >
                          Join Group
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {showCreateGroup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-[520px] rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-xl font-semibold text-[#13294B]">
                Create Group
              </h3>
              <label className="mb-2 block text-sm text-gray-600">
                Group Name
              </label>
              <input
                className="mb-4 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-[#13294B]"
                placeholder="e.g., Data Viz Club"
                value={newGroup.name}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, name: e.target.value })
                }
              />
              <label className="mb-2 block text-sm text-gray-600">
                Description
              </label>
              <textarea
                className="mb-6 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-[#13294B]"
                rows={3}
                placeholder="What is this group about?"
                value={newGroup.description}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, description: e.target.value })
                }
              />
              <div className="flex items-center justify-end gap-3">
                <button
                  className="rounded-lg border px-4 py-2 text-[#13294B] hover:bg-gray-50"
                  onClick={() => setShowCreateGroup(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="rounded-lg bg-gradient-to-r from-[#E84A27] to-[#13294B] px-4 py-2 font-medium text-white shadow hover:opacity-95 disabled:opacity-60"
                  onClick={submitCreateGroup}
                  disabled={saving}
                >
                  {saving ? "Creating…" : "Create Group"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---------- EVENTS ----------
  if (page === "events") {
    const empty = !events || events.length === 0;
    return (
      <div className="min-h-screen">
        <Nav />
        <div className="container-illini">
          <div className="flex items-center justify-between mb-4">
            <h2 className="h2">Events</h2>
            <button onClick={openCreateEvent} className="btn-illini">
              + Create Event
            </button>
          </div>

          {empty ? (
            <div className="card">
              <p className="muted">
                No events scheduled yet. Create the first one!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {events.map((ev) => {
                const rsvped = rsvpedEvents.has(ev._id);
                return (
                  <div key={ev._id} className="card card-hover">
                    <h3 className="text-xl font-semibold text=[var(--illini-navy)]">
                      {ev.title}
                    </h3>
                    <p className="muted mt-1">{ev.description}</p>
                    <p className="mt-2 text-sm muted">
                      {ev.location} — {ev.date} @ {ev.time}
                    </p>
                    <p className="text-sm muted mt-1">
                      Attendees: {ev.attendees?.length ?? 1}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      {rsvped ? <span className="badge-navy">RSVP’d ✓</span> : null}
                      <button
                        onClick={() => rsvpEvent(ev._id)}
                        className="btn-illini"
                      >
                        RSVP
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {showCreateEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-[520px] rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-xl font-semibold text-[#13294B]">
                Create Event
              </h3>

              <label className="mb-2 block text-sm text-gray-600">Title</label>
              <input
                className="mb-3 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-[#13294B]"
                placeholder="e.g., Tech Talk"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
              />

              <label className="mb-2 block text-sm text-gray-600">
                Description
              </label>
              <textarea
                className="mb-3 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-[#13294B]"
                rows={3}
                placeholder="What is this event about?"
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm text-gray-600">
                    Location
                  </label>
                  <input
                    className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-[#13294B]"
                    placeholder="e.g., Siebel 1404"
                    value={newEvent.location}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, location: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-gray-600">
                    Date (YYYY-MM-DD)
                  </label>
                  <input
                    className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-[#13294B]"
                    placeholder="2025-12-10"
                    value={newEvent.date}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="mt-3 mb-2 block text-sm text-gray-600">
                    Time
                  </label>
                  <input
                    className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-[#13294B]"
                    placeholder="5 PM"
                    value={newEvent.time}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, time: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  className="rounded-lg border px-4 py-2 text-[#13294B] hover:bg-gray-50"
                  onClick={closeCreateEvent}
                  disabled={savingEvent}
                >
                  Cancel
                </button>
                <button
                  className="rounded-lg bg-gradient-to-r from-[#E84A27] to-[#13294B] px-4 py-2 font-medium text-white shadow hover:opacity-95 disabled:opacity-60"
                  onClick={submitCreateEvent}
                  disabled={savingEvent}
                >
                  {savingEvent ? "Creating…" : "Create Event"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
