import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginPage } from "./LoginPage";
import { useAuth } from "@/context/AuthContext";
import { postAuthRedirect } from "@/context/auth/postAuthRedirect";
 import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
   const { user, role, isLoading, authError } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (user && !role) {
      navigate("/choose-role", { replace: true });
    } else if (user && role) {
      postAuthRedirect().then(({ route }) => {
        navigate(route, { replace: true });
      });
    }
  }, [isLoading, user, role, navigate]);

   // Show loading state while auth is initializing
   if (isLoading) {
     return (
       <div className="mobile-container min-h-screen flex items-center justify-center bg-background">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
     );
   }
 
   // Show loading state when authenticated user is about to be redirected
   if (user) {
     return (
       <div className="mobile-container min-h-screen flex items-center justify-center bg-background">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
     );
   }
 
   // Only render LoginPage when user is NOT authenticated
  return <LoginPage />;
};

export default Index;

