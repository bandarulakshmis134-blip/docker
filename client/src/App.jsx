import { useState } from 'react';

const routes = [
  { path: '/', label: 'Home' },
  { path: '/dashboard', label: 'Dashboard' },
];

function App() {
  const [route, setRoute] = useState(window.location.pathname);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setRoute(path);
  };

  const renderPage = () => {
    if (route === '/dashboard') {
      return <h2>Dashboard page</h2>;
    }
    return <h2>Home page</h2>;
  };

  window.onpopstate = () => setRoute(window.location.pathname);

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
      <main>{renderPage()}</main>
    </div>
  );
}

export default App;
