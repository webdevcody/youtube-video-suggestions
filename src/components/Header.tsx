import { ModeToggle } from "~/components/ModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { authClient } from "~/lib/auth-client";
import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { Menu, Github } from "lucide-react";

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
    <div className="border-b border-border bg-background/98 backdrop-blur supports-[backdrop-filter]:bg-background/95">
      <div className="items-center container mx-auto px-4 md:px-6 py-4 flex gap-2 md:gap-4 text-lg justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-2 md:gap-8 flex-1 min-w-0">
          <Link to="/" className="flex items-center gap-2 md:gap-3 group">
            <div className="relative">
              <img
                src="/wdc.jpg"
                alt="WDC Feedback"
                className="h-10 w-10 md:h-12 md:w-12 rounded-xl ring-2 ring-border group-hover:ring-blue-500/50 transition-all duration-300"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gradient-primary-subtle/20 to-gradient-secondary-subtle/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-lg md:text-xl truncate gradient-text">
                Web Dev Cody
              </span>
              <span className="text-xs md:text-sm text-foreground/80 hidden sm:block">
                Video Ideas
              </span>
            </div>
          </Link>

          {/* Desktop navigation links */}
          <div className="hidden lg:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground/90 hover:text-foreground hover:bg-accent"
              asChild
            >
              <a href="https://webdevcody.com">webdevcody.com</a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground/90 hover:text-foreground hover:bg-accent"
              asChild
            >
              <a
                href="https://github.com/webdevcody/youtube-video-suggestions"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View source on GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="ring-2 ring-border hover:ring-blue-500/50 transition-all duration-300 cursor-pointer">
                  <AvatarImage src={image} />
                  <AvatarFallback className="bg-gradient-to-r from-gradient-primary to-gradient-secondary text-white">
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

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-2">
          <ModeToggle />

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground/90 hover:text-foreground hover:bg-accent"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-6 mt-8">
                <Button
                  variant="ghost"
                  className="justify-start h-auto text-lg px-3 py-2 text-foreground/90 hover:text-foreground hover:bg-accent"
                  asChild
                >
                  <a href="https://webdevcody.com">webdevcody.com</a>
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start h-auto text-lg px-3 py-2 text-foreground/90 hover:text-foreground hover:bg-accent"
                  asChild
                >
                  <a
                    href="https://github.com/webdevcody/youtube-video-suggestions"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-5 w-5" />
                    View on GitHub
                  </a>
                </Button>

                {isAuthenticated && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <Avatar className="ring-2 ring-border">
                        <AvatarImage src={image} />
                        <AvatarFallback className="bg-gradient-to-r from-gradient-primary to-gradient-secondary text-white">
                          {name}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground">
                        {name}
                      </span>
                    </div>
                    <Button
                      onClick={() => authClient.signOut()}
                      variant="outline"
                      className="w-full"
                    >
                      Sign Out
                    </Button>
                  </div>
                )}

                {!isAuthenticated && (
                  <Button
                    onClick={() =>
                      authClient.signIn.social({
                        provider: "google",
                      })
                    }
                    className="modern-button w-full"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
