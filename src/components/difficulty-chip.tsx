import { Chip } from "@mui/material";
import { TProblemDifficulty } from "../store/problems";

export const DifficultyChip = ({
  difficulty,
}: {
  difficulty: TProblemDifficulty;
}) => {
  return (
    <Chip
      size="small"
      variant="filled"
      color={
        difficulty === "easy"
          ? "success"
          : difficulty === "medium"
          ? "warning"
          : "error"
      }
      label={difficulty}
    />
  );
};
