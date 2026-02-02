import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGameSchema, type Game } from "@shared/schema";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const updateGameSchema = z.object({
  title: z.string().min(1, "Title is required"),
  imageUrl: z.string().url("Valid image URL is required"),
  downloadUrl: z.string().url("Valid download URL is required"),
  category: z.string().min(1, "Category is required"),
  developer: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  youtubeUrl: z.string().url("Valid YouTube URL is required").optional().nullable().or(z.literal("")),
});

type FormValues = z.infer<typeof updateGameSchema>;

interface EditGameDialogProps {
  game: Game;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditGameDialog({ game, open, onOpenChange }: EditGameDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(updateGameSchema),
    defaultValues: {
      title: game.title,
      imageUrl: game.imageUrl,
      downloadUrl: game.downloadUrl,
      category: game.category,
      developer: game.developer || "",
      description: game.description || "",
    },
  });

  const updateGame = useMutation({
    mutationFn: async (data: FormValues) => {
      const url = buildUrl(api.games.update.path, { id: game.id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update game");
      return res.json();
    },
    onSuccess: () => {
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: [api.games.list.path] });
      toast({
        title: "Success",
        description: "Game updated successfully",
        className: "bg-zinc-900 border-fuchsia-500 text-white",
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

  const onSubmit = (data: FormValues) => {
    updateGame.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950/95 backdrop-blur-xl border-zinc-800 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-orbitron text-fuchsia-500">Edit Game</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Modify game details.
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
                    <Input {...field} className="bg-zinc-900 border-zinc-800 focus:border-fuchsia-500 transition-colors" />
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
                          <SelectValue />
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
                      <Input {...field} value={field.value || ''} className="bg-zinc-900 border-zinc-800 focus:border-fuchsia-500" />
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
                    <Input {...field} className="bg-zinc-900 border-zinc-800 focus:border-fuchsia-500" />
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
                    <Input {...field} className="bg-zinc-900 border-zinc-800 focus:border-fuchsia-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Description</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} className="bg-zinc-900 border-zinc-800 focus:border-fuchsia-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-end gap-3">
              <NeonButton type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </NeonButton>
              <NeonButton type="submit" variant="pink" disabled={updateGame.isPending}>
                {updateGame.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </NeonButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
