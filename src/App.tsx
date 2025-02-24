import { AccountCircle } from "@mui/icons-material";
import SavingsIcon from "@mui/icons-material/Savings";
import {
  AppBar,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { useCallback } from "react";
import { Link, Route, Routes } from "react-router";
import { useAuthContext } from "./auth/auth-context";
import { Home } from "./home";
import { ProblemsList } from "./problems-list";

function App() {
  const authContext = useAuthContext();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleUserMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  return (
    <div className="flex flex-col">
      <AppBar position="sticky">
        <Toolbar variant="dense">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <SavingsIcon />
          </IconButton>
          <Link to="/" className="flex-grow-1">
            <Typography variant="h6" color="inherit" component="div">
              Hog Codes
            </Typography>
          </Link>
          <div>
            <IconButton
              size="small"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              marginThreshold={40}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleUserMenuClose}
            >
              <MenuItem dense onClick={authContext.logout}>
                Logout
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <div className="flex-grow p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/problems/:category" element={<ProblemsList />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
