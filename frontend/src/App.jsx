import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import DashboardLayout from "./components/DashboardLayout";
import { ProtectedRoute, AuthRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Scanner from "./pages/Scanner";
import Journal from "./pages/Journal";
import MealPlans from "./pages/MealPlans";
import Sport from "./pages/Sport";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            }
          />
          <Route
            path="/inscription"
            element={
              <AuthRoute>
                <Register />
              </AuthRoute>
            }
          />
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="scanner" element={<Scanner />} />
            <Route path="journal" element={<Journal />} />
            <Route path="plans-repas" element={<MealPlans />} />
            <Route path="sport" element={<Sport />} />
            <Route path="fil" element={<Feed />} />
            <Route path="profil" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
