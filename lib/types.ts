// Shared TypeScript types for all Sammatham backend API responses.

export type MemberStatus =
  | "pending"
  | "pending_review"
  | "approved"
  | "rejected"
  | "suspended"
  | "deactivated";

export type AdminRole = "super_admin" | "finance_content" | "sales_support";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuthUser {
  id: string;
  profileCode: string;
  profileFor?: string;
  name: string;
  gender: "male" | "female";
  dob?: string;
  religion?: string;
  email?: string;
  mobile?: string;
  status: MemberStatus;
  rejectionReason?: string | null;
  role: "user" | "admin";
  avatarUrl: string | null;
  profileCompletion: number;
  isPremium: boolean;
  planId: string | null;
  unreadMessages: number;
  unreadNotifications: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin";
  adminRole: AdminRole;
  permissions: string[];
}

export interface ProfilePhoto {
  id: string;
  url: string;
  isPrimary: boolean;
  status?: "pending" | "approved" | "rejected";
}

export interface OwnProfile {
  id: string;
  profileCode: string;
  status: MemberStatus;
  rejectionReason: string | null;
  profileFor: string;
  name: string;
  gender: "male" | "female";
  dob: string;
  religion: string;
  mobile: string;
  email: string;
  heightCm: number | null;
  bodyType?: string;
  maritalStatus: string;
  motherTongue: string;
  state: string;
  district: string;
  place: string;
  pincode: string;
  houseName: string;
  landmark: string;
  mapLink: string;
  addressVisibility: string;
  community: string;
  subCommunity: string;
  education: string;
  college: string;
  occupation: string;
  employer: string;
  income: string;
  workLocation: string;
  fatherOccupation: string;
  motherOccupation: string;
  siblings: string;
  familyType: string;
  familyStatus: string;
  star: string;
  rasi: string;
  dosham: string;
  timeOfBirth: string;
  placeOfBirth: string;
  diet: string;
  smoking: string;
  drinking: string;
  about: string;
  photos: ProfilePhoto[];
  idVerification: {
    id?: string;
    status: "not_submitted" | "pending" | "approved" | "rejected";
    reviewedAt?: string | null;
  };
  pendingEditRequests: Array<{
    id: string;
    changes: Record<string, { before: string; after: string }>;
    status: string;
    createdAt: string;
  }>;
}

export interface MemberCard {
  id: string;
  profileCode: string;
  name: string;
  gender: "male" | "female";
  age: number;
  religion: string;
  community: string;
  heightCm: number | null;
  bodyType?: string;
  maritalStatus: string;
  district: string;
  place: string;
  state: string;
  education: string;
  occupation: string;
  star: string;
  rasi: string;
  avatarUrl: string | null;
  matchScore?: number;
  note?: string;
  shortlistedAt?: string;
  viewedAt?: string;
  masked?: boolean;
}

export interface HoroscopeItem {
  name: string;
  matched: boolean;
  note: string;
}

export interface HoroscopeMatch {
  available: boolean;
  message?: string;
  total: number | null;
  max: number;
  verdict: string | null;
  bride?: { star: string; rasi: string };
  groom?: { star: string; rasi: string };
  items: HoroscopeItem[];
}

export interface MemberDetail {
  id: string;
  profileCode: string;
  profileFor: string;
  name: string;
  gender: "male" | "female";
  age: number;
  religion: string;
  community: string;
  subCommunity: string;
  heightCm: number | null;
  bodyType?: string;
  maritalStatus: string;
  motherTongue: string;
  state: string;
  district: string;
  place: string;
  education: string;
  college: string;
  occupation: string;
  employer: string;
  income: string;
  workLocation: string;
  fatherOccupation: string;
  motherOccupation: string;
  siblings: string;
  familyType: string;
  familyStatus: string;
  star: string;
  rasi: string;
  dosham: string;
  timeOfBirth: string;
  placeOfBirth: string;
  diet: string;
  smoking: string;
  drinking: string;
  about: string;
  idVerified: boolean;
  photos: ProfilePhoto[];
  isShortlisted: boolean;
  interest: {
    id: string;
    status: "pending" | "accepted" | "declined";
    direction: "sent" | "received";
  } | null;
  contactUnlocked: boolean;
  horoscope: HoroscopeMatch;
  contact: {
    mobile: string;
    email: string;
    houseName: string;
    landmark: string;
    pincode: string;
    mapLink: string;
  } | null;
}

export interface PartnerPreferences {
  ageMin: number;
  ageMax: number;
  heightMin: number;
  heightMax: number;
  religion: string;
  community: string;
  districts: string[];
  education: string;
  maritalStatus: string;
  diet: string;
  dosham: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: Record<string, string | number | boolean>;
  createdAt: string;
}

export interface InterestItem {
  id: string;
  status: "pending" | "accepted" | "declined";
  note: string;
  createdAt: string;
  member: MemberCard;
}

export interface MaskedViewer {
  id: null;
  name: string;
  district: string;
  viewedAt: string;
  masked: true;
}

export interface BlockItem {
  blockedId: string;
  name: string;
  profileCode: string;
  blockedAt: string;
}

export interface ConversationSummary {
  id: string;
  member: {
    id: string;
    name: string;
    profileCode: string;
    avatarUrl: string | null;
    online: boolean;
  };
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  kind: string;
  title: string;
  body: string;
  link: string;
  readAt: string | null;
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  blurb?: string;
  months: number;
  periodLabel?: string;
  priceInr: number;
  contactsLimit: number;
  ctaLabel?: string;
  popular?: boolean;
  active?: boolean;
  sortOrder?: number;
  features: string[];
}

export interface CouponBreakdown {
  couponCode: string | null;
  subtotalInr: number;
  discountInr: number;
  gstInr: number;
  totalInr: number;
}

export interface OrderResponse {
  orderRef: string;
  razorpayOrderId: string;
  razorpayKeyId: string;
  currency: string;
  amountPaise: number;
  plan: Plan;
  breakdown: CouponBreakdown;
}

export interface Subscription {
  id: string;
  planId: string;
  contactsLimit: number;
  contactsUsed: number;
  startsAt: string;
  expiresAt: string;
  status: "active" | "expired" | "cancelled";
}

export interface InvoiceItem {
  id: string;
  orderRef: string;
  planId: string;
  months: number;
  subtotalInr: number;
  discountInr: number;
  gstInr: number;
  amountInr: number;
  couponCode: string | null;
  status: "created" | "success" | "failed" | "refunded";
  paymentId: string | null;
  createdAt: string;
}

export interface UserSettings {
  showPhotoTo: "everyone" | "members" | "accepted";
  showContactTo: "accepted_premium" | "accepted" | "none";
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  hideProfile: boolean;
  notifyInterests: boolean;
  notifyMessages: boolean;
  notifyProfileViews: boolean;
  notifyEmail: boolean;
}

export interface SupportTicket {
  id: string;
  category: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: string;
}

export interface AdminStats {
  pendingApprovals: number;
  activeMembers: number;
  newMembersThisWeek: number;
  premiumMembers: number;
  revenueThisMonthInr: number | null;
  revenueTotalInr: number | null;
  openReports: number;
  openSupportTickets: number;
}

export interface PendingApprovalProfile {
  id: string;
  profileCode: string | null;
  profileFor: string;
  name: string;
  gender: "male" | "female";
  dob: string;
  religion: string;
  mobile: string;
  email: string;
  status: string;
  district: string;
  place: string;
  community: string;
  education: string;
  occupation: string;
  about: string;
  photos: ProfilePhoto[];
  createdAt: string;
}

export interface ProfileEditRequestItem {
  id: string;
  userId: string;
  memberName: string;
  profileCode: string;
  email: string;
  mobile: string;
  changes: Record<string, { before: string; after: string }>;
  status: string;
  createdAt: string;
}

export interface AdminMember {
  id: string;
  profileCode: string;
  name: string;
  gender: "male" | "female";
  dob: string;
  religion: string;
  mobile: string;
  email: string;
  district: string;
  community: string;
  status: MemberStatus;
  suspensionReason: string | null;
  activePlan: string;
  createdAt: string;
}

export interface AdminPayment {
  id: string;
  orderRef: string;
  userId: string;
  memberName: string;
  memberEmail: string;
  profileCode: string;
  planId: string;
  months: number;
  subtotalInr: number;
  discountInr: number;
  gstInr: number;
  amountInr: number;
  couponCode: string | null;
  status: "created" | "success" | "failed" | "refunded";
  paymentId: string | null;
  createdAt: string;
}

export interface AdminReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedName: string;
  reportedProfileCode: string;
  reason: string;
  note: string;
  status: "open" | "resolved" | "dismissed";
  createdAt: string;
}

export interface AdminSupportTicket {
  id: string;
  userId: string;
  memberName: string;
  memberEmail: string;
  category: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  adminReply: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStaffMember {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  adminRole: AdminRole;
  permissions: string[];
  status: string;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
}

export interface CouponLimits {
  maxPercentDiscount: number;
  maxFlatDiscountInr: number;
  requireExpiryDate: boolean;
  requireUsageLimit: boolean;
  maxValidityDays: number;
}

export interface AdminCoupon {
  id: string;
  code: string;
  discountType: "percent" | "flat";
  discountValue: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
}

export type CallQueueType = "new" | "incomplete" | "free" | "expiring" | "followups";

export type CallOutcome =
  | "answered"
  | "no_answer"
  | "interested"
  | "not_interested"
  | "call_back_later"
  | "wrong_number";

export interface CallQueueMember {
  id: string;
  name: string;
  profileCode: string;
  mobile: string;
  status: string;
  district: string;
  activePlan: string;
  planExpiresAt: string | null;
  profileCompletion: number;
  lastCallOutcome: CallOutcome | null;
  lastCallAt: string | null;
  nextFollowUpAt: string | null;
  createdAt: string;
}

export interface CallLogItem {
  id: string;
  memberId: string;
  staffId: string;
  staffName: string;
  outcome: CallOutcome;
  note: string;
  followUpAt: string | null;
  createdAt: string;
}

export interface ContentBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  publicId: string | null;
  link: string;
  active: boolean;
  sortOrder: number;
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
}

export interface ContentFaq {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
}

export interface ContentStory {
  id: string;
  coupleNames: string;
  story: string;
  photoUrl: string;
  publicId: string | null;
  weddingDate: string | null;
  status: "pending" | "published" | "hidden";
  createdAt: string;
}

export interface ContentAnnouncement {
  id: string;
  title: string;
  message: string;
  audience: "all" | "free" | "premium";
  sentAt: string | null;
  recipientCount: number;
  sentByName: string | null;
  createdAt: string;
}

export interface ReviewItem {
  id: string;
  userId: string | null;
  name: string;
  place: string;
  rating: number;
  comment: string;
  photoUrl: string;
  publicId: string | null;
  photoFit?: "cover" | "contain";
  photoPosition?: string;
  photoZoom?: number;
  photoHeight?: number;
  status: "pending" | "approved" | "rejected";
  promotedStoryId: string | null;
  createdAt: string;
}
