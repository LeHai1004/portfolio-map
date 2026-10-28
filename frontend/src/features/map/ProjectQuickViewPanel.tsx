import {
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Link as RouterLink } from "react-router-dom";
import type { MapPin } from "../../api/mapApi";

function CloseIcon() {
  return (
    <SvgIcon aria-hidden="true">
      <path d="m19 6.4-1.4-1.4L12 10.6 6.4 5 5 6.4l5.6 5.6L5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6L19 6.4Z" />
    </SvgIcon>
  );
}

export default function ProjectQuickViewPanel({
  pin,
  onClose,
  disableTransition,
}: {
  pin: MapPin | null;
  onClose: () => void;
  disableTransition: boolean;
}) {
  const theme = useTheme();
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
  );
  const open = pin !== null;
  const transitionDuration =
    disableTransition || prefersReducedMotion ? 0 : 250;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      transitionDuration={transitionDuration}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: 380 },
            maxWidth: "100vw",
            p: 3,
            bgcolor: "background.paper",
            boxShadow: theme.shadows[12],
          },
        },
      }}
    >
      {pin && (
        <Stack spacing={2.5}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mx: -1 }}>
            <IconButton aria-label="Đóng xem nhanh" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
              aspectRatio: "16 / 10",
              borderRadius: 2,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)}, ${alpha(theme.palette.secondary.main, 0.2)})`,
            }}
          >
            {pin.thumbnailUrl ? (
              <Box
                component="img"
                src={pin.thumbnailUrl}
                alt={`Ảnh dự án ${pin.title}`}
                sx={{
                  gridArea: "1 / 1",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <Typography
                sx={{ gridArea: "1 / 1", color: "primary.main" }}
                variant="body2"
              >
                Chưa có ảnh dự án
              </Typography>
            )}
          </Box>

          <Stack spacing={1}>
            <Chip
              label={pin.type}
              color="primary"
              variant="outlined"
              sx={{ alignSelf: "flex-start" }}
            />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
              {pin.title}
            </Typography>
          </Stack>

          <Button
            component={RouterLink}
            to={`/projects/${pin.id}`}
            variant="contained"
            color="primary"
            onClick={onClose}
            fullWidth
          >
            Xem chi tiết
          </Button>
        </Stack>
      )}
    </Drawer>
  );
}
