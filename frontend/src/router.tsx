import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ProjectFormPage from "./features/projects/ProjectFormPage";
import ProjectDetailPage from "./features/projects/ProjectDetailPage";
import CompanyProfilePage from "./features/company/CompanyProfilePage";
import InboxPage from "./features/company/InboxPage";
import AuthProvider from "./features/auth/AuthContext";
import LoginPage from "./features/auth/LoginPage";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import RegisterPage from "./features/auth/RegisterPage";

export const router = createBrowserRouter([
  {
    element: <AuthProvider />,
    children: [
      {
        path: "/",
        element: <Layout />,
        children: [
          { index: true, element: <HomePage /> },
          {
            path: "projects/new",
            element: (
              <ProtectedRoute allowedRoles={["Student"]}>
                <ProjectFormPage />
              </ProtectedRoute>
            ),
          },
          { path: "projects/:id", element: <ProjectDetailPage /> },
          { path: "companies/:id", element: <CompanyProfilePage /> },
          {
            path: "inbox",
            element: (
              <ProtectedRoute allowedRoles={["Student"]}>
                <InboxPage />
              </ProtectedRoute>
            ),
          },
          { path: "login", element: <LoginPage /> },
          { path: "register", element: <RegisterPage /> },
        ],
      },
    ],
  },
]);
