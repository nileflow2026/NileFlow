// In your App.jsx or main routing file
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { RiderAuthProvider } from "./Context/RiderAuthContext";
import { RiderProtectedRoute } from "./components/RiderProtectedRoute";
import RiderLogin from "./Pages/RiderLogin";
import RiderRegister from "./Pages/RiderRegister";
import RiderDashboard from "./Pages/RiderDashboard";

function App() {
  return (
    <Router>
      <RiderAuthProvider>
        <Routes>
          {/* Public Rider Routes */}

          <Route path="/" element={<Navigate to="/rider/login" replace />} />
          <Route path="/rider/login" element={<RiderLogin />} />
          <Route path="/rider/register" element={<RiderRegister />} />

          {/* Protected Rider Routes */}
          <Route
            path="/rider/dashboard"
            element={
              <RiderProtectedRoute>
                <RiderDashboard />
              </RiderProtectedRoute>
            }
          />

          {/* Other routes... */}
        </Routes>
      </RiderAuthProvider>
    </Router>
  );
}

export default App;
