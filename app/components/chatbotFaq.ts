// components/chatbotFaq.ts — edit this file to change what the bot knows. No AI, no API key.
export type Faq = { id: string; title: string; keywords: string[]; answer: string; link?: { label: string; href: string } };

// keywords: lowercase words or phrases members might type. Phrases with a space score higher.
// Prices are deliberately not written here, so they never go out of date: the bot sends people to the Plans page.
export const FAQS: Faq[] = [
  { id: "register", title: "How do I register?", keywords: ["register", "sign up", "signup", "create account", "create profile", "join", "new account"],
    answer: "Sign up with your mobile number and email, then complete the profile steps: basic details, location, community, education, family, horoscope, lifestyle, photos and about me. A complete profile gets more replies.", link: { label: "Create profile", href: "/register" } },
  { id: "editprofile", title: "How do I edit my profile?", keywords: ["edit profile", "update profile", "change details", "edit my", "change my details", "my profile"],
    answer: "Open My profile from the menu under your photo. You can change any section and press Save changes at the bottom.", link: { label: "My profile", href: "/profile" } },
  { id: "photos", title: "How do I add or choose a profile photo?", keywords: ["photo", "photos", "picture", "profile photo", "upload", "profile picture", "image"],
    answer: "On the My profile page, open the Photos section. You can add up to 6 photos and press Set as profile photo on the one you want shown first. New photos are checked before they appear to others.", link: { label: "My profile", href: "/profile" } },
  { id: "verify", title: "How do I get the Verified badge?", keywords: ["verified", "verify", "verification", "badge", "selfie"],
    answer: "Press Verify now on your dashboard and complete the quick selfie check. A Verified badge shows families your profile is genuine and brings more replies.", link: { label: "Verify now", href: "/verify" } },
  { id: "search", title: "How do I search for profiles?", keywords: ["search", "find", "filter", "filters", "look for", "advanced search", "profile id"],
    answer: "Use Search from the top menu. You can filter by age, height, religion, community, district, education and more, or search by a profile ID. You can also save a search to reuse it. You only see profiles of the opposite gender.", link: { label: "Search", href: "/search" } },
  { id: "matches", title: "How do matches and preferences work?", keywords: ["match", "matches", "preferences", "partner preferences", "recommend", "percentage", "match percent"],
    answer: "Set your partner preferences on the Matches page. Each profile shows a percentage for how many of your preferences it meets, and the best matches appear first.", link: { label: "Matches", href: "/matches" } },
  { id: "interest", title: "How do interests work?", keywords: ["interest", "interests", "send interest", "accept", "decline", "express interest", "proposal"],
    answer: "Press Send interest on a profile. The other person can accept or decline. You can see everything on the Interests page, including interests you received and ones you sent.", link: { label: "Interests", href: "/interests" } },
  { id: "shortlist", title: "What is the shortlist?", keywords: ["shortlist", "shortlisted", "save profile", "saved profiles", "bookmark", "favourite", "favorite", "note"],
    answer: "Shortlist keeps profiles you want to look at again. You can add private notes to each one, and only you can see the list and your notes.", link: { label: "Shortlist", href: "/shortlist" } },
  { id: "chat", title: "How do I message someone?", keywords: ["message", "messages", "chat", "talk", "contact", "send message", "cannot message", "can't message"],
    answer: "Messaging opens after an interest is accepted. Once that happens, the person appears in your Messages and you can start chatting.", link: { label: "Messages", href: "/messages" } },
  { id: "plans", title: "What are the plans and prices?", keywords: ["plan", "plans", "price", "pricing", "cost", "premium", "upgrade", "gold", "diamond", "platinum", "membership", "how much", "fee"],
    answer: "We have Gold, Diamond and Platinum plans. Paid plans add chat, contact numbers and more. You can see current prices and compare features on the Plans page.", link: { label: "View plans", href: "/plans" } },
  { id: "payment", title: "How can I pay?", keywords: ["payment", "pay", "upi", "card", "net banking", "netbanking", "payment failed", "paid but", "money deducted", "debited"],
    answer: "You can pay by UPI, debit or credit card, or net banking. If money was deducted but your plan is not active, please contact support with your order ID so we can check it.", link: { label: "Contact support", href: "/help" } },
  { id: "refund", title: "Can I get a refund?", keywords: ["refund", "money back", "cancel plan", "cancel my plan", "cancel membership", "cancel"],
    answer: "You can ask for a refund within 7 days of buying if you have not used any contact views. Plans do not renew on their own, so there is nothing to cancel later.", link: { label: "Contact support", href: "/help" } },
  { id: "privacy", title: "Is my information private?", keywords: ["privacy", "private", "safe", "who can see", "address", "house", "phone number", "my data", "hide address"],
    answer: "Everyone sees your district and place only. Your house name and map link stay hidden unless you allow them in your profile settings. Your phone number is shown only to premium members after an accepted interest.", link: { label: "Privacy settings", href: "/settings" } },
  { id: "hide", title: "How do I hide or delete my profile?", keywords: ["hide profile", "hide my profile", "delete my account", "delete my profile", "delete profile", "delete account", "deactivate", "remove profile", "married", "found match"],
    answer: "Go to Settings and choose Hide profile to pause it, or Delete profile to remove it. If you found your match, you can also share your story with us.", link: { label: "Settings", href: "/settings" } },
  { id: "report", title: "How do I report or block a profile?", keywords: ["report", "block", "fake", "fake profile", "abuse", "abusive", "harass", "harassment", "inappropriate", "spam", "suspicious"],
    answer: "Open the profile, press the three dots and choose Report profile or Block. You can also do this inside a chat. Our team reviews every report.", link: { label: "Report a problem", href: "/help" } },
  { id: "scam", title: "Safety tips", keywords: ["scam", "fraud", "cheat", "money", "send money", "asked for money", "bank", "gift", "investment", "foreign", "safety", "safe to"],
    answer: "Never send money or share bank, card or OTP details with anyone you meet here, even if they seem genuine. Meet only in public places and with family. If someone asks you for money, report their profile straight away.", link: { label: "Report a problem", href: "/help" } },
  { id: "password", title: "I forgot my password", keywords: ["forgot", "password", "forgot password", "reset password", "change password", "cant login", "can't login", "cannot login", "login problem", "otp not", "locked out"],
    answer: "On the login page, press Forgot password and we will send a code to your mobile or email. Please never share that code with anyone, including us.", link: { label: "Log in", href: "/login" } },
  { id: "horoscope", title: "How does horoscope matching work?", keywords: ["horoscope", "porutham", "star", "nakshathram", "rasi", "dosham", "jathakam", "astrology"],
    answer: "Add your star, rasi and dosham in your profile. On a profile you can see a porutham score out of 10, and the Horoscope page shows the full match.", link: { label: "Horoscope match", href: "/horoscope" } },
  { id: "viewers", title: "Who viewed my profile?", keywords: ["viewed", "who viewed", "visitors", "who saw", "profile views"],
    answer: "Your dashboard shows how many people viewed your profile this week. The full list is on the Who viewed me page.", link: { label: "Who viewed me", href: "/viewers" } },
  { id: "support", title: "How do I contact support?", keywords: ["support", "help", "contact us", "customer care", "talk to person", "human", "agent", "complaint", "email", "call"],
    answer: "You can reach our team through the Help page or at help@sammatham.com. For payment or safety problems, please include your profile ID.", link: { label: "Help page", href: "/help" } },
];

export const QUICK = ["How do interests work?", "Plans and prices", "Is my information private?", "How do I report a profile?"];
export const GREETING = "Hi, I am the Sammatham assistant. Ask me about your profile, interests, plans or safety.";
export const FALLBACK = "I am not sure about that one. You can try different words, or our team can help you directly.";

const clean = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}\s']/gu, " ").replace(/\s+/g, " ").trim();

export type Reply = { text: string; link?: Faq["link"]; suggestions?: Faq[] };

export function answer(input: string): Reply {
  const q = ` ${clean(input)} `;
  if (/^ ?(hi|hello|hey|hai|namaskaram|vanakkam) ?$/.test(q.trim() ? ` ${q.trim()} ` : "")) return { text: GREETING };
  if (/\b(thanks|thank you|thankyou|nanni)\b/.test(q)) return { text: "You are welcome. Wishing you the very best in your search." };

  const scored = FAQS.map((f) => ({ f, s: f.keywords.reduce((n, k) => n + (q.includes(` ${k} `) || q.includes(` ${k}s `) ? (k.includes(" ") ? 3 : 2) : 0), 0) }))
    .filter((x) => x.s > 0).sort((a, b) => b.s - a.s);

  if (scored.length && scored[0].s >= 2) {
    const [top, second] = scored;
    // two close answers: show the best and offer the other
    return { text: top.f.answer, link: top.f.link, suggestions: second && second.s >= top.s ? [second.f] : undefined };
  }
  return { text: FALLBACK, link: { label: "Contact support", href: "/help" }, suggestions: FAQS.filter((f) => ["interest", "plans", "privacy", "report"].includes(f.id)) };
}