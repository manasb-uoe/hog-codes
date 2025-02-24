import {
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { Link } from "react-router";
import { problemCategories } from "./types";

export const Home = () => {
  return (
    <div>
      <Typography variant="h5">Problem Categories</Typography>
      <List dense>
        {problemCategories.map((category) => (
          <Link key={category} to={`/problems/${category}`}>
            <ListItemButton>
              <ListItem>
                <ListItemIcon>
                  <Avatar>{category[0]}</Avatar>
                </ListItemIcon>
                <ListItemText>
                  <Typography variant="h6">{category}</Typography>
                </ListItemText>
              </ListItem>
            </ListItemButton>
          </Link>
        ))}
      </List>
    </div>
  );
};
