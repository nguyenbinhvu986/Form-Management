/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  Step,
  StepButton,
  Stepper,
  Typography,
} from "@mui/material";
import { ensureEmailChecked } from "./types/EmailCheck";
import {
  experienceSchema,
  personalSchema,
  reviewSchema,
  skillsSchema,
} from "./types/Schemas";
import {
  FIELD_STEP,
  STEP_LABELS,
  ServerValidationError,
  buildPayload,
  defaultValues,
  submitApplication,
} from "./types/AppForm";
import type { ApplicationPayload } from "./types/AppForm";
import type { ApplicationForm } from "./types/Common";
import {
  clearDraft,
  readDraft,
  useAutoSave,
} from "./Components/Hooks/useDraft";
import type { Draft } from "./Components/Hooks/useDraft";
import { StepPersonal } from "./Components/Wizard/StepPersonal/StepPersonal";
import { StepExperience } from "./Components/Wizard/StepExperience/StepExperience";
import { StepSkills } from "./Components/Wizard/StepSkills";
import { StepReview } from "./Components/Wizard/StepReview";
import { UnsavedChangesGuard } from "./Components/Wizard/UnsavedChanges";

const STEP_SCHEMAS = [
  personalSchema,
  experienceSchema,
  skillsSchema,
  reviewSchema,
];
const LAST = STEP_SCHEMAS.length - 1;

function SubmitButton({
  isLast,
  submitting,
  onSubmit,
}: {
  isLast: boolean;
  submitting: boolean;
  onSubmit: () => void;
}) {
  const agreed = useWatch<ApplicationForm, "agreedToTerms">({
    name: "agreedToTerms",
  });

  return (
    <>
      {!isLast && (
        <Button type="submit" variant="outlined" disabled={submitting}>
          Tiếp tục
        </Button>
      )}
      <Button
        type={isLast ? "submit" : "button"}
        onClick={isLast ? undefined : onSubmit}
        variant="contained"
        disabled={submitting || (isLast && !agreed)}
        startIcon={
          submitting ? (
            <CircularProgress size={16} color="inherit" />
          ) : undefined
        }
      >
        {submitting ? "Đang gửi…" : "Gửi hồ sơ"}
      </Button>
    </>
  );
}

export default function App() {
  const [draft, setDraft] = useState<Draft | null>(() => readDraft(LAST));
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<ApplicationPayload | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const stepRef = useRef(step);
  const revalidate = useRef(false);
  const pendingFocus = useRef<keyof ApplicationForm | null>(null);

  const resolver: Resolver<ApplicationForm> = (values, context, options) =>
    zodResolver(STEP_SCHEMAS[stepRef.current] as any)(
      values as any,
      context,
      options as any,
    ) as any;

  const methods = useForm<ApplicationForm>({
    defaultValues,
    mode: "onTouched",
    reValidateMode: "onSubmit",
    resolver,
  });
  const { getValues, trigger, setError, setFocus, reset } = methods;

  useAutoSave(methods, step, !draft && !result);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    if (revalidate.current) {
      revalidate.current = false;
      void trigger(undefined, { shouldFocus: true });
    }
    if (pendingFocus.current) {
      setFocus(pendingFocus.current);
      pendingFocus.current = null;
    }
  }, [step, trigger, setFocus]);

  const restoreDraft = () => {
    if (!draft) return;
    reset(draft.values, { keepDefaultValues: true });
    setStep(draft.step);
    setDraft(null);
  };

  const discardDraft = () => {
    clearDraft();
    setDraft(null);
  };

  const handleReset = () => {
    reset(defaultValues);
    clearDraft();
    setServerError(null);
    setStep(0);
    setConfirmReset(false);
  };

  const handleNext = async () => {
    if (step === 0) await ensureEmailChecked(getValues("email"));
    if (await trigger(undefined, { shouldFocus: true })) setStep((s) => s + 1);
  };
  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const handleSubmit = async () => {
    await ensureEmailChecked(getValues("email"));
    const all = getValues();
    for (let i = 0; i <= LAST; i++) {
      if (!STEP_SCHEMAS[i].safeParse(all).success) {
        if (i === step) {
          void trigger(undefined, { shouldFocus: true });
        } else {
          revalidate.current = true;
          setStep(i);
        }
        return;
      }
    }

    setSubmitting(true);
    setServerError(null);
    try {
      const payload = buildPayload(all);
      await submitApplication(payload);
      clearDraft();
      setResult(payload);
    } catch (e) {
      if (e instanceof ServerValidationError) {
        Object.entries(e.fieldErrors).forEach(([name, message]) =>
          setError(name as keyof ApplicationForm, { type: "server", message }),
        );
        const [first] = Object.keys(e.fieldErrors);
        pendingFocus.current = first as keyof ApplicationForm;
        setStep(FIELD_STEP[first] ?? 0);
      } else {
        setServerError("Máy chủ gặp lỗi (500). Vui lòng thử lại sau.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <Paper sx={{ p: 3, maxWidth: 760, mx: "auto" }}>
        <Stack spacing={2}>
          <Alert severity="success">
            Nộp hồ sơ thành công. Dữ liệu nháp đã được xóa.
          </Alert>
          <Typography variant="subtitle2">Payload JSON</Typography>
          <Box
            component="pre"
            sx={{
              m: 0,
              p: 2,
              bgcolor: "action.hover",
              borderRadius: 1,
              overflow: "auto",
              fontSize: 13,
            }}
          >
            {JSON.stringify(result, null, 2)}
          </Box>
          <Box>
            <Button
              variant="outlined"
              onClick={() => {
                reset(defaultValues);
                setResult(null);
                setStep(0);
              }}
            >
              Nộp hồ sơ khác
            </Button>
          </Box>
        </Stack>
      </Paper>
    );
  }

  return (
    <FormProvider {...methods}>
      <UnsavedChangesGuard />
      <Paper
        component="form"
        noValidate
        aria-labelledby="form-title"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          void (step === LAST ? handleSubmit() : handleNext());
        }}
        sx={{ p: { xs: 2, sm: 3 }, maxWidth: 760, mx: "auto" }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Typography
            id="form-title"
            variant="h5"
            component="h1"
            fontWeight={600}
          >
            Hồ sơ ứng tuyển lập trình viên
          </Typography>
          <Button
            type="button"
            size="small"
            color="error"
            disabled={submitting}
            onClick={() => setConfirmReset(true)}
          >
            Xóa toàn bộ biểu mẫu
          </Button>
        </Stack>

        <Stepper
          activeStep={step}
          alternativeLabel
          nonLinear
          aria-label="Tiến trình nộp hồ sơ"
          sx={{ mb: 4 }}
        >
          {STEP_LABELS.map((label, i) => (
            <Step key={label}>
              <StepButton onClick={() => setStep(i)} disabled={submitting}>
                {label}
              </StepButton>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: 280 }}>
          {step === 0 && <StepPersonal />}
          {step === 1 && <StepExperience />}
          {step === 2 && <StepSkills />}
          {step === 3 && <StepReview onEdit={setStep} />}
        </Box>

        {serverError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {serverError}
          </Alert>
        )}

        <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
          <Button
            type="button"
            disabled={step === 0 || submitting}
            onClick={handleBack}
          >
            Quay lại
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <SubmitButton
            isLast={step === LAST}
            submitting={submitting}
            onSubmit={() => void handleSubmit()}
          />
        </Stack>
      </Paper>

      <Dialog
        open={Boolean(draft)}
        aria-labelledby="draft-title"
        aria-describedby="draft-desc"
      >
        <DialogTitle id="draft-title">Khôi phục dữ liệu?</DialogTitle>
        <DialogContent>
          <DialogContentText id="draft-desc">
            Bạn có muốn khôi phục dữ liệu đã nhập dở trước đó không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={discardDraft}>Bỏ qua</Button>
          <Button onClick={restoreDraft} autoFocus>
            Khôi phục
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        aria-labelledby="reset-title"
        aria-describedby="reset-desc"
      >
        <DialogTitle id="reset-title">Xóa toàn bộ biểu mẫu?</DialogTitle>
        <DialogContent>
          <DialogContentText id="reset-desc">
            Toàn bộ dữ liệu đã nhập và bản nháp đã lưu sẽ bị xóa, không thể hoàn
            tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmReset(false)}>Hủy</Button>
          <Button color="error" onClick={handleReset}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
}
