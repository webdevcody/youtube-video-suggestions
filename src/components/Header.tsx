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

export function Header({ session }: { session: Session | null }) {
  return (
    <div className="border-b-2 border-gray-100 dark:border-gray-900">
      <div className="items-center container mx-auto p-2 flex gap-2 text-lg justify-between">
        <div>Video Suggestions</div>

        <div className="flex gap-4">
          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar>
                  <AvatarImage src={session?.user.image} />
                  <AvatarFallback>{session?.user.name}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => authClient.signOut()}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {!session && (
            <button
              onClick={() =>
                authClient.signIn.social({
                  provider: "google",
                })
              }
            >
              Sign In
            </button>
          )}
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
