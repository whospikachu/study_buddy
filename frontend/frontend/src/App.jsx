import React, { useState } from "react";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/Dashbord";
import "./index.css";
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("access_token")
  );
  return (
    <>
      {isAuthenticated ? (
        <DashboardPage setIsAuthenticated={setIsAuthenticated} />
      ) : (
        <AuthPage setIsAuthenticated={setIsAuthenticated} />
      )}
    </>
  );
}

export default App;
