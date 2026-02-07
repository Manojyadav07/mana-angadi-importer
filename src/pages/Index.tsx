import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { postAuthRedirect } from "@/context/auth/postAuthRedirect";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, role, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
    } else {
      postAuthRedirect().then(({ route }) => {
        navigate(route, { replace: true });
      });
    }
  }, [isLoading, user, role, navigate]);

  return (
    <div className="mobile-container min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
};

export default Index;
