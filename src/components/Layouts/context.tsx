"use client";

import { createContext, useContext, useState } from "react";
import { Session } from "@supabase/supabase-js";

import { PopupToExtensionEvent } from "@/config/eventTypes";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMessenger } from "@/components/useMessenger";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";


type PageState = "expanded" | "collapsed";
type ContextType = {
  state: PageState;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
  session: Session | null;
};

const Context = createContext<ContextType | null>(null);

export function useAppContext() {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useAppContext must be used within a ContextProvider");
  }
  return context;
}

export function ContextProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isMobile = useIsMobile();
  const [session, setSession] = useState<Session | null>(null);
  const { sendMessage } = useMessenger();

  useSupabaseSession((event, session) => {
    console.log("Auth event:", event, "Session:", session);
    setSession(session);
    if (session) {
      sendMessage(PopupToExtensionEvent.USER_LOGIN, session);
    } else {
      sendMessage(PopupToExtensionEvent.USER_LOGOUT, session);
    }
  });

  function toggleSidebar() {
    setIsOpen((prev) => !prev);
  }

  return (
    <Context.Provider
      value={{
        state: isOpen ? "expanded" : "collapsed",
        isOpen,
        setIsOpen,
        isMobile,
        toggleSidebar,
        session,
      }}
    >
      {children}
    </Context.Provider>
  );
}