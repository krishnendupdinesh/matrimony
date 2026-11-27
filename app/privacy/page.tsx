// app/privacy/page.tsx. TEMPLATE TEXT: get it reviewed against India's DPDP Act before launch.
import LegalPage from "../components/LegalPage";
export default function Privacy() {
  return <LegalPage title="Privacy policy" updated="27 November 2026" intro="This explains what information Sammatham collects, why, and the choices you have. We treat matrimonial details as sensitive and collect only what we need."
    sections={[
      { h: "Information we collect", p: ["Details you give us: name, date of birth, gender, contact details, photos, religion and community, education and work, family details, horoscope details and partner preferences.", "Details we collect as you use the site: the profiles you view, interests and messages you send, device and log information, and payment records. We do not store your card, UPI or bank login details; payments are handled by our payment provider."] },
      { h: "How we use it", p: ["To create and show your profile, suggest matches, let members contact each other, process payments, keep the site safe, review reports and send you notices you have chosen to receive."] },
      { h: "Who can see your information", p: ["Other members see your profile according to your privacy settings. Your phone number is shown only to premium members after an accepted interest, and your house name and map link only to people you allow.", "We do not sell your personal information. We share it only with service providers who help us run the site (such as hosting, SMS and payments), and with authorities when the law requires it."] },
      { h: "Photos and verification", p: ["Photos are reviewed before they go live. Selfies and ID documents submitted for verification are seen only by our review team and the ID is deleted after review."] },
      { h: "How long we keep it", p: ["We keep your profile while your account is active. If you delete your profile, we remove it and your photos and messages, except records we must keep for legal or accounting reasons."] },
      { h: "Your choices", p: ["You can edit your details, change who sees what, hide or delete your profile, and manage notifications in Settings. You can also ask us to correct or erase your data by writing to us."] },
      { h: "Security", p: ["We use encrypted connections and limit staff access. No system is completely secure, so please use a strong password and never share your OTP."] },
      { h: "Contact us", p: ["Questions or requests about your data: help@sammatham.com."] },
    ]} />;
}