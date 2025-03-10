import {
  SandpackLayout,
  SandpackProvider,
  SandpackTests,
} from "@codesandbox/sandpack-react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import SettingsBackupRestoreIcon from "@mui/icons-material/SettingsBackupRestore";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import {
  Alert,
  Breadcrumbs,
  Button,
  ButtonGroup,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useNotifications } from "@toolpad/core/useNotifications";
import classNames from "classnames";
import { useCallback, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Link, useParams } from "react-router";
import { useAuthContext } from "../../auth/auth-context";
import { DifficultyChip } from "../../components/difficulty-chip";
import { TagChip } from "../../components/tag-chip";
import { useGetProblem } from "../../store/problems";
import {
  useDeleteSubmission,
  useGetSubmission,
  useSetSubmission,
  useSetUser,
} from "../../store/users";
import { IProblem } from "../../types";
import { CodeEditor, ICodeEditorRef } from "./code-editor";
import { MarkdownRenderer } from "./markdown-renderer";

const ProblemDescription = ({
  problem,
  className,
}: {
  problem: IProblem;
  className?: string;
}) => {
  return (
    <div className={classNames("flex flex-col gap-1 h-full", className)}>
      <Typography variant="h6">{problem.title}</Typography>
      <div className="flex gap-2">
        <DifficultyChip difficulty={problem.difficulty} />
        {problem.tags.map((tag) => (
          <TagChip key={tag} tag={tag} />
        ))}
      </div>
      <div className="my-4 flex-grow-1 overflow-auto">
        <MarkdownRenderer children={problem.description} />
      </div>
    </div>
  );
};

const ProblemHeader = ({
  problem,
  codeEditorRef,
  loadLastSubmission,
  submission,
}: {
  problem: IProblem;
  codeEditorRef: React.RefObject<ICodeEditorRef | null>;
  submission: ReturnType<typeof useGetSubmission>;
  loadLastSubmission: () => void;
}) => {
  const { user } = useAuthContext();
  const isCompleted = user.completions[problem.id];
  const setUserMutation = useSetUser();

  const notifications = useNotifications();

  const setCompleted = useCallback(async () => {
    const completions = { ...user.completions };
    if (isCompleted) {
      delete completions[problem.id];
    } else {
      completions[problem.id] = true;
    }

    await setUserMutation.mutateAsync({
      ...user,
      completions,
    });

    notifications.show(
      isCompleted ? "Problem uncompleted" : "Problem completed",
      { severity: isCompleted ? "info" : "success" }
    );
  }, [isCompleted, setUserMutation, user, problem.id, notifications]);

  const { mutateAsync: setSubmission, isPending: setSubmissionPending } =
    useSetSubmission();

  const { mutateAsync: deleteSubmission, isPending: deleteSubmissionPending } =
    useDeleteSubmission();

  const handleSave = useCallback(async () => {
    if (!codeEditorRef.current) return;

    const filesToSave = Object.entries(
      codeEditorRef.current?.getAllFilesContent().current
    ).reduce<Record<string, string>>((acc, [file, content]) => {
      // ignore test files as we never want to save changes to them
      if (!file.includes(".test")) {
        acc[file] = content;
      }
      return acc;
    }, {});

    await setSubmission({ problemId: problem.id, submission: filesToSave });

    notifications.show("Your submission has been saved", {
      severity: "success",
    });
  }, [setSubmission, problem.id, codeEditorRef, notifications]);

  const handleReset = useCallback(async () => {
    codeEditorRef.current?.resetAllFiles();
    notifications.show("All files have been reset", { severity: "info" });
  }, [codeEditorRef, notifications]);

  const handleDelete = useCallback(async () => {
    await deleteSubmission({ problemId: problem.id });
    notifications.show("Submission deleted", { severity: "info" });
  }, [problem.id, notifications, deleteSubmission]);

  return (
    <div className="flex justify-between items-center mb-2">
      <Breadcrumbs>
        <Link to={`/problems/${[problem.category]}`}>
          <Typography variant="body2">{problem.category} Problems</Typography>
        </Link>
        <Typography variant="body2">{problem.title}</Typography>
      </Breadcrumbs>
      <div className="flex gap-2">
        <div className="flex gap-2 mr-2">
          <ButtonGroup>
            {submission.data?.exists && (
              <Button
                loading={submission.isPending}
                size="small"
                variant="outlined"
                onClick={loadLastSubmission}
                endIcon={<SkipPreviousIcon fontSize="small" />}
              >
                Load
              </Button>
            )}
            <Button
              loading={setSubmissionPending}
              size="small"
              variant="outlined"
              onClick={handleSave}
              endIcon={<SaveIcon fontSize="small" />}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleReset}
              endIcon={<SettingsBackupRestoreIcon fontSize="small" />}
            >
              Reset
            </Button>

            {submission.data?.exists && (
              <Button
                loading={deleteSubmissionPending}
                size="small"
                onClick={handleDelete}
                variant="outlined"
                color="error"
                endIcon={<DeleteIcon fontSize="small" />}
              >
                Delete
              </Button>
            )}
          </ButtonGroup>
        </div>

        <Button
          variant="outlined"
          onClick={setCompleted}
          endIcon={
            isCompleted ? (
              <CheckCircleIcon color="success" fontSize="small" />
            ) : (
              <CheckCircleOutlineIcon fontSize="small" />
            )
          }
          size="small"
        >
          Mark as Completed
        </Button>
      </div>
    </div>
  );
};

const Problem = ({ id }: { id: string }) => {
  const problem = useGetProblem(id);

  const codeEditorRef = useRef<ICodeEditorRef>(null);

  const submission = useGetSubmission(problem.data?.id!, {
    enabled: !!problem.data?.id,
  });

  const notifications = useNotifications();

  const loadLastSubmission = useCallback(() => {
    if (submission.data?.exists) {
      codeEditorRef.current?.updateFiles(submission.data.data);
      notifications.show("Last submission loaded", { severity: "info" });
    }
  }, [submission.data, codeEditorRef, notifications]);

  const handleEditorInitialized = useCallback(() => {
    loadLastSubmission();
  }, [loadLastSubmission]);

  if (problem.isPending) {
    return <CircularProgress size={"small"} />;
  }

  if (problem.error) {
    return <Alert severity={"error"}>{problem.error.message}</Alert>;
  }

  if (!problem.data) throw new Error("Problem data must be defined here!");

  const files = problem.data.files.reduce<Record<string, string>>(
    (acc, file) => {
      acc[file.name] = file.content;
      return acc;
    },
    {}
  );

  return (
    <SandpackProvider
      className="!h-full"
      theme={"auto"}
      template="vanilla"
      files={files}
    >
      <div className="flex flex-col h-full">
        <ProblemHeader
          problem={problem.data}
          codeEditorRef={codeEditorRef}
          submission={submission}
          loadLastSubmission={loadLastSubmission}
        />
        <PanelGroup direction="horizontal">
          <Panel defaultSize={30}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={60}>
                <ProblemDescription className="pr-2" problem={problem.data} />
              </Panel>
              <PanelResizeHandle
                className="h-[2px]"
                hitAreaMargins={{ coarse: 25, fine: 15 }}
              />
              <Panel
                className="border-t"
                style={{
                  borderColor: "var(--sp-colors-surface2)",
                }}
              >
                <SandpackTests watchMode={false} className="h-full" verbose />
              </Panel>
            </PanelGroup>
          </Panel>
          <PanelResizeHandle
            className="w-[2px]"
            hitAreaMargins={{ coarse: 25, fine: 15 }}
          />
          <Panel defaultSize={50} className="h-full">
            <SandpackLayout className="h-full flex flex-col">
              <CodeEditor
                ref={codeEditorRef}
                initialFiles={files}
                onInitialized={handleEditorInitialized}
              />
            </SandpackLayout>
          </Panel>
        </PanelGroup>
      </div>
    </SandpackProvider>
  );
};

export const ProblemPage = () => {
  const { problemId } = useParams<{ problemId: string }>();

  if (problemId === undefined)
    throw new Error("problemId cannot be undefined!");

  return <Problem id={problemId} />;
};
