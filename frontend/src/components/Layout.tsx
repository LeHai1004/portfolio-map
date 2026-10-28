import { useState } from "react";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { clearToken, getToken } from "../api/token";

export default function Layout() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getToken()));

  const handleLogout = () => {
    clearToken();
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ flexGrow: 1, color: "inherit", textDecoration: "none" }}
          >
            Portfolio Map
          </Typography>
          {isLoggedIn ? (
            <Button color="inherit" onClick={handleLogout}>
              Đăng xuất
            </Button>
          ) : (
            <Button color="inherit" component={Link} to="/login">
              Đăng nhập
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, minHeight: 0 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
