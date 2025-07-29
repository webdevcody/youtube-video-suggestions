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
    <div className="border-b-2 border-gray-100 dark:border-gray-900">
      <div className="items-center container mx-auto p-2 flex gap-2 text-lg justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/wdc.jpg"
            alt="WDC Feedback"
            className="h-10 rounded-full"
          />
          Web Dev Cody
        </Link>

        <div className="flex gap-4">
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar>
                  <AvatarImage src={image} />
                  <AvatarFallback>{name}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => authClient.signOut()}>
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
