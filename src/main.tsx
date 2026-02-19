import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "@/context/AuthContext";

// Create queryClient at root level so we can pass its clear function to AuthProvider
const queryClient = new QueryClient();

function Root() {
  const handleSignOut = () => {
    // Clear all React Query caches to prevent stale role/data bleed between users
    queryClient.clear();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider onSignOut={handleSignOut}>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
