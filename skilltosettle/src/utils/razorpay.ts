/**
 * Razorpay Payment Gateway Integration Utility for SkilltoSettle
 */

export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface RazorpayOptions {
  key?: string;
  amount: number; // in smallest currency unit (e.g. Paise for INR: 100 paise = 1 INR)
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
    backdrop_color?: string;
  };
  handler?: (response: RazorpayPaymentSuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
}

/**
 * Loads the Razorpay Checkout SDK dynamically into the page head.
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById("razorpay-checkout-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      console.error("Failed to load Razorpay Checkout SDK.");
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

/**
 * Gets the configured Razorpay Key ID from environment variables or standard test key.
 */
export const getRazorpayKey = (): string => {
  const envKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (envKey && !envKey.includes("YourKey") && envKey.trim().length > 5) {
    return envKey.trim();
  }
  return "rzp_live_TechSgrLhwSWOe";
};

/**
 * Launches the official Razorpay Checkout modal
 */
export const launchRazorpayCheckout = async (
  options: Omit<RazorpayOptions, "key"> & { key?: string }
): Promise<boolean> => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !window.Razorpay) {
    alert(
      "Unable to initialize Razorpay payment gateway. Please check your internet connection or try again."
    );
    return false;
  }

  const razorpayKey = (options.key || getRazorpayKey()).trim();

  const cleanNotes: Record<string, string> = {};
  if (options.notes) {
    Object.entries(options.notes).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        cleanNotes[k] = String(v).slice(0, 100);
      }
    });
  }

  const cleanContact = options.prefill?.contact
    ? options.prefill.contact.replace(/[^0-9]/g, "").slice(-10)
    : "";

  const finalOptions = {
    key: razorpayKey,
    name: "SkilltoSettle",
    description: (options.description || "Live Cohort Program Enrollment").slice(0, 255),
    image: options.image || "https://skilltosettle.com/sts-logo.png",
    amount: Math.round(options.amount),
    currency: options.currency || "INR",
    prefill: {
      name: (options.prefill?.name || "").slice(0, 50),
      email: (options.prefill?.email || "").slice(0, 100),
      contact: cleanContact,
    },
    notes: {
      platform: "SkilltoSettle.com",
      ...cleanNotes,
    },
    theme: {
      color: "#009bb9",
      ...(options.theme || {}),
    },
    retry: {
      enabled: true,
      max_count: 3,
    },
    handler: options.handler,
    modal: {
      ondismiss: options.modal?.ondismiss,
      escape: true,
      backdropclose: false,
    },
  };

  try {
    const rzp = new window.Razorpay(finalOptions);
    rzp.on("payment.failed", (response: any) => {
      console.error("Razorpay Payment Failed:", response.error);
      const errCode = response.error?.code || "";
      const desc =
        response.error?.description ||
        response.error?.reason ||
        response.error?.message ||
        "Transaction could not be processed.";

      let userMsg = `Payment Failed: ${desc}`;
      if (errCode === "BAD_REQUEST_ERROR" && (desc.includes("key") || desc.includes("merchant") || desc.includes("KYC") || desc.includes("activated"))) {
        userMsg += "\n\nNote: If this is a live key, please ensure your Razorpay account is fully KYC-verified and activated for Live Mode in the Razorpay Dashboard.";
      }
      alert(userMsg);
    });
    rzp.open();
    return true;
  } catch (err: any) {
    console.error("Error opening Razorpay checkout:", err);
    alert(`Could not open Razorpay checkout: ${err?.message || err}`);
    return false;
  }
};
