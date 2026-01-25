import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginPage } from "./LoginPage";
import { useAuth } from "@/context/AuthContext";
import { getRouteForRole } from "@/context/auth/authHelpers";

const Index = () => {
  const navigate = useNavigate();
  const { user, role, profile, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (user && role) {
      navigate(getRouteForRole(role, profile?.merchant_status));
    }
  }, [isLoading, user, role, profile?.merchant_status, navigate]);

  return <LoginPage />;
};

export default Index;

