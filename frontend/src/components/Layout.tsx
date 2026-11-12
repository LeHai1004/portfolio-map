import { AppBar, Avatar, Box, Button, SvgIcon, Toolbar, Typography } from "@mui/material";
import { alpha, type Theme } from "@mui/material/styles";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/authContextStore";

const menuButtonSx = (active: boolean) => (theme: Theme) => ({
  position: "relative",
  minWidth: 0,
  px: { xs: 1, sm: 1.5 },
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  fontSize: {
    xs: theme.typography.caption.fontSize ?? theme.typography.fontSize,
    sm: theme.typography.button.fontSize ?? theme.typography.fontSize,
  },
  fontWeight: 500,
  textTransform: "none",
  "&::after": {
    content: '""',
    position: "absolute",
    left: theme.spacing(1),
    right: theme.spacing(1),
    bottom: theme.spacing(0.35),
    height: "2px",
    bgcolor: theme.palette.primary.main,
    transform: `scaleX(${active ? 1 : 0})`,
    transformOrigin: "center",
    transition: "transform 200ms ease",
  },
  "&:hover::after": {
    transform: "scaleX(1)",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
    transform: "none",
    "&:hover": {
      transform: "none",
    },
    "&::after": {
      transition: "none",
      transform: `scaleX(${active ? 1 : 0})`,
    },
    "&:hover::after": {
      transform: `scaleX(${active ? 1 : 0})`,
    },
  },
});

const primaryButtonSx = (theme: Theme) => ({
  minWidth: 0,
  px: { xs: 1, sm: 1.5 },
  fontSize: {
    xs: theme.typography.caption.fontSize ?? theme.typography.fontSize,
    sm: theme.typography.button.fontSize ?? theme.typography.fontSize,
  },
  transition: "transform 180ms ease, opacity 180ms ease",
  "&:hover": {
    transform: "translateY(-1px)",
    boxShadow: theme.shadows[2],
  },
  "&:active": {
    transform: "scale(0.98)",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
    transform: "none",
    "&:hover": {
      transform: "none",
    },
    "&:active": {
      transform: "none",
    },
  },
});

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <AppBar
        position="static"
        color="inherit"
        elevation={0}
        sx={(theme) => ({
          color: theme.palette.text.primary,
          bgcolor: alpha(theme.palette.background.paper, 0.92),
          backdropFilter: "blur(8px)",
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[1],
        })}
      >
        <Toolbar
          sx={{
            flexWrap: "wrap",
            gap: { xs: 0.5, sm: 1 },
            px: { xs: 1.5, sm: 2 },
          }}
        >
          <Box
            component={Link}
            to="/"
            sx={(theme) => ({
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              flexGrow: 1,
              minWidth: 0,
              color: theme.palette.text.primary,
              textDecoration: "none",
            })}
          >
            <SvgIcon
              aria-hidden="true"
              sx={(theme) => ({ color: theme.palette.primary.main })}
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
            </SvgIcon>
            <Typography
              variant="h6"
              sx={(theme) => ({
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontSize: {
                  xs:
                    theme.typography.subtitle1.fontSize ??
                    theme.typography.fontSize,
                  sm:
                    theme.typography.h6.fontSize ??
                    theme.typography.fontSize,
                },
                fontWeight: 700,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              })}
            >
              Portfolio Map
            </Typography>
          </Box>
          {!user ? (
            <>
              <Button
                variant="text"
                color="inherit"
                component={Link}
                to="/login"
                aria-current={isActive("/login") ? "page" : undefined}
                sx={menuButtonSx(isActive("/login"))}
              >
                Đăng nhập
              </Button>
              <Button
                variant="contained"
                color="primary"
                component={Link}
                to="/register"
                aria-current={isActive("/register") ? "page" : undefined}
                sx={primaryButtonSx}
              >
                Đăng ký
              </Button>
            </>
          ) : (
            <>
              {user.role.toLowerCase() === "student" && (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to="/projects/new"
                    aria-current={isActive("/projects/new") ? "page" : undefined}
                    sx={primaryButtonSx}
                  >
                    Thả ghim
                  </Button>
                  <Button
                    variant="text"
                    color="inherit"
                    component={Link}
                    to="/my-projects"
                    aria-current={isActive("/my-projects") ? "page" : undefined}
                    sx={menuButtonSx(isActive("/my-projects"))}
                  >
                    Dự án của tôi
                  </Button>
                  <Button
                    variant="text"
                    color="inherit"
                    component={Link}
                    to="/inbox"
                    aria-current={isActive("/inbox") ? "page" : undefined}
                    sx={menuButtonSx(isActive("/inbox"))}
                  >
                    Hộp thư
                  </Button>
                </>
              )}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 0.5, sm: 1 },
                }}
              >
                <Avatar
                  sx={(theme) => ({
                    width: 28,
                    height: 28,
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    color: theme.palette.primary.main,
                    fontSize: theme.typography.caption.fontSize,
                    fontWeight: 500,
                  })}
                >
                  {user.fullName.trim().slice(0, 1).toUpperCase() || "?"}
                </Avatar>
                <Typography
                  variant="body2"
                  sx={{
                    display: { xs: "none", sm: "block" },
                    color: "text.primary",
                  }}
                >
                  {user.fullName}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleLogout}
                sx={(theme) => ({
                  minWidth: 0,
                  px: { xs: 1, sm: 1.5 },
                  fontSize: {
                    xs:
                      theme.typography.caption.fontSize ??
                      theme.typography.fontSize,
                    sm:
                      theme.typography.button.fontSize ??
                      theme.typography.fontSize,
                  },
                  borderColor: theme.palette.divider,
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                  },
                })}
              >
                Đăng xuất
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, minHeight: 0 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
