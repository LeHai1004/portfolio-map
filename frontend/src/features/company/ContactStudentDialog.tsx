import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import {
  getContactFieldErrors,
  sendContactMessage,
  type ContactFieldErrors,
} from "../../api/contactsApi";

type ContactStudentDialogProps = {
  open: boolean;
  projectId: number;
  onClose: () => void;
  onSent: () => void;
};

export default function ContactStudentDialog({
  open,
  projectId,
  onClose,
  onSent,
}: ContactStudentDialogProps) {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const mutation = useMutation({
    mutationFn: sendContactMessage,
    onSuccess: () => {
      setSubject("");
      setContent("");
      setFieldErrors({});
      setSubmitError("");
      onClose();
      onSent();
    },
    onError: (error) => {
      const errors = getContactFieldErrors(error);
      if (errors) {
        setFieldErrors(errors);
        setSubmitError("");
      } else {
        setSubmitError("Không thể gửi lời nhắn. Vui lòng thử lại.");
      }
    },
  });

  function closeDialog() {
    if (mutation.isPending) {
      return;
    }
    setFieldErrors({});
    setSubmitError("");
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutation.isPending) {
      return;
    }
    setFieldErrors({});
    setSubmitError("");
    mutation.mutate({ projectId, subject, content });
  }

  return (
    <Dialog
      open={open}
      onClose={closeDialog}
      fullWidth
      maxWidth="sm"
      aria-labelledby="contact-student-dialog-title"
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle id="contact-student-dialog-title">
          Liên hệ sinh viên
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField
              autoFocus
              required
              fullWidth
              label="Tiêu đề"
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value);
                setFieldErrors((current) => ({ ...current, subject: undefined }));
              }}
              error={Boolean(fieldErrors.subject?.length)}
              helperText={fieldErrors.subject?.[0] ?? `${subject.length}/200`}
              slotProps={{ htmlInput: { maxLength: 200 } }}
            />
            <TextField
              required
              fullWidth
              multiline
              minRows={5}
              label="Nội dung"
              value={content}
              onChange={(event) => {
                setContent(event.target.value);
                setFieldErrors((current) => ({ ...current, content: undefined }));
              }}
              error={Boolean(fieldErrors.content?.length)}
              helperText={fieldErrors.content?.[0] ?? `${content.length}/2000`}
              slotProps={{ htmlInput: { maxLength: 2000 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} disabled={mutation.isPending}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
            sx={{
              transition: "transform 150ms ease",
              "&:active": { transform: "scale(0.98)" },
              "@media (prefers-reduced-motion: reduce)": {
                transition: "none",
                "&:active": { transform: "none" },
              },
            }}
          >
            {mutation.isPending ? "Đang gửi..." : "Gửi"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
