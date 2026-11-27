// app/terms/page.tsx. TEMPLATE TEXT: have a lawyer review before launch.
import LegalPage from "../components/LegalPage";
export default function Terms() {
  return <LegalPage title="Terms of use" updated="27 November 2026" intro="By creating a profile or using Sammatham you agree to these terms. Please read them carefully."
    sections={[
      { h: "Who can use Sammatham", p: ["You must be at least 21 years old (men) or 18 years old (women), legally free to marry, and use the site only to find a marriage partner for yourself or a family member."] },
      { h: "Your profile", p: ["You must give true information and use your own recent photos. You are responsible for what you post. We may review, edit, reject or remove profiles and photos that break these terms."] },
      { h: "What is not allowed", p: ["Fake or duplicate profiles, asking others for money or financial details, harassment, abusive or sexual messages, collecting other members' details for other purposes, advertising, and any illegal activity.", "Breaking these rules can lead to suspension or removal of your profile, without refund."] },
      { h: "Interests, chat and contact details", p: ["Messaging opens after an interest is accepted. Contact numbers are shared only as described in your privacy settings and your plan. Do not share them with anyone else."] },
      { h: "Plans and payments", p: ["Paid plans give the features shown on the Plans page for the stated period. Plans do not renew automatically. Refunds follow our refund policy."] },
      { h: "Meeting people safely", p: ["We help members connect but cannot check everyone completely. Please verify details yourself, never send money, and meet in public places with family or friends. We do not guarantee a match or any outcome."] },
      { h: "Our responsibility", p: ["We work to keep the site available and accurate, but we provide it as it is. To the extent the law allows, we are not responsible for the conduct of members or for losses from dealings between members."] },
      { h: "Changes and governing law", p: ["We may update these terms and will tell you about important changes. These terms are governed by the laws of India, and the courts of Kerala have jurisdiction."] },
      { h: "Contact", p: ["help@sammatham.com"] },
    ]} />;
}