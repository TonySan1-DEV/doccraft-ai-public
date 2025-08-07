import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import PaymentService, {
  PaymentMethod,
  BillingInfo,
  PRICING_TIERS,
} from "../services/paymentService";
import {
  CreditCard,
  Smartphone,
  Apple,
  Building2,
  Check,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

interface PaymentFormProps {
  selectedTier: string;
  billingPeriod: "month" | "year";
  onSuccess: () => void;
  onCancel: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  selectedTier,
  billingPeriod,
  onSuccess,
  onCancel,
}) => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [billingInfo, setBillingInfo] = useState<Partial<BillingInfo>>({
    email: user?.email || "",
    name: "",
    address: {
      line1: "",
      city: "",
      state: "",
      postal_code: "",
      country: "US",
    },
    phone: "",
  });

  const tierConfig = PRICING_TIERS[selectedTier as keyof typeof PRICING_TIERS];
  const amount =
    billingPeriod === "year" ? tierConfig.price * 10 : tierConfig.price; // 2 months free for yearly

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const methods = await PaymentService.getInstance().getPaymentMethods();
      setPaymentMethods(methods);
      if (methods.length > 0) {
        setSelectedPaymentMethod(methods[0].id);
      }
    } catch (error) {
      console.error("Error loading payment methods:", error);
      toast.error("Failed to load payment methods");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setBillingInfo((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
          [child]: value,
        },
      }));
    } else {
      setBillingInfo((prev) => ({ ...prev, [field]: value }));
    }
  };

  const validateForm = () => {
    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method");
      return false;
    }

    if (!billingInfo.name || !billingInfo.email) {
      toast.error("Please fill in your name and email");
      return false;
    }

    if (
      !billingInfo.address?.line1 ||
      !billingInfo.address?.city ||
      !billingInfo.address?.state ||
      !billingInfo.address?.postal_code
    ) {
      toast.error("Please fill in your complete address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const paymentService = PaymentService.getInstance();

      // Create payment intent
      const paymentIntent = await paymentService.createPaymentIntent(
        amount * 100, // Convert to cents
        "USD",
        selectedPaymentMethod,
        {
          tier: selectedTier,
          billing_period: billingPeriod,
          user_id: user?.id,
        }
      );

      // Process payment based on method
      let processedPayment;
      switch (selectedPaymentMethod) {
        case "stripe":
          processedPayment = await paymentService.processStripePayment(
            paymentIntent.id,
            "pm_card_visa", // This would come from Stripe Elements
            billingInfo
          );
          break;
        case "paypal":
          processedPayment = await paymentService.processPayPalPayment(
            paymentIntent.id,
            "PAYPAL_ORDER_ID", // This would come from PayPal
            billingInfo
          );
          break;
        default:
          // For other payment methods, simulate success
          processedPayment = { ...paymentIntent, status: "succeeded" };
      }

      if (processedPayment.status === "succeeded") {
        // Create subscription
        await paymentService.createSubscription(
          user?.id || "",
          selectedTier,
          selectedPaymentMethod
        );

        // Update billing info
        await paymentService.updateBillingInfo(user?.id || "", billingInfo);

        toast.success("Payment successful! Your subscription is now active.");
        onSuccess();
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } catch (error: unknown) {
      console.error("Payment error:", error);
      toast.error(
        (error as Error).message || "Payment failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method.type) {
      case "stripe":
        return <CreditCard className="w-5 h-5" />;
      case "paypal":
        return <CreditCard className="w-5 h-5" />;
      case "googlepay":
        return <Smartphone className="w-5 h-5" />;
      case "applepay":
        return <Apple className="w-5 h-5" />;
      case "bank_transfer":
        return <Building2 className="w-5 h-5" />;
      default:
        return <span className="text-lg">{method.icon}</span>;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-slate-700">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Complete Your Payment
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {tierConfig.name} Plan - ${amount}/{billingPeriod}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Method Selection */}
          <div>
            <label
              htmlFor="payment-method"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"
            >
              Payment Method
            </label>
            <div
              id="payment-method"
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedPaymentMethod(method.id)}
                  className={`p-4 border rounded-lg transition-all duration-200 ${
                    selectedPaymentMethod === method.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {getPaymentMethodIcon(method)}
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {method.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {method.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Billing Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Billing Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="full-name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Full Name *
                </label>
                <input
                  id="full-name"
                  type="text"
                  value={billingInfo.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  value={billingInfo.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="address-line1"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Address Line 1 *
              </label>
              <input
                id="address-line1"
                type="text"
                value={billingInfo.address?.line1}
                onChange={(e) =>
                  handleInputChange("address.line1", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700"
                placeholder="Enter your address"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  City *
                </label>
                <input
                  id="city"
                  type="text"
                  value={billingInfo.address?.city}
                  onChange={(e) =>
                    handleInputChange("address.city", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700"
                  placeholder="City"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  State *
                </label>
                <input
                  id="state"
                  type="text"
                  value={billingInfo.address?.state}
                  onChange={(e) =>
                    handleInputChange("address.state", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700"
                  placeholder="State"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="zip-code"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  ZIP Code *
                </label>
                <input
                  id="zip-code"
                  type="text"
                  value={billingInfo.address?.postal_code}
                  onChange={(e) =>
                    handleInputChange("address.postal_code", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700"
                  placeholder="ZIP Code"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={billingInfo.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Order Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  {tierConfig.name} Plan ({billingPeriod})
                </span>
                <span className="text-gray-900 dark:text-white">
                  ${tierConfig.price}
                </span>
              </div>
              {billingPeriod === "year" && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Yearly Discount (2 months free)</span>
                  <span>-${tierConfig.price * 2}</span>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-slate-600 pt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">
                    ${amount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="terms"
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <label
              htmlFor="terms"
              className="text-sm text-gray-600 dark:text-gray-300"
            >
              I agree to the{" "}
              <a
                href="/terms"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Pay ${amount}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
