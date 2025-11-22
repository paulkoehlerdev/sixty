import { useComposedRefs } from "@radix-ui/react-compose-refs";
import { createComponentId, Scroll, Sheet } from "@silk-hq/components";
import type React from "react";
import { createContext, useContext, useRef } from "react";
import { cn } from "../../lib/utils";

const SheetWithDetentId = createComponentId();

type SheetWithDetentContextValue = {
  activeDetent: number | null;
  viewRef: React.RefObject<HTMLElement | null>;
};

const SheetWithDetentContext = createContext<SheetWithDetentContextValue | null>(null);

const useSheetWithDetentContextOptional = () => {
  return useContext(SheetWithDetentContext);
};

type SheetWithDetentRootProps = Omit<React.ComponentProps<typeof Sheet.Root>, "license">;
const SheetWithDetentRoot = (props: SheetWithDetentRootProps) => {
  const viewRef = useRef<HTMLElement | null>(null);

  return (
    <SheetWithDetentContext.Provider
      value={{
        activeDetent: props.activeDetent ?? null,
        viewRef,
      }}
    >
      <Sheet.Root license="commercial" componentId={props.componentId ?? SheetWithDetentId} {...props} />
    </SheetWithDetentContext.Provider>
  );
};

const SheetWithDetentView = ({ ref, className, ...props }: React.ComponentProps<typeof Sheet.View>) => {
  const context = useSheetWithDetentContextOptional();
  const fallbackRef = useRef<HTMLElement | null>(null);
  const viewRef = context?.viewRef ?? fallbackRef;
  const composedRef = useComposedRefs(viewRef, ref);

  return (
    <Sheet.View
      className={cn("top-0 z-10 min-h-[50px] min-w-[50px]", className)}
      style={{ bottom: "initial" }}
      inertOutside={false}
      ref={composedRef}
      {...props}
    />
  );
};

const SheetWithDetentBackdrop = (props: React.ComponentProps<typeof Sheet.Backdrop>) => {
  return <Sheet.Backdrop themeColorDimming="auto" {...props} />;
};

const SheetWithDetentContent = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof Sheet.Content>) => {
  return (
    <Sheet.Content className={cn("box-border overflow-hidden rounded-t-2xl bg-background", className)} {...props} />
  );
};

const SheetWithDetentHandle = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof Sheet.Handle>) => {
  const context = useSheetWithDetentContextOptional();

  // Only render if we have a SheetWithDetent context (which means we're inside a Sheet.Root)
  if (!context) {
    return null;
  }

  const activeDetent = context.activeDetent ?? null;
  const reachedLastDetent = activeDetent === 2;

  return (
    <Sheet.Handle
      className={cn(
        "m-[6px_auto_4px] block max-h-[3.5px] min-h-[3.5px] w-[36px] cursor-pointer rounded-full border-0 bg-muted",
        className,
      )}
      action={reachedLastDetent ? "dismiss" : "step"}
      {...props}
    />
  );
};

const SheetWithDetentScrollView = (props: React.ComponentProps<typeof Scroll.View>) => {
  return (
    <Scroll.View
      scrollAnimationSettings={{ skip: "auto" }}
      scrollGestureTrap={{ yEnd: true }}
      scrollGesture="auto"
      safeArea="layout-viewport"
      onScrollStart={{ dismissKeyboard: true }}
      {...props}
    />
  );
};

const SheetWithDetentPortal = Sheet.Portal;
const SheetWithDetentTrigger = Sheet.Trigger;
const SheetWithDetentOutlet = Sheet.Outlet;
const SheetWithDetentTitle = Sheet.Title;
const SheetWithDetentDescription = Sheet.Description;
const SheetWithDetentScrollRoot = Scroll.Root;
const SheetWithDetentScrollContent = Scroll.Content;
const SheetWithDetentScrollTrigger = Scroll.Trigger;

export const SheetWithDetent = {
  Root: SheetWithDetentRoot,
  Portal: SheetWithDetentPortal,
  View: SheetWithDetentView,
  Backdrop: SheetWithDetentBackdrop,
  Content: SheetWithDetentContent,
  Trigger: SheetWithDetentTrigger,
  Handle: SheetWithDetentHandle,
  Outlet: SheetWithDetentOutlet,
  Title: SheetWithDetentTitle,
  Description: SheetWithDetentDescription,
  ScrollRoot: SheetWithDetentScrollRoot,
  ScrollView: SheetWithDetentScrollView,
  ScrollContent: SheetWithDetentScrollContent,
  ScrollTrigger: SheetWithDetentScrollTrigger,
};

export { useSheetWithDetentContextOptional };
