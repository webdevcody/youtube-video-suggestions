import { ModeToggle } from "~/components/ModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import { Session } from "better-auth";
import { authClient } from "~/lib/auth-client";
import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";

export function Header({
  isAuthenticated,
  image,
  name,
}: {
  isAuthenticated: boolean;
  image: string;
  name: string;
}) {
  return (
    <div className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="items-center container mx-auto px-6 py-4 flex gap-4 text-lg justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src="/wdc.jpg"
                alt="WDC Feedback"
                className="h-12 w-12 rounded-xl ring-2 ring-border group-hover:ring-blue-500/50 transition-all duration-300"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl gradient-text">
                Web Dev Cody
              </span>
              <span className="text-sm text-muted-foreground">Video Ideas</span>
            </div>
          </Link>
          <a
            href="https://webdevcody.com"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 px-3 py-1 rounded-lg hover:bg-muted"
          >
            webdevcody.com
          </a>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="ring-2 ring-border hover:ring-blue-500/50 transition-all duration-300 cursor-pointer">
                  <AvatarImage src={image} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    {name}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => authClient.signOut()}
                  className="cursor-pointer"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {!isAuthenticated && (
            <Button
              onClick={() =>
                authClient.signIn.social({
                  provider: "google",
                })
              }
              className="modern-button"
            >
              Sign In
            </Button>
          )}
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
