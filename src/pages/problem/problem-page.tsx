import {
  SandpackLayout,
  SandpackProvider,
  SandpackTests,
} from "@codesandbox/sandpack-react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import {
  Alert,
  Breadcrumbs,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import classNames from "classnames";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Link, useParams } from "react-router";
import { DifficultyChip } from "../../components/difficulty-chip";
import { TagChip } from "../../components/tag-chip";
import {
  useGetProblem,
  useGetProblemCompletion,
  useSetProblemCompletion,
} from "../../store/problems";
import { IProblem } from "../../types";
import { CodeEditor } from "./code-editor";
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

const ProblemHeader = ({ problem }: { problem: IProblem }) => {
  const completion = useGetProblemCompletion(problem.id);
  const { mutate: mutateCompletion } = useSetProblemCompletion(problem.id);

  return (
    <div className="flex justify-between items-center mb-2">
      <Breadcrumbs>
        <Link to={`/problems/${[problem.category]}`}>
          <Typography variant="body2">{problem.category} Problems</Typography>
        </Link>
        <Typography variant="body2">{problem.title}</Typography>
      </Breadcrumbs>
      <div className="flex">
        <Button
          variant="outlined"
          onClick={() => mutateCompletion(!completion.data)}
          endIcon={
            completion.data ? (
              <CheckCircleIcon color="success" fontSize="small" />
            ) : (
              <CheckCircleOutlineIcon fontSize="small" />
            )
          }
          loading={completion.isPending}
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
    <div className="flex flex-col h-full">
      <ProblemHeader problem={problem.data} />
      <SandpackProvider
        className="!h-full"
        theme={"auto"}
        template="vanilla"
        files={files}
      >
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
              <Panel>
                <SandpackTests
                  className="h-full"
                  onComplete={(specs) => console.log(specs)}
                />
              </Panel>
            </PanelGroup>
          </Panel>
          <PanelResizeHandle
            className="w-[2px]"
            hitAreaMargins={{ coarse: 25, fine: 15 }}
          />
          <Panel defaultSize={50} className="h-full">
            <SandpackLayout
              className="h-full flex flex-col"
              // style={{ height: "calc(100vh - 78px)" }}
            >
              <CodeEditor />
            </SandpackLayout>
          </Panel>
        </PanelGroup>
      </SandpackProvider>
    </div>
  );
};

export const ProblemPage = () => {
  const { problemId } = useParams<{ problemId: string }>();

  if (problemId === undefined)
    throw new Error("problemId cannot be undefined!");

  return <Problem id={problemId} />;
};
