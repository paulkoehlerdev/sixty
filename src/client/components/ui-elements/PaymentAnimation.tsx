import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { SuccessCheckmark } from "@/components/ui/success-checkmark";

interface PaymentAnimationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentAnimation({ open, onOpenChange }: PaymentAnimationProps) {
  const [stage, setStage] = useState<"processing" | "success">("processing");

  useEffect(() => {
    if (open) {
      setStage("processing");
      const timer = setTimeout(() => {
        setStage("success");
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      // Reset stage when drawer closes
      setStage("processing");
    }
  }, [open]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[30vh]">
        <div className="relative mx-auto flex h-full w-full max-w-sm flex-col items-center justify-center p-8">
          <AnimatePresence mode="wait">
            {stage === "processing" ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  >
                    <Loader2 className="h-20 w-20 text-primary" />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-primary/20"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="text-center"
                >
                  <motion.h3
                    className="font-semibold text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Processing Payment
                  </motion.h3>
                  <motion.p
                    className="mt-1 text-muted-foreground text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Please wait...
                  </motion.p>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.1,
                    }}
                  >
                    <SuccessCheckmark size="lg" />
                  </motion.div>
                  {[0, 1, 2].map((rippleIndex) => (
                    <motion.div
                      key={`ripple-${rippleIndex}`}
                      className="absolute inset-0 rounded-full border-2 border-green-500/30"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{
                        scale: [1, 1.5, 1.8],
                        opacity: [0.6, 0.3, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        delay: rippleIndex * 0.2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeOut",
                      }}
                      style={{ inset: `${-16 - rippleIndex * 8}px` }}
                    />
                  ))}
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-center"
                >
                  <motion.h3
                    className="font-semibold text-lg"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  >
                    Payment Successful!
                  </motion.h3>
                  <motion.p
                    className="mt-1 text-muted-foreground text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Your booking has been confirmed
                  </motion.p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
