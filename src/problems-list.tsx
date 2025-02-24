import CodeIcon from "@mui/icons-material/Code";
import {
  Alert,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { useParams } from "react-router";
import { useGetProblems } from "./store/use-get-problems";
import { IProblem, IProblemCategory } from "./types";

const Problem = ({ problem }: { problem: IProblem }) => {
  return (
    <ListItem>
      <ListItemIcon>
        <CodeIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>
        <div className="flex gap-2">
          <Typography variant="body1">{problem.title}</Typography>
          {problem.tags.map((tag) => (
            <Chip key={tag} variant="filled" size="small" label={tag} />
          ))}
          <Chip
            size="small"
            variant="filled"
            color={
              problem.difficulty === "easy"
                ? "success"
                : problem.difficulty === "medium"
                ? "warning"
                : "error"
            }
            label={problem.difficulty}
          />
        </div>
      </ListItemText>
    </ListItem>
  );
};

export const ProblemsList = () => {
  const { category } = useParams<{ category: IProblemCategory }>();

  if (!category) throw new Error("Category cannot be undefined!");

  const problems = useGetProblems(category);

  if (problems.loading) {
    return <CircularProgress size={"small"} />;
  }

  if (problems.error) {
    return <Alert severity={"error"}>{problems.error.message}</Alert>;
  }

  if (!problems.data?.length) {
    return (
      <Alert
        severity={"info"}
      >{`No problems with category=${category} found!`}</Alert>
    );
  }

  return (
    <div>
      <Typography variant={"h5"}>{category} Problems</Typography>
      <List>
        {problems.data?.map((problem) => (
          <Problem problem={problem} key={problem.id} />
        ))}
      </List>
    </div>
  );
};
