import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";
import { NeonButton } from "@/components/NeonButton";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="relative">
        <div className="absolute inset-0 bg-fuchsia-600/20 blur-[60px] rounded-full" />
        <AlertTriangle className="relative w-24 h-24 text-fuchsia-500 mb-8 mx-auto animate-pulse" />
      </div>
      
      <h1 className="text-6xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-amber-500 mb-4">
        404
      </h1>
      
      <p className="text-xl text-zinc-400 font-rajdhani mb-8 text-center max-w-md">
        System Malfunction. The requested sector does not exist or has been corrupted.
      </p>

      <Link href="/" className="inline-block">
        <NeonButton variant="pink" className="min-w-[200px]">
          Return to Base
        </NeonButton>
      </Link>
    </div>
  );
}
