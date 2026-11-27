// app/refund-policy/page.tsx. Keep this in step with the checkout page and chatbot FAQ.
import LegalPage from "../components/LegalPage";
export default function Refund() {
  return <LegalPage title="Refund policy" updated="27 November 2026" intro="We want you to feel confident when you buy a plan. Here is when you can get your money back."
    sections={[
      { h: "7-day refund", p: ["You can ask for a full refund within 7 days of buying a plan, as long as you have not used any contact views, sent messages to accepted matches, or used other paid benefits."] },
      { h: "When we cannot refund", p: ["After 7 days, or after you have used paid features. Also when a profile is suspended or removed for breaking our terms."] },
      { h: "Payment problems", p: ["If money was deducted but your plan did not start, tell us the order ID. We will activate your plan or refund the full amount."] },
      { h: "No automatic renewal", p: ["Plans end on their valid-till date and do not renew by themselves, so there is nothing to cancel."] },
      { h: "How to ask and how long it takes", p: ["Write to us through the Help page or at help@sammatham.com with your order ID. Approved refunds go back to the original payment method, usually within 5 to 7 working days."] },
    ]} />;
}