import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { WelcomeScreen } from "@/components/WelcomeScreen";

export function WelcomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleContinue = () => {
    sessionStorage.setItem("mana_angadi_welcome_seen", "1");
    navigate(user ? "/login/success" : "/login");
  };

  return <WelcomeScreen onStart={handleContinue} />;
}
