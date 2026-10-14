import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { Link, Outlet } from "react-router-dom";

export default function Layout() {
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
          <Button color="inherit" component={Link} to="/login">
            Đăng nhập
          </Button>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, minHeight: 0 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
