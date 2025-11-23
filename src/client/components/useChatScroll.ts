import { useCallback, useEffect, useRef } from "react";

interface ScrollerArgs {
  viewport: HTMLElement; // scroll container that holds messages
  isUserMessage: (el: HTMLElement) => boolean; // e.g. el.getAttribute('data-message-role') === 'user'
  messageSelector: string; // e.g. "[data-message-id]"
}

interface Scroller {
  onNewUserMessage: () => void; // call when a user message is appended
  destroy: () => void;
  isFollowing: () => boolean;
  stopFollowing: () => void; // stop following mode (e.g., when user scrolls manually)
}

/**
 * Simple scroll controller that scrolls to bottom when following,
 * stops when user interacts, and resumes on next user message.
 */
function createScroller(args: ScrollerArgs): Scroller {
  const { viewport: vp, isUserMessage, messageSelector } = args;

  let following = true; // gates auto-scroll; only armed after a *new* user message arrives
  let programmatic = false; // suppresses "user interaction" handling during our own scrolls
  let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

  const scrollToBottom = () => {
    if (!following) {
      return;
    }

    // Throttle scroll calls
    if (scrollTimeout) {
      return;
    }

    scrollTimeout = setTimeout(() => {
      scrollTimeout = null;
      programmatic = true;
      vp.scrollTo({ top: vp.scrollHeight, behavior: "smooth" });

      // Reset flag after scroll completes
      requestAnimationFrame(() => {
        setTimeout(() => {
          programmatic = false;
        }, 100);
      });
    }, 50);
  };

  // Any real user input cancels auto-follow
  const onUserInteract = () => {
    if (programmatic) {
      return;
    }
    following = false;
  };

  // MutationObserver: we react to both node additions *and* characterData changes.
  // - childList: new messages appended
  // - characterData: streaming text updates within an existing assistant node
  const moCb = (muts: MutationRecord[]) => {
    let userAdded = false;
    let anyChanged = false;

    for (const m of muts) {
      if (m.type === "childList") {
        if (m.addedNodes.length > 0) {
          anyChanged = true;
        }
        m.addedNodes.forEach((n) => {
          if (n.nodeType !== 1) {
            return;
          }
          const el = n as HTMLElement;

          // We detect user messages anywhere in the added subtree to robustly handle wrappers.
          if (el.matches?.(messageSelector) && isUserMessage(el)) {
            userAdded = true;
          }
          el.querySelectorAll?.(messageSelector).forEach((child) => {
            if (isUserMessage(child as HTMLElement)) {
              userAdded = true;
            }
          });
        });
      } else if (m.type === "characterData") {
        anyChanged = true; // text grew/shrank in place (streaming)
      }
    }

    if (userAdded) {
      // A *new* user message arms follow so subsequent assistant output will scroll.
      following = true;
      scrollToBottom();
    } else if (anyChanged) {
      // During streaming/reflow, we only follow if already armed.
      if (following) {
        scrollToBottom();
      }
    }
  };

  const mo = new MutationObserver(moCb);

  // Init: jump to bottom
  requestAnimationFrame(() => {
    vp.scrollTop = vp.scrollHeight;
  });

  mo.observe(vp, { childList: true, characterData: true, subtree: true });

  // Input events that clearly indicate user intent to take over scrolling.
  // pointerdown covers mouse/touch/pen; wheel captures trackpad/mouse wheel.
  vp.addEventListener("wheel", onUserInteract, { passive: true });
  vp.addEventListener("pointerdown", onUserInteract);

  // Detect manual scrolling
  const onScroll = () => {
    if (programmatic) {
      return;
    }
    // Check if user scrolled up from bottom
    const scrollBottom = vp.scrollHeight - vp.scrollTop - vp.clientHeight;
    if (scrollBottom > 100) {
      following = false;
    }
  };

  vp.addEventListener("scroll", onScroll, { passive: true });

  return {
    onNewUserMessage() {
      // The pipeline tells us a user message arrived; we arm follow.
      following = true;
      scrollToBottom();
    },

    isFollowing() {
      return following;
    },

    stopFollowing() {
      following = false;
    },

    destroy() {
      // Clean teardown to avoid leaks and ghost listeners in hot-reload/dev.
      mo.disconnect();
      vp.removeEventListener("scroll", onScroll);
      vp.removeEventListener("wheel", onUserInteract);
      vp.removeEventListener("pointerdown", onUserInteract);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    },
  };
}

export function useChatScroll() {
  const ctrlRef = useRef<Scroller | null>(null);
  const nodeRef = useRef<HTMLElement | null>(null);

  const viewportRef = useCallback((node: HTMLElement | null) => {
    // Detach old node
    if (nodeRef.current && nodeRef.current !== node) {
      ctrlRef.current?.destroy();
      ctrlRef.current = null;
      nodeRef.current = null;
    }

    // Attach new node
    if (node && node !== nodeRef.current) {
      nodeRef.current = node;
      ctrlRef.current = createScroller({
        viewport: node,
        isUserMessage: (el) => el.getAttribute("data-message-role") === "user",
        messageSelector: "[data-message-id]",
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      ctrlRef.current?.destroy();
      ctrlRef.current = null;
      nodeRef.current = null;
    };
  }, []);

  return {
    viewportRef, // attach to the *scrollable* element
    onNewUserMessage() {
      // call when a user message arrives
      ctrlRef.current?.onNewUserMessage();
    },
    isFollowing() {
      return ctrlRef.current?.isFollowing() ?? false;
    },
    stopFollowing() {
      // stop following mode (e.g., when clicking scroll-to-bottom button)
      ctrlRef.current?.stopFollowing();
    },
  };
}
