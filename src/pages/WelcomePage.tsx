import { useNavigate } from "react-router-dom";
import { WelcomeScreen } from "@/components/WelcomeScreen";

export function WelcomePage() {
  const navigate = useNavigate();
  return <WelcomeScreen onStart={() => navigate("/login")} />;
}
