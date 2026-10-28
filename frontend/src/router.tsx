import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ProjectFormPage from "./features/projects/ProjectFormPage";
import ProjectDetailPage from "./features/projects/ProjectDetailPage";
import MyProjectsPage from "./features/projects/MyProjectsPage";
import CompanyProfilePage from "./features/company/CompanyProfilePage";
import InboxPage from "./features/company/InboxPage";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "projects/new", element: <ProjectFormPage /> },
      { path: "projects/:id", element: <ProjectDetailPage /> },
      { path: "my-projects", element: <MyProjectsPage /> },
      { path: "companies/:id", element: <CompanyProfilePage /> },
      { path: "inbox", element: <InboxPage /> },
    ],
  },
]);
