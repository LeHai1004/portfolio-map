import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Container,
  Link as MuiLink,
  Paper,
  Skeleton,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Link as RouterLink, useParams } from "react-router-dom";
import { getCompanyById } from "../../api/companiesApi";

function CompanyProfileSkeleton() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        <Skeleton variant="rectangular" height={220} />
        <Stack spacing={2} sx={{ p: { xs: 2, sm: 4 } }}>
          <Skeleton variant="circular" width={88} height={88} />
          <Skeleton width="55%" height={42} />
          <Skeleton width="40%" />
          <Skeleton variant="rounded" height={110} />
        </Stack>
      </Paper>
    </Container>
  );
}

function CompanyIcon() {
  return (
    <SvgIcon sx={{ fontSize: 44 }} aria-hidden="true">
      <path d="M12 3 2 8v2h20V8L12 3ZM4 12h3v7H4v-7Zm6 0h4v7h-4v-7Zm7 0h3v7h-3v-7ZM2 21h20v-2H2v2Z" />
    </SvgIcon>
  );
}

export default function CompanyProfilePage() {
  const { id } = useParams();
  const theme = useTheme();
  const query = useQuery({
    queryKey: ["company-profile", id],
    queryFn: () => {
      if (!id) {
        throw new Error("Thiếu mã công ty.");
      }
      return getCompanyById(id);
    },
    enabled: Boolean(id),
  });

  if (query.isPending) {
    return <CompanyProfileSkeleton />;
  }

  if (query.isError) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => query.refetch()}>
              Thử lại
            </Button>
          }
        >
          Không thể tải hồ sơ công ty. Vui lòng thử lại.
        </Alert>
      </Container>
    );
  }

  const company = query.data;
  if (!company) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
        <Alert
          severity="info"
          action={
            <Button component={RouterLink} to="/" color="inherit" size="small">
              Về bản đồ
            </Button>
          }
        >
          Không tìm thấy công ty.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
      <Paper
        variant="outlined"
        sx={{
          overflow: "hidden",
          animation: "company-profile-enter 250ms ease-out both",
          "@keyframes company-profile-enter": {
            from: { opacity: 0, transform: "translateY(10px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
          },
        }}
      >
        <Box
          sx={{
            height: { xs: 160, sm: 220 },
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.18)}, ${alpha(theme.palette.secondary.main, 0.26)})`,
          }}
        />
        <Stack spacing={2.5} sx={{ p: { xs: 2, sm: 4 } }}>
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              width: 88,
              height: 88,
              mt: -8,
              border: 3,
              borderColor: "background.paper",
              borderRadius: 3,
              overflow: "hidden",
              bgcolor: "background.paper",
              color: "primary.main",
              boxShadow: 2,
            }}
          >
            {company.logoUrl ? (
              <Box
                component="img"
                src={company.logoUrl}
                alt={`Logo ${company.companyName}`}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <CompanyIcon />
            )}
          </Box>

          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            {company.companyName}
          </Typography>

          {company.address && (
            <Typography color="text.secondary">{company.address}</Typography>
          )}

          {company.description && (
            <Typography
              color="text.secondary"
              sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}
            >
              {company.description}
            </Typography>
          )}

          {company.website && (
            <MuiLink
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ alignSelf: "flex-start" }}
            >
              {company.website}
            </MuiLink>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
