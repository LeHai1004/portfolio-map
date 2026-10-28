import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ProjectFormPage from "./features/projects/ProjectFormPage";
import ProjectDetailPage from "./features/projects/ProjectDetailPage";
import MyProjectsPage from "./features/projects/MyProjectsPage";
import CompanyProfilePage from "./features/company/CompanyProfilePage";
import InboxPage from "./features/company/InboxPage";
<<<<<<< HEAD
import AuthProvider from "./features/auth/AuthContext";
import LoginPage from "./features/auth/LoginPage";
import ProtectedRoute from "./features/auth/ProtectedRoute";
=======
import LoginPage from "./features/auth/LoginPage";
>>>>>>> 27337fb0690adf7392dd3b8429b8439770abe0e6
import RegisterPage from "./features/auth/RegisterPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    element: <AuthProvider />,
    children: [
<<<<<<< HEAD
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
=======
      { index: true, element: <HomePage /> },
      { path: "projects/new", element: <ProjectFormPage /> },
      { path: "projects/:id/edit", element: <ProjectFormPage /> },
      { path: "projects/:id", element: <ProjectDetailPage /> },
      { path: "my-projects", element: <MyProjectsPage /> },
      { path: "companies/:id", element: <CompanyProfilePage /> },
      { path: "inbox", element: <InboxPage /> },
>>>>>>> 27337fb0690adf7392dd3b8429b8439770abe0e6
    ],
  },
]);
