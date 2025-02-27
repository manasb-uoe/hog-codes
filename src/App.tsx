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
import { Link, Navigate, Route, Routes } from "react-router";
import { useAuthContext } from "./auth/auth-context";
import { ProblemsListPage } from "./pages/problems-list-page";
import { problemCategories } from "./types";
import { ProblemPage } from "./pages/problem/problem-page";

function App() {
  const authContext = useAuthContext();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleUserMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <AppBar position="sticky">
        <Toolbar variant="dense">
          <div className="flex-grow-1 flex items-center">
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <SavingsIcon />
            </IconButton>
            <Link to="/">
              <Typography variant="h6" color="inherit" component="div">
                Hog Codes
              </Typography>
            </Link>
            <div className="ml-4 flex">
              {problemCategories.map((cat) => (
                <Link key={cat} to={`/problems/${cat}`}>
                  <MenuItem dense>
                    <Typography className="uppercase" fontSize={12}>
                      {cat}
                    </Typography>
                  </MenuItem>
                </Link>
              ))}
            </div>
          </div>
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
      <div className="flex-grow p-4 ">
        <Routes>
          <Route path="/problems/:category" element={<ProblemsListPage />} />
          <Route path="/problems/:category" element={<ProblemsListPage />} />
          <Route
            path="/problems/:category/:problemId"
            element={<ProblemPage />}
          />
          <Route path="*" element={<Navigate to="/problems/JavaScript" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
