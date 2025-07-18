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
                // Constants (must match ThemeProvider.tsx)
                const THEME_COOKIE_NAME = 'ui-theme';
                const COOKIE_EXPIRY_DAYS = 365;
                const MILLISECONDS_PER_DAY = 864e5;
                const DARK_MODE_MEDIA_QUERY = '(prefers-color-scheme: dark)';
                const THEME_CLASSES = { LIGHT: 'light', DARK: 'dark' };
                
                // Get theme from cookie
                let theme = document.cookie.match(new RegExp('(^| )' + THEME_COOKIE_NAME + '=([^;]+)'))?.[2];
                
                let resolvedTheme;
                let root = document.documentElement;
                
                // Clear any existing theme classes
                root.classList.remove(THEME_CLASSES.LIGHT, THEME_CLASSES.DARK);
                
                if (!theme) {
                  // First visit - store as system theme
                  resolvedTheme = window.matchMedia(DARK_MODE_MEDIA_QUERY).matches ? THEME_CLASSES.DARK : THEME_CLASSES.LIGHT;
                  
                  // Set cookie with system preference
                  const expires = new Date(Date.now() + COOKIE_EXPIRY_DAYS * MILLISECONDS_PER_DAY).toUTCString();
                  document.cookie = THEME_COOKIE_NAME + '=system; expires=' + expires + '; path=/; SameSite=Lax';
                } else if (theme === 'system') {
                  resolvedTheme = window.matchMedia(DARK_MODE_MEDIA_QUERY).matches ? THEME_CLASSES.DARK : THEME_CLASSES.LIGHT;
                } else {
                  resolvedTheme = theme;
                }
                
                root.classList.add(resolvedTheme);
                
                // Set body background immediately to prevent flash
                const body = document.body;
                if (resolvedTheme === THEME_CLASSES.DARK) {
                  body.style.backgroundColor = '#111827'; // gray-900
                  body.style.color = '#ffffff';
                } else {
                  body.style.backgroundColor = '#ffffff';
                  body.style.color = '#000000';
                }
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
