import {
  FileTabs,
  SandpackLayout,
  SandpackProvider,
  SandpackStack,
  SandpackTests,
  useActiveCode,
  useSandpack,
} from "@codesandbox/sandpack-react";
import Editor from "@monaco-editor/react";
import { Alert, CircularProgress, Typography, useTheme } from "@mui/material";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useParams } from "react-router";
import { DifficultyChip } from "../components/difficulty-chip";
import { MarkdownRenderer } from "../components/markdown-renderer";
import { TagChip } from "../components/tag-chip";
import { useGetProblem } from "../store/use-get-problem";

function EditorWithTests() {
  const { code, updateCode } = useActiveCode();
  const { sandpack } = useSandpack();
  const theme = useTheme();

  return (
    <SandpackStack className="m-0 h-full">
      <FileTabs />
      <PanelGroup direction="vertical">
        <Panel defaultSize={60}>
          <Editor
            width="100%"
            language="javascript"
            theme={theme.palette.mode === "dark" ? "vs-dark" : "vs-light"}
            key={sandpack.activeFile}
            defaultValue={code}
            onChange={(value) => updateCode(value || "")}
          />
        </Panel>
        <PanelResizeHandle
          className="h-[1px]"
          hitAreaMargins={{ coarse: 25, fine: 15 }}
        />
        <Panel>
          <SandpackTests
            className="h-full"
            onComplete={(specs) => console.log(specs)}
          />
        </Panel>
      </PanelGroup>
    </SandpackStack>
  );
}

const Problem = ({ id }: { id: string }) => {
  const problem = useGetProblem(id);

  if (problem.loading) {
    return <CircularProgress size={"small"} />;
  }

  if (problem.error) {
    return <Alert severity={"error"}>{problem.error.message}</Alert>;
  }

  if (!problem.data) throw new Error("Problem data must be defined here!");

  return (
    <PanelGroup direction="horizontal">
      <Panel defaultSize={30}>
        <div className="flex flex-col gap-1">
          <Typography variant="h6">{problem.data?.title}</Typography>
          <div className="flex gap-2">
            <DifficultyChip difficulty={problem.data?.difficulty} />
            {problem.data.tags.map((tag) => (
              <TagChip key={tag} tag={tag} />
            ))}
          </div>
          <div className="my-4">
            <MarkdownRenderer children={problem.data.description} />
          </div>
        </div>
      </Panel>
      <PanelResizeHandle
        className="w-[2px] mx-4"
        hitAreaMargins={{ coarse: 25, fine: 15 }}
      />
      <Panel defaultSize={50} className="h-full">
        <SandpackProvider
          theme={"auto"}
          template="vanilla"
          files={problem.data.files.reduce<Record<string, string>>(
            (acc, file) => {
              acc[file.name] = file.content;
              return acc;
            },
            {}
          )}
        >
          <SandpackLayout
            className="h-full flex flex-col"
            style={{ height: "calc(100vh - 78px)" }}
          >
            <EditorWithTests />
          </SandpackLayout>
        </SandpackProvider>
      </Panel>
    </PanelGroup>
  );
};

export const ProblemPage = () => {
  const { problemId } = useParams<{ problemId: string }>();

  if (problemId === undefined)
    throw new Error("problemId cannot be undefined!");

  return <Problem id={problemId} />;
};
