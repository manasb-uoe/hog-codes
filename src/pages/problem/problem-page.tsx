import {
  SandpackLayout,
  SandpackProvider,
  SandpackTests,
} from "@codesandbox/sandpack-react";
import { Alert, CircularProgress, Typography } from "@mui/material";
import classNames from "classnames";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useParams } from "react-router";
import { DifficultyChip } from "../../components/difficulty-chip";
import { TagChip } from "../../components/tag-chip";
import { useGetProblem } from "../../store/use-get-problem";
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

const Problem = ({ id }: { id: string }) => {
  const problem = useGetProblem(id);

  if (problem.loading) {
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
    <SandpackProvider theme={"auto"} template="vanilla" files={files}>
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
            style={{ height: "calc(100vh - 78px)" }}
          >
            <CodeEditor />
          </SandpackLayout>
        </Panel>
      </PanelGroup>
    </SandpackProvider>
  );
};

export const ProblemPage = () => {
  const { problemId } = useParams<{ problemId: string }>();

  if (problemId === undefined)
    throw new Error("problemId cannot be undefined!");

  return <Problem id={problemId} />;
};
