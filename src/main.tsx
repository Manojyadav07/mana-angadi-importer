import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "@/context/AuthContext";

const queryClient = new QueryClient();

function Root() {
  const handleSignOut = () => {
    queryClient.clear();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider onSignOut={handleSignOut}>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
