import React, { createContext, useContext, useEffect, useState } from "react";

// Generate a unique session ID
function generateSessionId(): string {
  return crypto.randomUUID();
}

interface SessionContextType {
  sessionId: string;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionId] = useState(() => generateSessionId());

  return (
    <SessionContext.Provider value={{ sessionId }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}