import CodeIcon from "@mui/icons-material/Code";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import {
  Alert,
  Button,
  CircularProgress,
  Container,
  Link,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useCallback, useMemo } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router";
import { useAuthContext } from "../auth/auth-context";
import { DifficultyChip } from "../components/difficulty-chip";
import { TagChip } from "../components/tag-chip";
import { useGetProblems } from "../store/problems";
import { IProblem, IProblemCategory } from "../types";

export const ProblemsListPage = () => {
  const { category } = useParams<{ category: IProblemCategory }>();
  const { user } = useAuthContext();

  const columns: GridColDef<IProblem>[] = useMemo(() => {
    return [
      {
        field: "status",
        headerName: "Status",
        cellClassName: "flex items-center",
        renderCell: (params) => {
          if (user.completions[params.row.id]) {
            return <DoneAllIcon color="success" fontSize="small" />;
          } else {
            return <CodeIcon fontSize="small" />;
          }
        },
      },
      {
        field: "title",
        headerName: "Title",
        flex: 1,
        cellClassName: "flex items-center",
        renderCell: (params) => {
          return (
            <Link underline="hover" component={"div"}>
              <RouterLink to={params.row.id}>
                <Typography
                  className="cursor-pointer"
                  variant="body1"
                  fontSize={16}
                  fontWeight={400}
                >
                  {params.value}
                </Typography>
              </RouterLink>
            </Link>
          );
        },
      },
      {
        field: "difficulty",
        headerName: "Difficulty",
        renderCell: (params) => <DifficultyChip difficulty={params.value} />,
      },
      {
        field: "tags",
        headerName: "Tags",
        renderCell: (params) => {
          return params.row.tags.map((tag) => <TagChip key={tag} tag={tag} />);
        },
      },
    ];
  }, [user.completions]);

  if (!category) throw new Error("Category cannot be undefined!");

  const problems = useGetProblems(category);

  const navigate = useNavigate();

  const handleRandomClick = useCallback(() => {
    if (!problems.data) return;
    const randomProblem =
      problems.data[Math.floor(Math.random() * problems.data.length)];
    navigate(`/problems/${category}/${randomProblem.id}`);
  }, [problems.data, category, navigate]);

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
    <Container maxWidth="lg">
      <div className="flex flex-row justify-between items-center">
        <Typography variant={"h5"}>{category} Problems</Typography>
        <div className="flex items-center gap-2">
          <Typography color="textSecondary" variant={"body2"}>
            {Object.keys(user.completions).length} / {problems.data.length}{" "}
            completed
          </Typography>
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
      </div>
      <div className="flex flex-column mt-3">
        <DataGrid
          initialState={{
            sorting: { sortModel: [{ field: "title", sort: "asc" }] },
          }}
          density="compact"
          rows={problems.data}
          columns={columns}
          disableRowSelectionOnClick
          disableMultipleRowSelection
          hideFooter
          disableColumnSelector
          rowSelection={false}
          sx={{
            "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
              outline: "none",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "inherit", // Or 'transparent' or whatever color you'd like
            },
          }}
        />
      </div>
    </Container>
  );
};
