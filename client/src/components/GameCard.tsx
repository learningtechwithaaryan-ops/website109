import { Game } from "@shared/schema";
import { motion } from "framer-motion";
import { Download, Trash2, Edit, ArrowUp, ArrowDown, Youtube } from "lucide-react";
import { NeonButton } from "./NeonButton";
import { forwardRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { EditGameDialog } from "./EditGameDialog";

interface GameCardProps {
  game: Game;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const GameCard = forwardRef<HTMLDivElement, GameCardProps>(({ game, onMoveUp, onMoveDown }, ref) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showTorrentNote, setShowTorrentNote] = useState(false);

  const handleDownload = () => {
    window.open(game.downloadUrl, "_blank");
  };

  const deleteGame = useMutation({
    mutationFn: async () => {
      const url = buildUrl(api.games.get.path, { id: game.id });
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete game");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.games.list.path] });
      toast({
        title: "Deleted",
        description: `${game.title} removed from catalog`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${game.title}?`)) {
      deleteGame.mutate();
    }
  };

  return (
    <>
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -5 }}
        className="group relative flex flex-col glass-panel rounded-lg overflow-hidden transition-all duration-300 hover:border-fuchsia-500/50 hover:shadow-[0_0_30px_rgba(255,0,255,0.15)]"
      >
        {/* Image Container with Overlay */}
        <div className="relative aspect-video overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
          <div className="absolute inset-0 bg-fuchsia-500/0 group-hover:bg-fuchsia-500/10 transition-colors duration-300 z-10" />
          
          {/* Dynamic Image or Fallback */}
          <img
            src={game.imageUrl}
            alt={game.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              // Fallback for broken images
              e.currentTarget.src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop";
            }}
          />
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3 z-20">
            <span className="px-2 py-1 text-xs font-bold bg-black/60 border border-fuchsia-500/30 text-fuchsia-300 rounded backdrop-blur-md uppercase tracking-wider">
              {game.category}
            </span>
          </div>

          {/* Admin Actions Overlay */}
          {user?.isAdmin && (
            <div className="absolute top-3 right-3 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {onMoveUp && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                  className="p-2 bg-black/60 border border-white/30 text-white rounded-lg hover:bg-white/20 backdrop-blur-md"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              )}
              {onMoveDown && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                  className="p-2 bg-black/60 border border-white/30 text-white rounded-lg hover:bg-white/20 backdrop-blur-md"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); setIsEditDialogOpen(true); }}
                className="p-2 bg-black/60 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/20 backdrop-blur-md"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                disabled={deleteGame.isPending}
                className="p-2 bg-black/60 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 backdrop-blur-md"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-grow p-4 space-y-3">
          <div>
            <h3 className="text-xl font-orbitron font-bold text-white group-hover:text-fuchsia-400 transition-colors truncate">
              {game.title}
            </h3>
            {game.developer && (
              <p className="text-sm text-zinc-500 font-mono mt-1">
                From: <span className="text-zinc-400">{game.developer}</span>
              </p>
            )}
          </div>

          {game.description && (
            <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
              {game.description}
            </p>
          )}

          <div className="mt-auto pt-4 flex flex-col gap-3">
            <div className="flex gap-2">
              {game.youtubeUrl && (
                <NeonButton 
                  onClick={() => window.open(game.youtubeUrl!, "_blank")} 
                  variant="outline" 
                  className="flex-1 flex items-center justify-center gap-2 text-sm py-2 border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <Youtube className="w-4 h-4" />
                  <span>Trailer</span>
                </NeonButton>
              )}
            </div>
            <NeonButton 
              onClick={handleDownload} 
              variant="pink" 
              className="w-full flex items-center justify-center gap-2 text-sm py-2.5"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </NeonButton>
          </div>
        </div>
        
        {/* Decorative Corner */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-fuchsia-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </motion.div>

      <EditGameDialog 
        game={game} 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
      />
    </>
  );
});

GameCard.displayName = "GameCard";
