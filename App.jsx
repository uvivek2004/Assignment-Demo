import { useState, useEffect, createContext, useContext } from "react";

const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

const API = "http://localhost:5000/api";

const request = async (path, opts = {}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

// ─── AUTH PROVIDER ──────────────────────────────────────────────────────────
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await request("/auth/login", { method: "POST", body: { email, password } });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const signup = async (name, email, password) => {
    const data = await request("/auth/register", { method: "POST", body: { name, email, password } });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, signup, logout, loading }}>{children}</AuthContext.Provider>;
}

// ─── COMPONENTS ─────────────────────────────────────────────────────────────
function Badge({ label, color = "blue" }) {
  const map = {
    blue: { bg: "#E6F1FB", text: "#0C447C" },
    green: { bg: "#EAF3DE", text: "#27500A" },
    amber: { bg: "#FAEEDA", text: "#633806" },
    red: { bg: "#FCEBEB", text: "#791F1F" },
    purple: { bg: "#EEEDFE", text: "#3C3489" },
    gray: { bg: "#F1EFE8", text: "#444441" },
  };
  const c = map[color] || map.blue;
  return (
    <span style={{ background: c.bg, color: c.text, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6, letterSpacing: "0.03em" }}>
      {label}
    </span>
  );
}

function Avatar({ name, size = 32 }) {
  const initials = name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "??";
  const colors = ["#EEEDFE", "#E1F5EE", "#E6F1FB", "#FAEEDA", "#FAECE7"];
  const textColors = ["#3C3489", "#085041", "#0C447C", "#633806", "#993C1D"];
  const idx = name?.charCodeAt(0) % colors.length || 0;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: colors[idx], color: textColors[idx], display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 600, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, minWidth: 420, maxWidth: 560, width: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#1a1a1a" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#888", lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 13, color: "#555", marginBottom: 5, fontWeight: 500 }}>{label}</label>}
      <input style={{ width: "100%", padding: "9px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} {...props} />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 13, color: "#555", marginBottom: 5, fontWeight: 500 }}>{label}</label>}
      <select style={{ width: "100%", padding: "9px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff" }} {...props}>
        {children}
      </select>
    </div>
  );
}

function Btn({ children, variant = "primary", small, ...props }) {
  const base = { border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, transition: "opacity 0.15s" };
  const variants = {
    primary: { background: "#1a1a2e", color: "#fff", padding: small ? "6px 14px" : "10px 20px", fontSize: small ? 12 : 14 },
    secondary: { background: "#f3f3f3", color: "#333", padding: small ? "6px 14px" : "10px 20px", fontSize: small ? 12 : 14 },
    danger: { background: "#FCEBEB", color: "#791F1F", padding: small ? "6px 14px" : "10px 20px", fontSize: small ? 12 : 14 },
    ghost: { background: "transparent", color: "#555", padding: small ? "6px 10px" : "8px 14px", fontSize: small ? 12 : 13 },
  };
  return <button style={{ ...base, ...variants[variant] }} {...props}>{children}</button>;
}

// ─── AUTH PAGE ───────────────────────────────────────────────────────────────
function AuthPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async e => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (mode === "login") await login(form.email, form.password);
      else await signup(form.name, form.email, form.password);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 40, width: 380, boxShadow: "0 30px 80px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1a1a2e" }}>TaskFlow</h1>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: 13 }}>Team Task Manager</p>
        </div>
        <div style={{ display: "flex", background: "#f5f5f5", borderRadius: 10, padding: 3, marginBottom: 24 }}>
          {["login", "signup"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "8px", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, background: mode === m ? "#fff" : "transparent", color: mode === m ? "#1a1a2e" : "#888", boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s", textTransform: "capitalize" }}>
              {m === "login" ? "Log in" : "Sign up"}
            </button>
          ))}
        </div>
        <form onSubmit={handle}>
          {mode === "signup" && <Input label="Full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" required />}
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@company.com" required />
          <Input label="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" required />
          {err && <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 12 }}>{err}</p>}
          <Btn style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
            {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </Btn>
        </form>
      </div>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
function Sidebar({ view, setView, projects, onNewProject }) {
  const { user, logout } = useAuth();
  const navItems = [
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "tasks", icon: "✓", label: "My Tasks" },
  ];

  return (
    <aside style={{ width: 240, background: "#1a1a2e", color: "#fff", display: "flex", flexDirection: "column", padding: "20px 0", flexShrink: 0 }}>
      <div style={{ padding: "0 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.5px" }}>📋 TaskFlow</div>
      </div>
      <nav style={{ padding: "16px 12px", flex: 1 }}>
        {navItems.map(n => (
          <button key={n.id} onClick={() => setView(n.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", border: "none", borderRadius: 8, cursor: "pointer", background: view === n.id ? "rgba(255,255,255,0.12)" : "transparent", color: view === n.id ? "#fff" : "rgba(255,255,255,0.55)", fontWeight: view === n.id ? 600 : 400, fontSize: 13, textAlign: "left", marginBottom: 2, transition: "all 0.15s" }}>
            <span style={{ fontSize: 14 }}>{n.icon}</span>{n.label}
          </button>
        ))}
        <div style={{ margin: "16px 0 8px", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 12px" }}>Projects</div>
        {projects.map(p => (
          <button key={p._id} onClick={() => setView(`project:${p._id}`)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 12px", border: "none", borderRadius: 8, cursor: "pointer", background: view === `project:${p._id}` ? "rgba(255,255,255,0.12)" : "transparent", color: view === `project:${p._id}` ? "#fff" : "rgba(255,255,255,0.55)", fontSize: 13, textAlign: "left", marginBottom: 2 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#7F77DD", flexShrink: 0 }} />{p.name}
          </button>
        ))}
        <button onClick={onNewProject} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: 8, cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 8 }}>
          + New project
        </button>
      </nav>
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={user?.name} size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{user?.role}</div>
        </div>
        <button onClick={logout} title="Log out" style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: 16 }}>↩</button>
      </div>
    </aside>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({ tasks, projects }) {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === "done").length;
  const inprog = tasks.filter(t => t.status === "in-progress").length;
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length;

  const stats = [
    { label: "Total tasks", value: total, color: "#1a1a2e" },
    { label: "In progress", value: inprog, color: "#185FA5" },
    { label: "Completed", value: done, color: "#3B6D11" },
    { label: "Overdue", value: overdue, color: "#A32D2D" },
  ];

  const recent = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div>
      <h2 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 700, color: "#1a1a2e" }}>Dashboard</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "20px 24px" }}>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: "#1a1a2e" }}>Recent tasks</h3>
          {recent.length === 0 && <p style={{ color: "#aaa", fontSize: 13 }}>No tasks yet</p>}
          {recent.map(t => (
            <div key={t._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f5f5f5" }}>
              <StatusDot status={t.status} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a2e" }}>{t.title}</div>
                <div style={{ fontSize: 11, color: "#aaa" }}>{t.projectId?.name || "No project"}</div>
              </div>
              <PriorityBadge p={t.priority} />
            </div>
          ))}
        </div>
        <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: "#1a1a2e" }}>Projects ({projects.length})</h3>
          {projects.length === 0 && <p style={{ color: "#aaa", fontSize: 13 }}>No projects yet</p>}
          {projects.map(p => {
            const ptasks = tasks.filter(t => t.projectId?._id === p._id || t.projectId === p._id);
            const pdone = ptasks.filter(t => t.status === "done").length;
            const pct = ptasks.length ? Math.round((pdone / ptasks.length) * 100) : 0;
            return (
              <div key={p._id} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                  <span style={{ fontSize: 12, color: "#888" }}>{pdone}/{ptasks.length}</span>
                </div>
                <div style={{ height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "#3B6D11", borderRadius: 3, transition: "width 0.5s" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status }) {
  const map = { todo: "#ccc", "in-progress": "#185FA5", done: "#3B6D11", blocked: "#A32D2D" };
  return <div style={{ width: 8, height: 8, borderRadius: "50%", background: map[status] || "#ccc", flexShrink: 0 }} />;
}

function PriorityBadge({ p }) {
  const map = { low: ["Low", "gray"], medium: ["Medium", "blue"], high: ["High", "amber"], urgent: ["Urgent", "red"] };
  const [label, color] = map[p] || ["—", "gray"];
  return <Badge label={label} color={color} />;
}

// ─── TASK FORM ────────────────────────────────────────────────────────────────
function TaskForm({ task, projects, members, onSave, onClose }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ title: task?.title || "", description: task?.description || "", status: task?.status || "todo", priority: task?.priority || "medium", dueDate: task?.dueDate?.slice(0, 10) || "", projectId: task?.projectId?._id || task?.projectId || "", assignedTo: task?.assignedTo?._id || task?.assignedTo || "" });
  const [loading, setLoading] = useState(false);

  const handle = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (task) await request(`/tasks/${task._id}`, { method: "PUT", body: form });
      else await request("/tasks", { method: "POST", body: form });
      onSave();
    } catch (e) { alert(e.message); }
    setLoading(false);
  };

  return (
    <form onSubmit={handle}>
      <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="Task title" />
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 13, color: "#555", marginBottom: 5, fontWeight: 500 }}>Description</label>
        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ width: "100%", padding: "9px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical", minHeight: 80 }} placeholder="Optional description" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
          <option value="blocked">Blocked</option>
        </Select>
        <Select label="Priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </Select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Select label="Project" value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}>
          <option value="">No project</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </Select>
        <Select label="Assign to" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}>
          <option value="">Unassigned</option>
          {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
        </Select>
      </div>
      <Input label="Due date" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
        <Btn type="button" variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn type="submit" disabled={loading}>{loading ? "Saving…" : task ? "Update task" : "Create task"}</Btn>
      </div>
    </form>
  );
}

// ─── TASKS VIEW ───────────────────────────────────────────────────────────────
function TasksView({ tasks, projects, members, onRefresh, projectFilter }) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  let visible = projectFilter ? tasks.filter(t => (t.projectId?._id || t.projectId) === projectFilter) : tasks;
  if (filter !== "all") visible = visible.filter(t => t.status === filter);
  if (search) visible = visible.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

  const deleteTask = async id => {
    if (!confirm("Delete this task?")) return;
    await request(`/tasks/${id}`, { method: "DELETE" });
    onRefresh();
  };

  const statuses = ["all", "todo", "in-progress", "done", "blocked"];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1a1a2e" }}>{projectFilter ? "Project Tasks" : "My Tasks"}</h2>
        <Btn onClick={() => { setEditTask(null); setShowForm(true); }}>+ New task</Btn>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…" style={{ padding: "8px 14px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, outline: "none", flex: "1 1 200px" }} />
        <div style={{ display: "flex", background: "#f5f5f5", borderRadius: 8, padding: 2 }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ padding: "6px 12px", border: "none", borderRadius: 6, cursor: "pointer", background: filter === s ? "#fff" : "transparent", color: filter === s ? "#1a1a2e" : "#888", fontWeight: filter === s ? 600 : 400, fontSize: 12, whiteSpace: "nowrap", textTransform: s === "all" ? "capitalize" : "none" }}>
              {s === "all" ? "All" : s === "in-progress" ? "In progress" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {visible.length === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>No tasks found</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {visible.map(t => {
          const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done";
          return (
            <div key={t._id} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <StatusDot status={t.status} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#1a1a2e", marginBottom: 3 }}>{t.title}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  {t.projectId?.name && <span style={{ fontSize: 11, color: "#888" }}>📁 {t.projectId.name}</span>}
                  {t.assignedTo?.name && <span style={{ fontSize: 11, color: "#888" }}>👤 {t.assignedTo.name}</span>}
                  {t.dueDate && <span style={{ fontSize: 11, color: isOverdue ? "#A32D2D" : "#888" }}>📅 {new Date(t.dueDate).toLocaleDateString()}{isOverdue ? " ⚠️" : ""}</span>}
                </div>
              </div>
              <PriorityBadge p={t.priority} />
              <StatusBadge s={t.status} />
              {(user.role === "admin" || t.assignedTo?._id === user._id || !t.assignedTo) && (
                <div style={{ display: "flex", gap: 4 }}>
                  <Btn small variant="ghost" onClick={() => { setEditTask(t); setShowForm(true); }}>Edit</Btn>
                  {user.role === "admin" && <Btn small variant="danger" onClick={() => deleteTask(t._id)}>Del</Btn>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showForm && (
        <Modal title={editTask ? "Edit task" : "New task"} onClose={() => setShowForm(false)}>
          <TaskForm task={editTask} projects={projects} members={members} onSave={() => { setShowForm(false); onRefresh(); }} onClose={() => setShowForm(false)} />
        </Modal>
      )}
    </div>
  );
}

function StatusBadge({ s }) {
  const map = { todo: ["To Do", "gray"], "in-progress": ["In Progress", "blue"], done: ["Done", "green"], blocked: ["Blocked", "red"] };
  const [label, color] = map[s] || ["—", "gray"];
  return <Badge label={label} color={color} />;
}

// ─── PROJECT FORM ─────────────────────────────────────────────────────────────
function ProjectForm({ project, members, onSave, onClose }) {
  const [form, setForm] = useState({ name: project?.name || "", description: project?.description || "", members: project?.members?.map(m => m._id || m) || [] });
  const [loading, setLoading] = useState(false);

  const handle = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (project) await request(`/projects/${project._id}`, { method: "PUT", body: form });
      else await request("/projects", { method: "POST", body: form });
      onSave();
    } catch (e) { alert(e.message); }
    setLoading(false);
  };

  const toggleMember = id => {
    setForm(f => ({ ...f, members: f.members.includes(id) ? f.members.filter(m => m !== id) : [...f.members, id] }));
  };

  return (
    <form onSubmit={handle}>
      <Input label="Project name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Website Redesign" />
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 13, color: "#555", marginBottom: 5, fontWeight: 500 }}>Description</label>
        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ width: "100%", padding: "9px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical", minHeight: 60 }} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 13, color: "#555", marginBottom: 8, fontWeight: 500 }}>Team members</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 160, overflowY: "auto" }}>
          {members.map(m => (
            <label key={m._id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "6px 8px", borderRadius: 6, background: form.members.includes(m._id) ? "#f0f4ff" : "transparent" }}>
              <input type="checkbox" checked={form.members.includes(m._id)} onChange={() => toggleMember(m._id)} />
              <Avatar name={m.name} size={24} />
              <span style={{ fontSize: 13 }}>{m.name}</span>
              <span style={{ fontSize: 11, color: "#aaa", marginLeft: "auto" }}>{m.role}</span>
            </label>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn type="button" variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn type="submit" disabled={loading}>{loading ? "Saving…" : project ? "Update" : "Create project"}</Btn>
      </div>
    </form>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────
function AppShell() {
  const { user } = useAuth();
  const [view, setView] = useState("dashboard");
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editProject, setEditProject] = useState(null);

  const loadAll = async () => {
    try {
      const [t, p, m] = await Promise.all([request("/tasks"), request("/projects"), request("/users")]);
      setTasks(t);
      setProjects(p);
      setMembers(m);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadAll(); }, []);

  const projectId = view.startsWith("project:") ? view.split(":")[1] : null;
  const currentProject = projectId ? projects.find(p => p._id === projectId) : null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f7f8fa" }}>
      <Sidebar view={view} setView={setView} projects={projects} onNewProject={() => { setEditProject(null); setShowProjectForm(true); }} />
      <main style={{ flex: 1, padding: 36, overflowY: "auto" }}>
        {view === "dashboard" && <Dashboard tasks={tasks} projects={projects} />}
        {(view === "tasks" || projectId) && (
          <TasksView tasks={tasks} projects={projects} members={members} onRefresh={loadAll} projectFilter={projectId} />
        )}
        {projectId && currentProject && user.role === "admin" && (
          <div style={{ marginTop: 24 }}>
            <Btn small variant="secondary" onClick={() => { setEditProject(currentProject); setShowProjectForm(true); }}>Edit project</Btn>
          </div>
        )}
      </main>
      {showProjectForm && (
        <Modal title={editProject ? "Edit project" : "New project"} onClose={() => setShowProjectForm(false)}>
          <ProjectForm project={editProject} members={members} onSave={() => { setShowProjectForm(false); loadAll(); }} onClose={() => setShowProjectForm(false)} />
        </Modal>
      )}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", color: "#888" }}>Loading…</div>;
  return user ? <AppShell /> : <AuthPage />;
}
