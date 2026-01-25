import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginPage } from "./LoginPage";
import { useAuth } from "@/context/AuthContext";
import { postAuthRedirect } from "@/context/auth/postAuthRedirect";

const Index = () => {
  const navigate = useNavigate();
  const { user, role, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (user && role) {
      // Use postAuthRedirect for proper role-based routing with shop check
      postAuthRedirect().then(({ route }) => {
        navigate(route, { replace: true });
      });
    }
  }, [isLoading, user, role, navigate]);

  return <LoginPage />;
};

export default Index;

