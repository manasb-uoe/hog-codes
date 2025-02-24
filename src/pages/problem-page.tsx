import { Alert, CircularProgress, Typography, useTheme } from "@mui/material";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useParams } from "react-router";
import { DifficultyChip } from "../components/difficulty-chip";
import { MarkdownRenderer } from "../components/markdown-renderer";
import { TagChip } from "../components/tag-chip";
import { useGetProblem } from "../store/use-get-problem";

const Problem = ({ id }: { id: string }) => {
  const problem = useGetProblem(id);
  const theme = useTheme();

  if (problem.loading) {
    return <CircularProgress size={"small"} />;
  }

  if (problem.error) {
    return <Alert severity={"error"}>{problem.error.message}</Alert>;
  }

  if (!problem.data) throw new Error("Problem data must be defined here!");

  return (
    <PanelGroup direction="horizontal">
      <Panel defaultSize={50}>
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
        className="w-1 mx-4"
        style={{ backgroundColor: theme.palette.divider }}
        hitAreaMargins={{ coarse: 25, fine: 15 }}
      />
      <Panel defaultSize={50}>Code panel goes here...</Panel>
    </PanelGroup>
  );
};

export const ProblemPage = () => {
  const { problemId } = useParams<{ problemId: string }>();

  if (problemId === undefined)
    throw new Error("problemId cannot be undefined!");

  return <Problem id={problemId} />;
};
