/// <reference types="vite/client" />
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import * as React from "react";
import type { QueryClient } from "@tanstack/react-query";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import appCss from "~/styles/app.css?url";
import { seo } from "~/utils/seo";
import { authClient } from "~/lib/auth-client";
import { ThemeProvider } from "~/components/ThemeProvider";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { Toaster } from "sonner";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title:
          "TanStack Start | Type-Safe, Client-First, Full-Stack React Framework",
        description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { data: sessionData } = authClient.useSession();

  // Transform the session data to match the Header's expected Session type
  const session = sessionData
    ? {
        ...sessionData.session,
        user: sessionData.user,
      }
    : null;

  return (
    <html suppressHydrationWarning>
      <head>
        <HeadContent />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Get theme from cookie first, then localStorage
                let theme = document.cookie.match(/ui-theme=([^;]+)/)?.[1];
                
                if (!theme) {
                  try {
                    theme = localStorage.getItem('vite-ui-theme');
                  } catch (e) {
                    // localStorage might not be available
                  }
                }
                
                let resolvedTheme;
                let root = document.documentElement;
                
                // Clear any existing theme classes
                root.classList.remove('light', 'dark');
                
                if (!theme) {
                  // First visit - store as system theme
                  resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  
                  // Store as system preference
                  try {
                    localStorage.setItem('vite-ui-theme', 'system');
                  } catch (e) {
                    // localStorage might not be available
                  }
                  
                  // Set cookie for SSR
                  const expires = new Date(Date.now() + 365 * 864e5).toUTCString();
                  document.cookie = 'ui-theme=system; expires=' + expires + '; path=/; SameSite=Lax';
                } else if (theme === 'system') {
                  resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                } else {
                  resolvedTheme = theme;
                }
                
                root.classList.add(resolvedTheme);
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen">
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <Toaster />
          <Header session={session} />
          {children}
          <Footer />
          <TanStackRouterDevtools position="bottom-right" />
          <ReactQueryDevtools buttonPosition="bottom-left" />
          <Scripts />
        </ThemeProvider>
      </body>
    </html>
  );
}
