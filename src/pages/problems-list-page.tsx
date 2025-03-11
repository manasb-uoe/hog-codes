import CodeIcon from "@mui/icons-material/Code";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import {
  Alert,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { capitalize } from "lodash-es";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { useAuthContext } from "../auth/auth-context";
import { DifficultyChip } from "../components/difficulty-chip";
import { TagChip } from "../components/tag-chip";
import {
  IProblem,
  IProblemCategory,
  TProblemDifficulty,
  useGetProblems,
} from "../store/problems";

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

type TDifficultyFilter = TProblemDifficulty | "all";

type TSolvedStatus = "all" | "solved" | "unsolved";

const solvedStatusFilterOptions: TSolvedStatus[] = [
  "all",
  "solved",
  "unsolved",
];

const difficultyFilterOptions: TDifficultyFilter[] = [
  "all",
  "easy",
  "medium",
  "hard",
];

export const ProblemsListPage = () => {
  const { category } = useParams<{ category: IProblemCategory }>();

  const { user } = useAuthContext();

  if (!category) throw new Error("Category cannot be undefined!");

  const problems = useGetProblems(category);

  const [searchParams, setSearchParams] = useSearchParams();

  const [difficultyFilter, setDifficultyFilter] = useState<TDifficultyFilter>(
    () => (searchParams.get("difficulty") as TDifficultyFilter) ?? "all"
  );

  const [solvedStatusFilter, setSolvedStatusFilter] = useState<TSolvedStatus>(
    () => (searchParams.get("solvedStatus") as TSolvedStatus) ?? "all"
  );

  useEffect(() => {
    const params: Record<string, string> = {};
    if (solvedStatusFilter !== "all") {
      params["solvedStatus"] = solvedStatusFilter;
    }
    if (difficultyFilter !== "all") {
      params["difficulty"] = difficultyFilter;
    }
    setSearchParams(params, { replace: true });
  }, [difficultyFilter, solvedStatusFilter, setSearchParams]);

  const navigate = useNavigate();

  const filteredProblems = useMemo(() => {
    return problems.data?.filter((p) => {
      if (difficultyFilter !== "all") {
        if (p.difficulty !== difficultyFilter) {
          return false;
        }
      }

      if (solvedStatusFilter !== "all") {
        const solved = p.id in user.completions;
        return solvedStatusFilter === "solved" ? solved : !solved;
      }

      return true;
    });
  }, [problems.data, difficultyFilter, user.completions, solvedStatusFilter]);

  const handleRandomClick = useCallback(() => {
    if (!filteredProblems) return;
    const randomProblem =
      filteredProblems[Math.floor(Math.random() * filteredProblems.length)];
    navigate(`/problems/${category}/${randomProblem.id}`);
  }, [filteredProblems, category, navigate]);

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
    <div className="flex flex-col gap-3">
      <Typography variant={"h5"}>
        {category} Problems ({problems.data.length})
      </Typography>
      <div className="flex gap-2">
        <Select
          size="small"
          value={difficultyFilter}
          renderValue={(value) => `Difficulty: ${capitalize(value)}`}
          style={{ height: 28 }}
          onChange={(e) =>
            setDifficultyFilter(e.target.value as TDifficultyFilter)
          }
        >
          {difficultyFilterOptions.map((difficulty) => (
            <MenuItem
              className="capitalize"
              value={difficulty}
              dense
              key={difficulty}
            >
              {difficulty}
            </MenuItem>
          ))}
        </Select>
        <Select
          size="small"
          value={solvedStatusFilter}
          renderValue={(value) => `Solved Status: ${capitalize(value)}`}
          style={{ height: 28 }}
          onChange={(e) =>
            setSolvedStatusFilter(e.target.value as TSolvedStatus)
          }
        >
          {solvedStatusFilterOptions.map((status) => (
            <MenuItem className="capitalize" value={status} dense key={status}>
              {status}
            </MenuItem>
          ))}
        </Select>
        <Button
          endIcon={<ShuffleIcon fontSize="small" />}
          size="small"
          variant="outlined"
          loading={problems.isPending}
          onClick={handleRandomClick}
        >
          Random
        </Button>
      </div>
      <div>
        {filteredProblems?.length ? (
          <List>
            {filteredProblems?.map((problem) => (
              <Problem
                problem={problem}
                key={problem.id}
                isCompleted={user.completions[problem.id] === true}
              />
            ))}
          </List>
        ) : (
          <Typography color="textSecondary" variant="body1">
            No problems found
          </Typography>
        )}
      </div>
    </div>
  );
};
