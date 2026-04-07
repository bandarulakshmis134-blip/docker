import { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:5000/api';
const routes = [
  { path: '/', label: 'Home' },
  { path: '/dashboard', label: 'Dashboard' },
];

function App() {
  const [route, setRoute] = useState(window.location.pathname);
  const [message, setMessage] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [postData, setPostData] = useState({ title: '', body: '' });
  const [posts, setPosts] = useState([]);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setRoute(path);
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_BASE}/posts`);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error(error);
      setMessage('Unable to load posts.');
    }
  };

  const saveAuth = (data) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setMessage('');

    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData),
    });

    const data = await response.json();
    if (response.ok) {
      saveAuth(data);
      setMessage('Registered successfully.');
      fetchPosts();
      setRegisterData({ name: '', email: '', password: '' });
    } else {
      setMessage(data.error || 'Registration failed.');
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage('');

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });

    const data = await response.json();
    if (response.ok) {
      saveAuth(data);
      setMessage('Logged in successfully.');
      fetchPosts();
      setLoginData({ email: '', password: '' });
    } else {
      setMessage(data.error || 'Login failed.');
    }
  };

  const handleCreatePost = async (event) => {
    event.preventDefault();
    setMessage('');

    const response = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });

    const data = await response.json();
    if (response.ok) {
      setMessage('Post created successfully.');
      setPostData({ title: '', body: '' });
      fetchPosts();
    } else {
      setMessage(data.error || 'Post creation failed.');
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMessage('Logged out.');
  };

  useEffect(() => {
    fetchPosts();
    window.onpopstate = () => setRoute(window.location.pathname);
  }, []);

  const renderDashboard = () => (
    <div>
      <h2>Dashboard</h2>

      {user ? (
        <div>
          <p>Logged in as <strong>{user.name}</strong></p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div className="form-grid">
          <form onSubmit={handleRegister}>
            <h3>Register</h3>
            <input value={registerData.name} onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })} placeholder="Name" required />
            <input type="email" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} placeholder="Email" required />
            <input type="password" value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} placeholder="Password" required />
            <button type="submit">Register</button>
          </form>

          <form onSubmit={handleLogin}>
            <h3>Login</h3>
            <input type="email" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} placeholder="Email" required />
            <input type="password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} placeholder="Password" required />
            <button type="submit">Login</button>
          </form>
        </div>
      )}

      {user && (
        <form onSubmit={handleCreatePost} className="post-form">
          <h3>Create Post</h3>
          <input value={postData.title} onChange={(e) => setPostData({ ...postData, title: e.target.value })} placeholder="Title" required />
          <textarea value={postData.body} onChange={(e) => setPostData({ ...postData, body: e.target.value })} placeholder="Body" required />
          <button type="submit">Create post</button>
        </form>
      )}

      <section className="posts">
        <h3>Posts</h3>
        {posts.length ? (
          posts.map((post) => (
            <article key={post._id}>
              <h4>{post.title}</h4>
              <p>{post.body}</p>
              <small>by {post.author?.name || 'Unknown'}</small>
            </article>
          ))
        ) : (
          <p>No posts yet.</p>
        )}
      </section>
    </div>
  );

  const renderPage = () => {
    if (route === '/dashboard') {
      return renderDashboard();
    }

    return (
      <div>
        <h2>Home</h2>
        <p>This MERN stack application is running with Docker Compose.</p>
        <p>Use the dashboard to register, log in, and create posts.</p>
      </div>
    );
  };

  return (
    <div className="app">
      <header>
        <h1>React SPA</h1>
        <nav>
          {routes.map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)}>
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {message && <div className="notice">{message}</div>}

      <main>{renderPage()}</main>
    </div>
  );
}

export default App;
