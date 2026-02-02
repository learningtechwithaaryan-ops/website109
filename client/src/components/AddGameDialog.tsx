import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGameSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NeonButton } from "./NeonButton";
import { Plus, Loader2 } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

type FormValues = z.infer<typeof insertGameSchema>;

export function AddGameDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createGame = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create game");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(insertGameSchema),
    defaultValues: {
      title: "",
      imageUrl: "",
      downloadUrl: "",
      category: "PC",
      developer: "",
      description: "",
      youtubeUrl: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    // Ensure empty string is converted to null for optional field
    const formattedData = {
      ...data,
      youtubeUrl: data.youtubeUrl || null,
    };
    createGame.mutate(formattedData, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        toast({
          title: "Success",
          description: "Game added successfully",
          className: "bg-zinc-900 border-fuchsia-500 text-white",
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <NeonButton variant="orange" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Add Game</span>
        </NeonButton>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950/95 backdrop-blur-xl border-zinc-800 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-orbitron text-fuchsia-500">Add New Game</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Enter the game details below to add it to the library.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Title</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-zinc-900 border-zinc-800 focus:border-fuchsia-500 transition-colors" placeholder="Cyberpunk 2077" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:ring-fuchsia-500">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        <SelectItem value="PC">PC</SelectItem>
                        <SelectItem value="Android">Android</SelectItem>
                        <SelectItem value="Programs">Programs</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="developer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Developer (Opt)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} className="bg-zinc-900 border-zinc-800 focus:border-fuchsia-500" placeholder="CDPR" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Image URL</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-zinc-900 border-zinc-800 focus:border-fuchsia-500" placeholder="https://..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="downloadUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Download URL</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-zinc-900 border-zinc-800 focus:border-fuchsia-500" placeholder="magnet:?xt=..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="youtubeUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">YouTube Trailer URL (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} className="bg-zinc-900 border-zinc-800 focus:border-fuchsia-500" placeholder="https://youtube.com/watch?v=..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-end gap-3">
              <NeonButton type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </NeonButton>
              <NeonButton type="submit" variant="pink" disabled={createGame.isPending}>
                {createGame.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Game"
                )}
              </NeonButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
