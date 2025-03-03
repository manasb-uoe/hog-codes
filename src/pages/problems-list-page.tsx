import CodeIcon from "@mui/icons-material/Code";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import {
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { Link, useParams } from "react-router";
import { useAuthContext } from "../auth/auth-context";
import { DifficultyChip } from "../components/difficulty-chip";
import { TagChip } from "../components/tag-chip";
import { useGetProblems } from "../store/problems";
import { IProblem, IProblemCategory } from "../types";

const Problem = ({
  problem,
  isCompleted,
}: {
  problem: IProblem;
  isCompleted: boolean;
}) => {
  return (
    <ListItem classes={{ root: "!py-0 !px-2" }}>
      <ListItemIcon classes={{ root: "!min-w-[40px]" }}>
        {isCompleted ? (
          <DoneAllIcon color="success" fontSize="small" />
        ) : (
          <CodeIcon fontSize="small" />
        )}
      </ListItemIcon>
      <ListItemText>
        <div className="flex gap-2">
          <Link to={problem.id}>
            <Typography variant="body1">{problem.title}</Typography>
          </Link>
          {problem.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
          <DifficultyChip difficulty={problem.difficulty} />
        </div>
      </ListItemText>
    </ListItem>
  );
};

export const ProblemsListPage = () => {
  const { category } = useParams<{ category: IProblemCategory }>();
  const { user } = useAuthContext();

  if (!category) throw new Error("Category cannot be undefined!");

  const problems = useGetProblems(category);

  if (problems.isPending) {
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
      <Typography variant={"h5"}>
        {category} Problems ({problems.data.length})
      </Typography>
      <List>
        {problems.data?.map((problem) => (
          <Problem
            problem={problem}
            key={problem.id}
            isCompleted={user.completions[problem.id] === true}
          />
        ))}
      </List>
    </div>
  );
};
