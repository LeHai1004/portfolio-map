import { useState } from "react";
import { Box, Button, MenuItem, TextField, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import LocationPicker, { type LatLng } from "./LocationPicker";
import { createProject, type ProjectType } from "../../api/projectsApi";

export default function ProjectFormPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ProjectType>("Web");
  const [githubUrl, setGithubUrl] = useState("");
  const [position, setPosition] = useState<LatLng | null>(null);

  const mutation = useMutation({ mutationFn: createProject });

  const handleSubmit = () => {
    if (!title.trim() || !position) return;
    mutation.mutate({
      title,
      description,
      type,
      githubUrl,
      latitude: position.latitude,
      longitude: position.longitude,
      tags: [],
    });
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", p: 3, display: "grid", gap: 2 }}>
      <Typography variant="h5">Thả ghim dự án</Typography>

      <TextField
        label="Tên dự án"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <TextField
        label="Mô tả"
        multiline
        minRows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <TextField
        select
        label="Loại dự án"
        value={type}
        onChange={(e) => setType(e.target.value as ProjectType)}
      >
        {["Web", "Mobile", "Game", "AI", "Other"].map((t) => (
          <MenuItem key={t} value={t}>
            {t}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Link GitHub"
        value={githubUrl}
        onChange={(e) => setGithubUrl(e.target.value)}
      />

      <Typography variant="subtitle2">Bấm lên bản đồ để chọn vị trí</Typography>
      <LocationPicker value={position} onChange={setPosition} />
      {position && (
        <Typography variant="caption">
          Vị trí: {position.latitude.toFixed(5)},{" "}
          {position.longitude.toFixed(5)}
        </Typography>
      )}

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={!title.trim() || !position || mutation.isPending}
      >
        {mutation.isPending ? "Đang lưu..." : "Thả ghim"}
      </Button>
      {mutation.isSuccess && (
        <Typography color="success.main">
          Đã tạo dự án "{mutation.data.title}" (id {mutation.data.id})
        </Typography>
      )}
    </Box>
  );
}
