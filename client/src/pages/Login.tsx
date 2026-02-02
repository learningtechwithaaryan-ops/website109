import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { NeonButton } from "@/components/NeonButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
        setLocation("/");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-zinc-950/50 border-zinc-800 backdrop-blur-xl shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden">
          <CardHeader className="text-center space-y-4 pt-8">
            <div className="mx-auto w-16 h-16 rounded-xl border border-white/10 bg-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] overflow-hidden">
              <img
                src="https://cdn.discordapp.com/icons/1428026856917045310/a_f47c020eef6737ce6946cb2bc152f533.gif?size=2048"
                alt="Warden Games Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-4xl font-orbitron font-bold tracking-tighter text-white">
                WARDEN<span className="text-fuchsia-500"> GAMES</span>
              </CardTitle>
              <p className="text-zinc-500 font-medium">Login to continue</p>
            </div>
          </CardHeader>
          <CardContent className="pb-8 px-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-400 font-bold uppercase tracking-wider text-xs">Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          placeholder="Enter your email" 
                          className="bg-zinc-900/50 border-zinc-800 h-12 focus:border-fuchsia-500 transition-all text-white placeholder:text-zinc-600"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-400 font-bold uppercase tracking-wider text-xs">Password</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password"
                          placeholder="Enter your password" 
                          className="bg-zinc-900/50 border-zinc-800 h-12 focus:border-fuchsia-500 transition-all text-white placeholder:text-zinc-600"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <NeonButton 
                  type="submit" 
                  variant="pink" 
                  className="w-full h-12 text-lg font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(236,72,153,0.3)]"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "LOGIN"}
                </NeonButton>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
