import { CircularProgress } from "@mui/material";
import {
  Auth,
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signOut,
  User,
} from "firebase/auth";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { isAdmin } from "../store/admins";
import { useDbContext } from "../store/db-context";
import { IUser, useUser } from "../store/users";
import { LoginForm } from "./login-form";

type IAuthContext = {
  user: IUser;
  logout: () => Promise<void>;
  isAdmin: boolean;
};
const AuthContext = React.createContext<IAuthContext>({} as IAuthContext);

export const useAuthContext = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({
  auth,
  children,
}: React.PropsWithChildren<{ auth: Auth }>) => {
  const [userId, setUserId] = useState<string>();
  const [admin, setAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const db = useDbContext();

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence);
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User logged in:", user.uid);

        setAdmin(await isAdmin(db, user.uid));
        setUserId(user.uid);
        setLoading(false);
      } else {
        setShowLogin(true);
        setLoading(false);
      }
    });
  }, [auth, db]);

  const user = useUser(userId);

  const logout = useCallback(async () => {
    return await signOut(auth);
  }, [auth]);

  const onLoginSuccess = useCallback((user: User) => {
    setUserId(user.uid);
    setShowLogin(false);
  }, []);

  if (loading || user.isPending) {
    return (
      <div className="flex items-center justify-center h-full">
        <CircularProgress />
      </div>
    );
  }

  if (showLogin) {
    return <LoginForm auth={auth} onSuccess={onLoginSuccess} />;
  }

  return (
    <AuthContext.Provider value={{ user: user.data!, logout, isAdmin: admin }}>
      {children}
    </AuthContext.Provider>
  );
};
