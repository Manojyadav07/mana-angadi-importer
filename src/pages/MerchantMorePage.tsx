import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useAuth } from "@/context/AuthContext";
import { useMerchantShop } from "@/hooks/useShops";
import {
  Store, ChevronRight, ChevronDown, ChevronUp,
  Phone, MessageCircle, Mail, FileText, Shield,
  RotateCcw, Star, Crown, CheckCircle2, LogOut,
  X, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

// ─── Legal content ────────────────────────────────────────────────────────────

const TERMS_CONTENT = `
TERMS AND CONDITIONS
Effective Date: 1 March 2025
Platform: Mana Angadi

1. ACCEPTANCE OF TERMS
By registering as a merchant on Mana Angadi, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our platform.

2. MERCHANT ELIGIBILITY
- You must be at least 18 years of age to register as a merchant.
- You must possess a valid government-issued ID and a legitimate business operating in the supported service area.
- You are responsible for maintaining accurate and up-to-date shop information including name, address, contact details, and product listings.

3. PRODUCT LISTINGS
- You are solely responsible for the accuracy, quality, safety, and legality of all products listed on your store.
- Products must not include items that are prohibited by Indian law, counterfeit, expired, or harmful.
- Mana Angadi reserves the right to remove any listing that violates these terms without prior notice.

4. ORDERS AND FULFILLMENT
- Upon receiving an order notification, you are expected to confirm or reject the order within the time limit set in your store settings.
- Failure to fulfil confirmed orders repeatedly may result in suspension or removal of your merchant account.
- You are responsible for proper packaging to ensure safe delivery to the customer.

5. PRICING AND PAYMENTS
- All prices listed must be inclusive of applicable taxes (GST).
- Mana Angadi will deduct a platform commission from each order before settlement.
- Settlements are processed weekly to the UPI ID / bank account provided during onboarding.
- Mana Angadi reserves the right to revise commission rates with 7 days' prior notice.

6. PROHIBITED CONDUCT
You agree NOT to:
- List fake, misleading, or duplicate products.
- Manipulate order data or ratings.
- Contact customers outside the platform for payments.
- Use the platform to conduct any unlawful activity.

7. ACCOUNT SUSPENSION
Mana Angadi may suspend or terminate your account if:
- You violate these Terms.
- Your shop receives sustained negative feedback.
- Fraudulent activity is detected on your account.

8. LIMITATION OF LIABILITY
Mana Angadi is a technology platform connecting merchants and customers. We are not liable for any loss arising from product quality disputes, delivery delays, or force majeure events.

9. GOVERNING LAW
These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Telangana, India.

10. CONTACT
For any queries regarding these Terms, contact us at rebbasmanoj007@gmail.com or +91 75502 01424.
`;

const PRIVACY_CONTENT = `
PRIVACY POLICY
Effective Date: 1 March 2025
Platform: Mana Angadi

1. INTRODUCTION
Mana Angadi ("we", "our", "us") is committed to protecting the privacy of our merchant partners. This Privacy Policy explains how we collect, use, store, and protect your information when you use our platform.

2. INFORMATION WE COLLECT
We collect the following types of information:

Personal Information:
- Full name, shop name (English & Telugu)
- Mobile number and email address
- Government ID details (for verification)
- UPI ID / bank account for payments

Business Information:
- Shop address and location coordinates
- Product listings, prices, and stock details
- Operating hours and shop settings

Usage Data:
- Order history, earnings, and transaction records
- App activity logs, login timestamps
- Device type and OS version (for support)

3. HOW WE USE YOUR INFORMATION
- To operate and maintain your merchant account
- To process orders and facilitate settlements
- To send order notifications, updates, and alerts
- To verify your identity and prevent fraud
- To improve app features and user experience
- To comply with legal and regulatory obligations

4. DATA SHARING
We do NOT sell your personal data. We may share data with:
- Delivery partners (only name, shop address, order details needed for fulfilment)
- Payment processors (UPI/bank for settlements)
- Government authorities if required by law

5. DATA STORAGE AND SECURITY
- All data is stored securely using Supabase (hosted infrastructure with AES-256 encryption).
- Access to your data is restricted to authorised personnel only.
- We use HTTPS for all data transmissions.

6. DATA RETENTION
- Your data is retained as long as your account is active.
- On account deletion, we retain transaction records for 5 years as required by Indian tax law.
- All other personal data is deleted within 30 days of account closure.

7. YOUR RIGHTS
You have the right to:
- Access a copy of the data we hold about you
- Request correction of inaccurate data
- Request deletion of your account and data
- Withdraw consent for marketing communications

To exercise these rights, contact rebbasmanoj007@gmail.com.

8. COOKIES AND LOCAL STORAGE
Our app uses local storage and session tokens to keep you logged in and improve performance. No third-party tracking cookies are used.

9. CHANGES TO THIS POLICY
We may update this Privacy Policy from time to time. Merchants will be notified via in-app notification when significant changes are made.

10. CONTACT US
Privacy Officer: Mana Angadi Team
Email: rebbasmanoj007@gmail.com
Phone: +91 75502 01424
`;

const REFUND_CONTENT = `
REFUND & CANCELLATION POLICY
Effective Date: 1 March 2025
Platform: Mana Angadi

1. OVERVIEW
This policy governs refunds and cancellations for orders placed through Mana Angadi. Both merchants and customers are expected to adhere to this policy.

2. ORDER CANCELLATION BY MERCHANT

Permitted Cancellations:
- Item is out of stock after order placement
- Customer is unreachable for delivery confirmation
- Delivery location is outside service area

Process:
- Cancel the order through the Merchant App before dispatch.
- State the reason clearly in the cancellation prompt.
- Frequent cancellations without valid reasons may result in penalties.

3. ORDER CANCELLATION BY CUSTOMER
- Customers may cancel within 5 minutes of placing an order.
- Once the order is confirmed/accepted by the merchant, cancellation is at the merchant's discretion.
- For prepaid orders cancelled by the customer after merchant confirmation, the refund decision rests with the platform.

4. REFUNDS TO CUSTOMERS

Full Refund Applicable When:
- Merchant cancels the order.
- Wrong item delivered (verified with photo evidence).
- Item delivered is damaged, expired, or significantly different from the listing.

Partial Refund or No Refund:
- Minor quality complaints without evidence.
- Customer refuses delivery without valid reason.
- Perishable items (vegetables, dairy, etc.) with subjective quality complaints.

5. REFUND PROCESS
- Approved refunds are credited to the customer's original payment method within 5–7 business days.
- UPI refunds are typically processed within 24–48 hours.
- Cash-on-delivery orders with valid complaints are refunded via UPI to the customer's registered number.

6. MERCHANT SETTLEMENTS AND DEDUCTIONS
- Platform commission is deducted from each order at the time of settlement.
- If a refund is issued to a customer for a fulfilled order due to merchant fault, the corresponding amount will be deducted from the merchant's next settlement.
- Disputed deductions can be raised within 7 days of the settlement date.

7. DISPUTE RESOLUTION
- Raise disputes via the Support section in the app or by contacting rebbasmanoj007@gmail.com.
- All disputes will be reviewed within 48–72 business hours.
- The decision of the Mana Angadi team shall be final in cases of irresolvable disputes.

8. CONTACT FOR REFUND QUERIES
Email: rebbasmanoj007@gmail.com
Phone / WhatsApp: +91 75502 01424
Working Hours: 9:00 AM – 8:00 PM, Monday to Saturday
`;

// ─── Legal Sheet ──────────────────────────────────────────────────────────────

function LegalSheet({
  title, content, open, onClose,
}: {
  title: string; content: string; open: boolean; onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-t-3xl w-full max-w-md h-[88vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
        </div>
        {/* Title bar */}
        <div className="px-5 pb-3 flex items-center justify-between border-b border-border flex-shrink-0">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {content.trim().split("\n").map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={i} className="h-2" />;
            // Section headings (ALL CAPS lines or numbered like "1. TITLE")
            if (/^[0-9]+\.\s[A-Z\s&]+$/.test(trimmed) || /^[A-Z\s&]{6,}$/.test(trimmed)) {
              return (
                <p key={i} className="text-sm font-bold text-foreground mt-4 mb-1.5">
                  {trimmed}
                </p>
              );
            }
            // Bullet points
            if (trimmed.startsWith("•")) {
              return (
                <p key={i} className="text-xs text-muted-foreground leading-relaxed pl-3 mb-1">
                  {trimmed}
                </p>
              );
            }
            return (
              <p key={i} className="text-xs text-muted-foreground leading-relaxed mb-1">
                {trimmed}
              </p>
            );
          })}
          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}

// ─── FAQ accordion ────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "When will I receive my settlement?",
    a: "Settlements are processed every week, typically on Mondays, to the UPI ID or bank account you registered during onboarding.",
  },
  {
    q: "How do I update my UPI details?",
    a: "Go to Store Settings → Order Settings → UPI Details and update your UPI VPA and payee name, then tap Save.",
  },
  {
    q: "What happens if I miss an order?",
    a: "Missed orders without cancellation are flagged. Repeated misses may lead to a temporary suspension. Always accept or reject orders promptly.",
  },
  {
    q: "Can I list products in Telugu?",
    a: "Yes! Every product has a Name (Telugu) field. Customers can browse your store in Telugu through the language toggle.",
  },
  {
    q: "How do I report a wrong deduction?",
    a: "Contact support within 7 days of the settlement date with your order ID and the disputed amount. Email rebbasmanoj007@gmail.com or WhatsApp +91 75502 01424.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-3.5 text-left"
      >
        <span className="text-sm font-semibold text-foreground pr-3">{q}</span>
        {open
          ? <ChevronUp   className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        }
      </button>
      {open && (
        <p className="text-xs text-muted-foreground leading-relaxed pb-3.5">{a}</p>
      )}
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export function MerchantMorePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: shop } = useMerchantShop(user?.id);
  const s = shop as any;

  const [legalSheet, setLegalSheet] = useState<null | "terms" | "privacy" | "refund">(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const handleCall = () => {
    window.location.href = "tel:+917550201424";
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/917550201424?text=Hi%2C%20I%20need%20support%20as%20a%20Mana%20Angadi%20merchant.", "_blank");
  };

  const handleEmail = () => {
    window.location.href = "mailto:rebbasmanoj007@gmail.com?subject=Merchant%20Support%20-%20Mana%20Angadi";
  };

  return (
    <MobileLayout navType="merchant">
      <header className="px-4 pt-6 pb-4">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Account</p>
        <h1 className="text-2xl font-bold text-foreground mt-0.5">My Profile</h1>
      </header>

      <div className="px-4 pb-28 space-y-4">

        {/* ── Profile Card ──────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-muted border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
              {s?.logo_url
                ? <img src={s.logo_url} alt="logo" className="w-full h-full object-cover" />
                : <Store className="w-7 h-7 text-muted-foreground" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-foreground truncate">
                {s?.name_en ?? user?.user_metadata?.full_name ?? "Merchant"}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                <span className="text-[10px] font-semibold text-green-600">Verified Merchant</span>
                <span className="text-[10px] text-muted-foreground">· Since March 2025</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
            {[
              { label: "Shop",   value: s?.type ?? "kirana" },
              { label: "Status", value: s?.isOpen ? "Open" : "Closed",
                color: s?.isOpen ? "text-green-600" : "text-red-500" },
              { label: "Plan",   value: "Starter" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className={`text-sm font-bold capitalize ${(item as any).color ?? "text-foreground"}`}>
                  {item.value}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/merchant/profile")}
            className="w-full mt-4 flex items-center justify-between bg-muted rounded-xl px-4 py-3 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Edit Store Profile</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* ── Membership ────────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Membership</p>
            </div>
            <button className="text-xs font-semibold text-primary">View all plans</button>
          </div>

          <div className="bg-muted rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-bold text-foreground">Starter</span>
              </div>
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                Current Plan
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">Free forever</p>
            {["Up to 20 products", "Basic analytics", "Email support"].map((f) => (
              <div key={f} className="flex items-center gap-2 mt-1">
                <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span className="text-xs text-muted-foreground">{f}</span>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-600" />
              <div>
                <p className="text-xs font-bold text-amber-800">Upgrade to Pro</p>
                <p className="text-[10px] text-amber-600">Unlimited products + priority support for ₹200/mo</p>
              </div>
            </div>
            <button className="bg-amber-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
              Upgrade
            </button>
          </div>
        </div>

        {/* ── Help & Support ─────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
            Help & Support
          </p>

          {/* Contact options */}
          <div className="space-y-2 mb-4">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl active:scale-[0.98] transition-transform"
            >
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4.5 h-4.5 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-green-800">WhatsApp Support</p>
                <p className="text-xs text-green-600">+91 75502 01424 · Chat with us instantly</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
            </button>

            {/* Call */}
            <button
              onClick={handleCall}
              className="w-full flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl active:scale-[0.98] transition-transform"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-blue-800">Call Support</p>
                <p className="text-xs text-blue-600">+91 75502 01424 · Mon–Sat, 9 AM – 8 PM</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            </button>

            {/* Email */}
            <button
              onClick={handleEmail}
              className="w-full flex items-center gap-3 p-3 bg-muted border border-border rounded-xl active:scale-[0.98] transition-transform"
            >
              <div className="w-9 h-9 rounded-xl bg-muted-foreground/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4.5 h-4.5 text-muted-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-foreground">Email Support</p>
                <p className="text-xs text-muted-foreground">rebbasmanoj007@gmail.com</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            </button>
          </div>

          {/* FAQs */}
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">FAQs</p>
            <div className="bg-muted/50 rounded-xl px-3">
              {FAQS.map((faq) => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Legal ──────────────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          {[
            { key: "terms",   label: "Terms & Conditions", icon: FileText },
            { key: "privacy", label: "Privacy Policy",      icon: Shield   },
            { key: "refund",  label: "Refund Policy",       icon: RotateCcw },
          ].map(({ key, label, icon: Icon }, idx, arr) => (
            <button
              key={key}
              onClick={() => setLegalSheet(key as any)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 active:bg-muted transition-colors ${
                idx < arr.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="flex-1 text-sm font-semibold text-foreground text-left">{label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* ── App info ───────────────────────────────────────────────────── */}
        <div className="text-center py-2 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">Mana Angadi · Merchant App</p>
          <p className="text-[10px] text-muted-foreground/60">Version 1.0.0 · Made with ❤️ for rural India</p>
        </div>

        {/* ── Sign Out ───────────────────────────────────────────────────── */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 border border-red-200 bg-red-50 text-red-600 font-semibold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>

      </div>

      {/* ── Legal Sheets ──────────────────────────────────────────────────── */}
      <LegalSheet
        title="Terms & Conditions"
        content={TERMS_CONTENT}
        open={legalSheet === "terms"}
        onClose={() => setLegalSheet(null)}
      />
      <LegalSheet
        title="Privacy Policy"
        content={PRIVACY_CONTENT}
        open={legalSheet === "privacy"}
        onClose={() => setLegalSheet(null)}
      />
      <LegalSheet
        title="Refund Policy"
        content={REFUND_CONTENT}
        open={legalSheet === "refund"}
        onClose={() => setLegalSheet(null)}
      />
    </MobileLayout>
  );
}