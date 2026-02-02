import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type GameInput } from "@shared/routes";

// GET /api/games (with optional filters)
export function useGames(filters?: { category?: string; search?: string }) {
  const queryKey = ["/api/games", filters?.category, filters?.search];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Construct URL with query params
      const url = new URL(window.location.origin + api.games.list.path);
      if (filters?.category && filters.category !== 'All') {
        url.searchParams.append("category", filters.category);
      }
      if (filters?.search) {
        url.searchParams.append("search", filters.search);
      }

      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch games");
      return api.games.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/games/:id
export function useGame(id: number) {
  return useQuery({
    queryKey: [api.games.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.games.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch game");
      return api.games.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// POST /api/games
export function useCreateGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: GameInput) => {
      const res = await fetch(api.games.create.path, {
        method: api.games.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.games.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create game");
      }
      return api.games.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.games.list.path] });
    },
  });
}
