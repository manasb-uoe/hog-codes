import { Chip } from "@mui/material";

export const TagChip = ({ tag }: { tag: string }) => {
  return <Chip size="small" variant="filled" label={tag} />;
};
