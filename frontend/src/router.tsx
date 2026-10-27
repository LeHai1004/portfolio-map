import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ProjectFormPage from "./features/projects/ProjectFormPage";
import ProjectDetailPage from "./features/projects/ProjectDetailPage";
import CompanyProfilePage from "./features/company/CompanyProfilePage";
import InboxPage from "./features/company/InboxPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "projects/new", element: <ProjectFormPage /> },
      { path: "projects/:id", element: <ProjectDetailPage /> },
      { path: "companies/:id", element: <CompanyProfilePage /> },
      { path: "inbox", element: <InboxPage /> },
    ],
  },
]);
