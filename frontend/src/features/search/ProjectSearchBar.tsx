import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Fade,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Slide,
  Stack,
  SvgIcon,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { TagDto } from "../../api/tagsApi";
import type { UniversityDto } from "../../api/universitiesApi";

export type ProjectSearchFilters = {
  keyword: string;
  types: string[];
  tagIds: number[];
  universityId: number | null;
};

const projectTypes = ["Web", "Mobile", "Game", "AI", "Other"] as const;
const typeLabels: Record<(typeof projectTypes)[number], string> = {
  Web: "Web",
  Mobile: "Mobile",
  Game: "Game",
  AI: "AI",
  Other: "Khác",
};

export default function ProjectSearchBar({
  tags,
  universities,
  onChange,
  disableAnimation,
}: {
  tags: TagDto[];
  universities: UniversityDto[];
  onChange: (filters: ProjectSearchFilters) => void;
  disableAnimation: boolean;
}) {
  const theme = useTheme();
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
  );
  const [keyword, setKeyword] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState<
    number | null
  >(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const transitionDuration =
    disableAnimation || prefersReducedMotion ? 0 : 250;

  const emitChange = (filters: ProjectSearchFilters) => {
    onChange(filters);
  };

  const applyFilters = () => {
    emitChange({
      keyword: keyword.trim(),
      types: selectedTypes,
      tagIds: selectedTagIds,
      universityId: selectedUniversityId,
    });
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setKeyword("");
    setSelectedTypes([]);
    setSelectedTagIds([]);
    setSelectedUniversityId(null);
    emitChange({
      keyword: "",
      types: [],
      tagIds: [],
      universityId: null,
    });
    setIsFilterOpen(false);
  };

  const toggleType = (type: string) => {
    setSelectedTypes((current) =>
      current.includes(type)
        ? current.filter((value) => value !== type)
        : [...current, type],
    );
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: 16,
        left: "50%",
        zIndex: theme.zIndex.appBar,
        width: { xs: "calc(100% - 32px)", sm: "min(680px, calc(100% - 48px))" },
        transform: "translateX(-50%)",
        pointerEvents: "none",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          display: "flex",
          gap: 1,
          p: 1,
          borderRadius: 3,
          pointerEvents: "auto",
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm dự án..."
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              applyFilters();
            }
          }}
          slotProps={{
            htmlInput: { "aria-label": "Tìm dự án theo từ khóa" },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SvgIcon sx={{ color: "action.active" }} aria-hidden="true">
                    <path d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 1 0 14 15.5l.27.28v.79L20 22l2-2-6.5-6ZM10 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
                  </SvgIcon>
                </InputAdornment>
              ),
            },
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
        <Button
          variant={isFilterOpen ? "contained" : "outlined"}
          color="primary"
          onClick={() => setIsFilterOpen((open) => !open)}
          aria-expanded={isFilterOpen}
          aria-controls="project-filter-panel"
          sx={{ flexShrink: 0 }}
        >
          Bộ lọc
        </Button>
      </Paper>

      <Fade in={isFilterOpen} timeout={transitionDuration} unmountOnExit>
        <Slide
          in={isFilterOpen}
          direction="down"
          timeout={transitionDuration}
          mountOnEnter
          unmountOnExit
        >
          <Paper
            id="project-filter-panel"
            elevation={8}
            sx={{
              mt: 1,
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              pointerEvents: "auto",
              transformOrigin: "top center",
              "@media (prefers-reduced-motion: reduce)": {
                transition: "none",
              },
            }}
          >
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Loại dự án
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {projectTypes.map((type) => {
                    const selected = selectedTypes.includes(type);
                    return (
                      <Chip
                        key={type}
                        label={typeLabels[type]}
                        clickable
                        color={selected ? "primary" : "default"}
                        variant={selected ? "filled" : "outlined"}
                        onClick={() => toggleType(type)}
                        aria-pressed={selected}
                      />
                    );
                  })}
                </Box>
              </Box>

              <FormControl fullWidth size="small">
                <InputLabel id="project-tags-label">Tag công nghệ</InputLabel>
                <Select<number[]>
                  labelId="project-tags-label"
                  multiple
                  value={selectedTagIds}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSelectedTagIds(
                      typeof value === "string"
                        ? value.split(",").map(Number)
                        : value,
                    );
                  }}
                  input={<OutlinedInput label="Tag công nghệ" />}
                  renderValue={(selected) =>
                    tags
                      .filter((tag) => selected.includes(tag.id))
                      .map((tag) => tag.name)
                      .join(", ")
                  }
                >
                  {tags.map((tag) => (
                    <MenuItem key={tag.id} value={tag.id}>
                      {tag.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel id="project-university-label">
                  Trường đại học
                </InputLabel>
                <Select<number | "">
                  labelId="project-university-label"
                  value={selectedUniversityId ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSelectedUniversityId(value === "" ? null : Number(value));
                  }}
                  input={<OutlinedInput label="Trường đại học" />}
                >
                  <MenuItem value="">
                    <em>Tất cả trường</em>
                  </MenuItem>
                  {universities.map((university) => (
                    <MenuItem key={university.id} value={university.id}>
                      {university.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 1,
                }}
              >
                <Button variant="outlined" color="primary" onClick={clearFilters}>
                  Xóa lọc
                </Button>
                <Button variant="contained" color="primary" onClick={applyFilters}>
                  Áp dụng
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Slide>
      </Fade>
    </Box>
  );
}
