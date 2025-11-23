import { CheckCircle2, Loader2, Package, Shield, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Product, Package as ProtectionPackage } from "@/lib/sixt/types";
import type { AgentState } from "@/lib/state";
import { useAgentState } from "../AgentStateContext";
import { CarOfferCardContent } from "../CarOfferCard";
import { PaymentAnimation } from "./PaymentAnimation";
import { PriceDisplay } from "./PriceDisplay";

interface BookingSummaryProps {
  state: AgentState;
}

export function BookingSummary({ state }: BookingSummaryProps) {
  const { unlockCar, revertToInitialOffer, processPayment } = useAgentState();
  const [showPaymentAnimation, setShowPaymentAnimation] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Use global state for payment and unlock status
  const paymentCompleted = state.paymentCompleted ?? false;
  const carUnlocked = state.carUnlocked ?? false;

  // Use booking if available, otherwise use initialOffer
  const offer = state.booking?.offer_v2 ?? state.initialOffer;
  const addOns = state.booking?.available_add_ons_v2;

  // Check if this is an upgraded booking (booking exists and is different from initial offer)
  const isUpgradedBooking =
    state.booking && state.initialOffer && state.booking.offer_v2.offer_id !== state.initialOffer.offer_id;

  if (!offer) {
    return null;
  }

  // Get selected protection package
  const selectedPackage = addOns?.packages.find((pkg: ProtectionPackage) => pkg.is_selected);

  // Get selected and included products
  const selectedProducts = addOns?.products.filter(
    (product: Product) => product.is_selected || product.is_mandatory || product.is_included_in_package,
  );

  const handlePayment = async () => {
    setShowPaymentAnimation(true);

    // Wait for animation to complete (2s processing + 1.5s success display)
    await new Promise((resolve) => setTimeout(resolve, 3500));

    await processPayment("google");
    setShowPaymentAnimation(false);
  };

  const handleUnlock = async () => {
    setIsUnlocking(true);
    
    // Wait for a bit to show the loading state
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    unlockCar();
    setIsUnlocking(false);
  };

  const handleRevert = () => {
    revertToInitialOffer();
  };

  return (
    <>
      <PaymentAnimation open={showPaymentAnimation} onOpenChange={setShowPaymentAnimation} />

      <Card variant={carUnlocked ? "success" : "normal"} className="dark:border-none">
          <CardHeader className="pb-0">
            <CardTitle className="font-bold text-lg">Booking Summary</CardTitle>
          </CardHeader>

          <CarOfferCardContent offer={offer} isSuccess={carUnlocked} />

        <CardContent className="space-y-4">
          {selectedPackage && (
            <div className="space-y-2">
              <h3 className="flex items-center gap-1.5 font-semibold text-muted-foreground text-sm">
                <Shield className="h-4 w-4" />
                Protection Package
              </h3>
              <div className="rounded-lg border-2 border-green-500/30 bg-green-50/50 p-3 dark:bg-green-950/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{selectedPackage.description.name}</p>
                    <p className="mt-1 text-muted-foreground text-xs">{selectedPackage.deductible_text}</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                </div>
              </div>
            </div>
          )}

          {/* Add-ons Section */}
          {selectedProducts && selectedProducts.length > 0 && (
            <div className="space-y-2">
              <h3 className="flex items-center gap-1.5 font-semibold text-muted-foreground text-sm">
                <Package className="h-4 w-4" />
                Add-ons
              </h3>
              <div className="space-y-1.5">
                {selectedProducts.map((product: Product) => (
                  <div
                    key={product.charge_code}
                    className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{product.description.name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Price */}
          <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
            <span className="text-muted-foreground text-sm">Total Price</span>
            <PriceDisplay price={offer.price_total} displaySuffix={false} />
          </div>

          {isUpgradedBooking ? (
            <div className="space-y-3">
              {paymentCompleted ? (
                // Unlock Button (shown after payment)
                <AnimatePresence mode="wait">
                  {carUnlocked ? (
                    // Success State
                    <motion.div
                      key="unlocked-success-upgraded"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Button
                        className="w-full text-white disabled:opacity-100"
                        style={{
                          background: "linear-gradient(135deg, var(--success-gradient-start), var(--success-gradient-end))",
                        }}
                        disabled={true}
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                            delay: 0.1,
                          }}
                          className="mr-2 inline-block"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </motion.div>
                        Car Unlocked Successfully
                      </Button>
                    </motion.div>
                  ) : (
                    // Unlock Button
                    <motion.div
                      key="unlock-button-upgraded"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button className="w-full" onClick={handleUnlock} disabled={isUnlocking}>
                        {isUnlocking ? (
                          <motion.div
                            className="flex items-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="relative mr-2">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Number.POSITIVE_INFINITY,
                                  ease: "linear",
                                }}
                              >
                                <Loader2 className="h-4 w-4 text-primary-foreground" />
                              </motion.div>
                              <motion.div
                                className="absolute inset-0 rounded-full border-2 border-primary-foreground/20"
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
                            <span>Loading...</span>
                          </motion.div>
                        ) : (
                          "Unlock Car"
                        )}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              ) : (
                // Google Pay Button (shown before payment)
                <>
                  <button
                    type="button"
                    onClick={handlePayment}
                    disabled={showPaymentAnimation}
                    className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-[#DADCE0] bg-white px-4 transition-all hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#5F6368] dark:bg-[#202124]"
                  >
                    <span className="font-semibold text-[#3C4043] text-base dark:text-white">Pay with</span>
                    {/* Google Pay Logo */}
                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  </button>

                  <Button
                    variant="outline"
                    className="w-full bg-card"
                    onClick={handleRevert}
                    disabled={showPaymentAnimation}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel Upgrade
                  </Button>
                </>
              )}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {carUnlocked ? (
                // Success State for initial offer
                <motion.div
                  key="unlocked-success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Button
                    className="w-full text-white disabled:opacity-100"
                    style={{
                      background: "linear-gradient(135deg, var(--success-gradient-start), var(--success-gradient-end))",
                    }}
                    disabled={true}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        delay: 0.1,
                      }}
                      className="mr-2 inline-block"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </motion.div>
                    Car Unlocked Successfully
                  </Button>
                </motion.div>
            ) : (
              // Unlock Button for initial offer
              <motion.div
                key="unlock-button"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Button className="w-full" onClick={handleUnlock} disabled={isUnlocking}>
                  {isUnlocking ? (
                    <motion.div
                      className="flex items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="relative mr-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                          }}
                        >
                          <Loader2 className="h-4 w-4 text-primary-foreground" />
                        </motion.div>
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-primary-foreground/20"
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
                      <span>Loading...</span>
                    </motion.div>
                  ) : (
                    "Unlock Car"
                  )}
                </Button>
              </motion.div>
            )}
            </AnimatePresence>
          )}
        </CardContent>
      </Card>
    </>
  );
}
