import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProviders } from "./providers";
import { RouterProvider } from "./router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProviders>
        <RouterProvider />
      </AppProviders>
    </QueryClientProvider>
  );
}

