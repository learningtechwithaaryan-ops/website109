import { useState } from "react";
import { useLocation } from "wouter";
import { useGames } from "@/hooks/use-games";
import { GameCard } from "@/components/GameCard";
import { NeonButton } from "@/components/NeonButton";
import { AddGameDialog } from "@/components/AddGameDialog";
import { Search, Monitor, Smartphone, Cpu, LogIn, LogOut, ArrowUp, ArrowDown, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CATEGORIES = [
  { id: "All", label: "All Games", icon: Monitor },
  { id: "PC", label: "PC Games", icon: Monitor },
  { id: "Android", label: "Android", icon: Smartphone },
  { id: "Programs", label: "Programs", icon: Cpu },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const auth = useAuth();
  const { user, isAuthenticated, viewMode, setViewMode } = auth as any;
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const isAdmin = user?.isAdmin && viewMode === 'admin';
  
  const { data: games, isLoading, isError } = useGames({ 
    category: activeCategory,
    search: searchTerm 
  });

  const reorderMutation = useMutation({
    mutationFn: async (orders: { id: number; order: number }[]) => {
      const res = await fetch("/api/games/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to reorder");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
    }
  });

  const moveGame = (id: number, direction: 'up' | 'down') => {
    if (!games) return;
    const index = games.findIndex(g => g.id === id);
    if (index === -1) return;
    
    const newGames = [...games];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newGames.length) return;
    
    const temp = newGames[index];
    newGames[index] = newGames[targetIndex];
    newGames[targetIndex] = temp;
    
    const orders = newGames.map((g, i) => ({
      id: g.id,
      order: newGames.length - i
    }));
    
    reorderMutation.mutate(orders);
  };

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden relative">
      {/* Background GIF */}
      <div 
        className="fixed inset-0 z-[-1] pointer-events-none"
        style={{
          backgroundImage: `url('https://cdn.discordapp.com/attachments/1420020305069604915/1466449357061492877/warden-with-moving-horns-minecraft-zq7og6l1hgyo9doa.webp?ex=697cc8e4&is=697b7764&hm=49fabdd74fa8428df3054134e490f0cc29a33191c7978f068d258210f9e17496')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          opacity: 0.4
        }}
      />
      <div className="fixed inset-0 z-[-1] bg-black/60 pointer-events-none" />

      {/* Credit Note - Bottom Right */}
      <div className="fixed right-[16px] bottom-[16px] z-[60]">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="bg-fuchsia-600/20 border border-fuchsia-500/50 text-fuchsia-400 px-3 py-1.5 rounded-md font-orbitron text-[10px] font-bold tracking-widest hover:bg-fuchsia-600/30 transition-all backdrop-blur-md">
                CREDITS
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-black border border-fuchsia-500/50 text-fuchsia-400 font-orbitron text-xs">
              Credit: Created by Dcvault
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Mode Indicator Overlay */}
      {user?.isAdmin && (
        <div className={`fixed bottom-6 left-6 z-[60] px-4 py-2 rounded-full border backdrop-blur-md flex items-center gap-2 font-orbitron text-xs font-bold tracking-widest shadow-lg ${
          viewMode === 'admin' 
            ? "bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-400" 
            : "bg-zinc-500/20 border-zinc-500 text-zinc-400"
        }`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${viewMode === 'admin' ? "bg-fuchsia-500" : "bg-zinc-500"}`} />
          MODE: {viewMode.toUpperCase()}
        </div>
      )}

      {/* Header / Nav */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-md border border-white/10 bg-black flex items-center justify-center shadow-[0_0_12px_rgba(255,255,255,0.15)] overflow-hidden">
              <img
                src="https://cdn.discordapp.com/icons/1428026856917045310/a_f47c020eef6737ce6946cb2bc152f533.gif?size=2048"
                alt="Gamezone Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex flex-col">
              <h1 className="text-xl font-orbitron font-bold tracking-widest text-white leading-none">
                GAMEZONE
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {isAuthenticated ? (
               <div className="flex items-center gap-3">
                 {user?.isAdmin && (
                   <>
                     {viewMode === 'admin' ? (
                       <NeonButton 
                         variant="outline" 
                         size="sm" 
                         className="flex items-center gap-2 border-blue-500/50 text-blue-400"
                         onClick={() => setViewMode('user')}
                       >
                         Switch to Normal User View
                       </NeonButton>
                     ) : (
                       <NeonButton 
                         variant="pink" 
                         size="sm" 
                         className="flex items-center gap-2"
                         onClick={() => setViewMode('admin')}
                       >
                         Return to Admin Mode
                       </NeonButton>
                     )}
                     {isAdmin && (
                       <>
                         <AddGameDialog />
                         <NeonButton 
                           variant="outline" 
                           size="sm" 
                           className="flex items-center gap-2 border-red-500/50 text-red-400"
                           onClick={() => {
                             const email = prompt("Enter email of the admin to remove:");
                             if (email && confirm(`Are you sure you want to remove ${email}?`)) {
                               fetch("/api/admin/remove", {
                                 method: "POST",
                                 headers: { "Content-Type": "application/json" },
                                 body: JSON.stringify({ email }),
                               }).then(res => res.json()).then(data => alert(data.message));
                             }
                           }}
                         >
                           Remove Admin
                         </NeonButton>
                         <NeonButton 
                           variant="outline" 
                           size="sm" 
                           className="flex items-center gap-2 border-orange-500/50 text-orange-400"
                           onClick={() => {
                             const email = prompt("Enter email of the user to promote to admin:");
                             if (!email) return;
                             const password = prompt("Enter password for the new admin:");
                             if (!password) return;
                             
                             fetch("/api/admin/promote", {
                               method: "POST",
                               headers: { "Content-Type": "application/json" },
                               body: JSON.stringify({ email, password }),
                             }).then(res => res.json()).then(data => alert(data.message));
                           }}
                         >
                           Add Admin
                         </NeonButton>
                       </>
                     )}
                   </>
                 )}
                 <NeonButton 
                   variant="outline" 
                   size="sm" 
                   onClick={() => window.location.href = "/api/logout"}
                   className="flex items-center gap-2"
                 >
                   <LogOut className="w-4 h-4" />
                   Logout
                 </NeonButton>
               </div>
             ) : (
               <NeonButton 
                 variant="outline" 
                 size="sm" 
                 onClick={() => setLocation("/login")}
                 className="flex items-center gap-2"
               >
                 <LogIn className="w-4 h-4" />
                 Admin Login
               </NeonButton>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Torrent Note Info */}
        <div className="mb-8 p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-blue-400 font-bold font-orbitron text-sm tracking-wider">IMPORTANT NOTE</p>
              <p className="text-zinc-300 text-xs">Without a torrent client, games cannot be downloaded. Install a torrent downloader first. For Pc software</p>
            </div>
          </div>
          <NeonButton 
            variant="outline" 
            size="sm"
            onClick={() => window.open("https://transmissionbt.com/", "_blank")}
            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 shrink-0"
          >
            Get Transmission
          </NeonButton>
        </div>

        {/* Hero Section */}
        <div className="relative mb-12 rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden min-h-[300px] flex items-center justify-center">
          <img 
            src="https://cdn.discordapp.com/banners/1428660662602563626/a_02c09a06ee5a2fc600e81d9ddad8f4d4.gif?size=512" 
            alt="Warden Games"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          
          <div className="relative z-10 text-center space-y-4 px-8">
            <h2 className="text-5xl md:text-7xl font-orbitron font-bold tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
              WARDEN GAMES
            </h2>
          </div>
        </div>

        {/* Search Bar - Moved below Hero */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-white/20 rounded-lg blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
            <div className="relative flex items-center bg-black rounded-lg p-1 border border-white/10">
              <Search className="w-6 h-6 text-zinc-500 ml-3" />
              <Input 
                placeholder="Search games..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-none bg-transparent text-lg h-12 text-white placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`
                  relative px-6 py-3 rounded-lg flex items-center gap-2 font-orbitron font-bold tracking-wide transition-all duration-300
                  ${isActive 
                    ? "bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/50 shadow-[0_0_15px_rgba(255,0,255,0.2)]" 
                    : "bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-white"
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-fuchsia-400" : "text-zinc-500"}`} />
                {cat.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-fuchsia-500 shadow-[0_0_10px_#ff00ff]"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-zinc-900/30 h-80 rounded-lg animate-pulse border border-zinc-800" />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-20 text-red-500">
                Failed to load games. Please try again later.
              </div>
            ) : games?.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center">
                 <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-10 h-10 text-zinc-600" />
                 </div>
                 <h3 className="text-xl font-orbitron text-zinc-300">No games found</h3>
                 <p className="text-zinc-500 mt-2">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {games?.map((game: any, index: number) => (
                    <GameCard 
                      key={game.id} 
                      game={game} 
                      onMoveUp={index > 0 ? () => moveGame(game.id, 'up') : undefined}
                      onMoveDown={index < games.length - 1 ? () => moveGame(game.id, 'down') : undefined}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
