"use client";
// app/profile/page.tsx
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import type { OwnProfile } from "@/lib/types";
import { useAuth } from "../components/AuthProvider";
import Navbar from "../components/AppNavbar";
import AppFooter from "../components/AppFooter";
import "../styles/dashboard.css"; // shared theme
import "./profile.css";

type Photo = { id: string; url: string; file?: File };

const KERALA_DISTRICTS = ["Alappuzha","Ernakulam","Idukki","Kannur","Kasaragod","Kollam","Kottayam","Kozhikode","Malappuram","Palakkad","Pathanamthitta","Thiruvananthapuram","Thrissur","Wayanad"];
const STATES = ["Kerala","Tamil Nadu","Karnataka","Other state in India","Outside India"];
const RELIGIONS = ["Hindu","Christian","Muslim","Jain","Other"];
const STARS = ["Ashwathi","Bharani","Karthika","Rohini","Makayiram","Thiruvathira","Punartham","Pooyam","Ayilyam","Makam","Pooram","Uthram","Atham","Chithira","Chothi","Vishakham","Anizham","Thrikketta","Moolam","Pooradam","Uthradam","Thiruvonam","Avittam","Chathayam","Pooruruttathi","Uthrattathi","Revathi"];
const INCOME_RANGES = [
  "Not earning / Student",
  "Below ₹2 lakh",
  "₹2–4 lakh",
  "₹4–6 lakh",
  "₹6–8 lakh",
  "₹8–10 lakh",
  "₹10–15 lakh",
  "₹15–20 lakh",
  "₹20–30 lakh",
  "₹30–50 lakh",
  "₹50–75 lakh",
  "₹75 lakh – ₹1 crore",
  "₹1 crore and above",
  "Prefer not to say",
];
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const MAX_PHOTOS = 6;

const initial = {
  // Basic
  profileFor: "Myself", name: "", gender: "", dob: "", height: "", bodyType: "", maritalStatus: "Never married", motherTongue: "Malayalam",
  // Location
  state: "Kerala", district: "", otherDistrict: "", place: "", houseName: "", pincode: "", landmark: "", mapLink: "", addressVisibility: "Accepted matches only",
  // Community
  religion: "Hindu", community: "", subCommunity: "",
  // Education & career
  education: "", college: "", occupation: "", employer: "", income: "", workLocation: "",
  // Family
  fatherOccupation: "", motherOccupation: "", siblings: "", familyType: "Nuclear", familyStatus: "Middle class",
  // Horoscope
  star: "", rasi: "", dosham: "No dosham", birthHour: "", birthMinute: "", birthPeriod: "AM", placeOfBirth: "",
  // Lifestyle
  diet: "Vegetarian", smoking: "No", drinking: "No",
  // About
  about: "",
};
type Form = typeof initial;

function Field({ label, hint, children, wide }: { label: string; hint?: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={`field ${wide ? "field--wide" : ""}`}>
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

function SelectField({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <select value={value} onChange={onChange}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [form, setForm] = useState<Form>(initial);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [primaryId, setPrimaryId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<Photo[]>([]);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  // Load existing profile from backend on mount
  useEffect(() => {
    let active = true;
    apiFetch<{ profile: OwnProfile }>("/api/profile")
      .then(({ profile: p }) => {
        if (!active || !p) return;
        const dobStr = p.dob ? String(p.dob).slice(0, 10) : "";
        const timeMatch = (p.timeOfBirth || "").match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        const isKeralaState = (p.state || "Kerala") === "Kerala";
        setForm({
          profileFor: p.profileFor || "Myself",
          name: p.name || "",
          gender: p.gender === "female" ? "Female" : p.gender === "male" ? "Male" : "",
          dob: dobStr,
          height: p.heightCm ? String(p.heightCm) : "",
          bodyType: p.bodyType || "",
          maritalStatus: p.maritalStatus || "Never married",
          motherTongue: p.motherTongue || "Malayalam",
          state: p.state || "Kerala",
          district: isKeralaState ? p.district || "" : "",
          otherDistrict: isKeralaState ? "" : p.district || "",
          place: p.place || "",
          houseName: p.houseName || "",
          pincode: p.pincode || "",
          landmark: p.landmark || "",
          mapLink: p.mapLink || "",
          addressVisibility: p.addressVisibility || "Accepted matches only",
          religion: p.religion || "Hindu",
          community: p.community || "",
          subCommunity: p.subCommunity || "",
          education: p.education || "",
          college: p.college || "",
          occupation: p.occupation || "",
          employer: p.employer || "",
          income: p.income || "",
          workLocation: p.workLocation || "",
          fatherOccupation: p.fatherOccupation || "",
          motherOccupation: p.motherOccupation || "",
          siblings: p.siblings || "",
          familyType: p.familyType || "Nuclear",
          familyStatus: p.familyStatus || "Middle class",
          star: p.star || "",
          rasi: p.rasi || "",
          dosham: p.dosham || "No dosham",
          birthHour: timeMatch ? timeMatch[1].padStart(2, "0") : "",
          birthMinute: timeMatch ? timeMatch[2] : "",
          birthPeriod: timeMatch ? timeMatch[3].toUpperCase() : "AM",
          placeOfBirth: p.placeOfBirth || "",
          diet: p.diet || "Vegetarian",
          smoking: p.smoking || "No",
          drinking: p.drinking || "No",
          about: p.about || "",
        });
        if (Array.isArray(p.photos)) {
          setPhotos(p.photos.map((ph) => ({ id: ph.id, url: ph.url })));
          const primary = p.photos.find((ph) => ph.isPrimary) || p.photos[0];
          setPrimaryId(primary ? primary.id : null);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      photosRef.current.forEach((p) => p.file && URL.revokeObjectURL(p.url));
    };
  }, []);

  const set = (k: keyof Form) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setSaved(false);
  };

  const addPhotos = (e: ChangeEvent<HTMLInputElement>) => {
    setError("");
    const files = Array.from(e.target.files ?? []);
    const next: Photo[] = [];
    for (const file of files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setError("Only JPG, PNG or WebP photos are allowed."); continue; }
      if (file.size > 5 * 1024 * 1024) { setError("Each photo must be under 5 MB."); continue; }
      if (photos.length + next.length >= MAX_PHOTOS) { setError(`You can add up to ${MAX_PHOTOS} photos.`); break; }
      next.push({ id: crypto.randomUUID(), url: URL.createObjectURL(file), file });
    }
    if (next.length) {
      setPhotos((p) => [...p, ...next]);
      setPrimaryId((id) => id ?? next[0].id); // first photo becomes profile photo
    }
    e.target.value = "";
  };

  const removePhoto = (id: string) => {
    setPhotos((p) => {
      const rest = p.filter((x) => x.id !== id);
      if (primaryId === id) setPrimaryId(rest[0]?.id ?? null);
      return rest;
    });
  };

  const save = async () => {
    setError("");
    if (!form.name.trim() || !form.dob || !form.place.trim()) { setError("Please fill in your name, date of birth and place."); return; }
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) { setError("Pincode must be 6 digits."); return; }
    setSaving(true);
    try {
      const timeOfBirth = form.birthHour ? `${form.birthHour}:${form.birthMinute || "00"} ${form.birthPeriod}` : "";
      const payload = {
        profileFor: form.profileFor,
        name: form.name.trim(),
        dob: form.dob,
        heightCm: form.height ? Number(form.height) : undefined,
        bodyType: form.bodyType,
        maritalStatus: form.maritalStatus,
        motherTongue: form.motherTongue,
        state: form.state,
        district: form.state === "Kerala" ? form.district : form.otherDistrict,
        place: form.place.trim(),
        houseName: form.houseName,
        pincode: form.pincode,
        landmark: form.landmark,
        mapLink: form.mapLink,
        addressVisibility: form.addressVisibility,
        religion: form.religion,
        community: form.community,
        subCommunity: form.subCommunity,
        education: form.education,
        college: form.college,
        occupation: form.occupation,
        employer: form.employer,
        income: form.income,
        workLocation: form.workLocation,
        fatherOccupation: form.fatherOccupation,
        motherOccupation: form.motherOccupation,
        siblings: form.siblings,
        familyType: form.familyType,
        familyStatus: form.familyStatus,
        star: form.star,
        rasi: form.rasi,
        dosham: form.dosham,
        timeOfBirth,
        placeOfBirth: form.placeOfBirth,
        diet: form.diet,
        smoking: form.smoking,
        drinking: form.drinking,
        about: form.about,
      };

      await apiFetch("/api/profile", { method: "PUT", body: payload });

      // Upload any newly selected local photo files
      const newFiles = photos.filter((p) => p.file);
      if (newFiles.length > 0) {
        const fd = new FormData();
        newFiles.forEach((p) => p.file && fd.append("photos", p.file));
        const photoRes = await apiFetch<{ photos: { id: string; url: string; isPrimary: boolean }[] }>(
          "/api/profile/photos",
          { method: "POST", body: fd },
        );
        if (Array.isArray(photoRes.photos)) {
          setPhotos(photoRes.photos.map((ph) => ({ id: ph.id, url: ph.url })));
          const primary = photoRes.photos.find((ph) => ph.isPrimary) || photoRes.photos[0];
          setPrimaryId(primary ? primary.id : null);
        }
      }

      setSaved(true);
      await refresh();
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Could not save your profile. Check your connection and try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const isKerala = form.state === "Kerala";
  const select = (k: keyof Form, options: string[], placeholder?: string) => (
    <SelectField value={form[k]} onChange={set(k)} options={options} placeholder={placeholder} />
  );

  return (
    <div className="dash-page">
      <Navbar name={form.name || "Member"} />
      <main className="pf">
        <header className="pf__head">
          <h1>My profile</h1>
          <p className="muted">A complete profile gets more replies. Fields marked * are required.</p>
        </header>

        {/* PHOTOS */}
        <section className="card pf__sec" id="photos">
          <h2>Photos</h2>
          <p className="muted">Add up to {MAX_PHOTOS} clear photos of yourself. Choose the one shown first on your profile.</p>
          <div className="photos">
            {photos.map((p) => (
              <figure key={p.id} className={`photo-tile ${p.id === primaryId ? "is-primary" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="Your profile photo" />
                {p.id === primaryId && <span className="badge">Profile photo</span>}
                <figcaption>
                  {p.id !== primaryId && <button type="button" onClick={() => setPrimaryId(p.id)}>Set as profile photo</button>}
                  <button type="button" className="danger" onClick={() => removePhoto(p.id)}>Remove</button>
                </figcaption>
              </figure>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button type="button" className="photo-add" onClick={() => fileRef.current?.click()}>
                <b>+</b><span>Add photos</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={addPhotos} />
          <small className="muted">JPG, PNG or WebP, up to 5 MB each. Photos are checked before they appear to others.</small>
        </section>

        {/* BASIC */}
        <section className="card pf__sec">
          <h2>Basic details</h2>
          <div className="grid">
            <Field label="Profile created for">{select("profileFor", ["Myself","Son","Daughter","Brother","Sister","Relative"])}</Field>
            <Field label="Full name *"><input value={form.name} onChange={set("name")} /></Field>
            <Field label="Gender" hint="Locked after registration. Contact support to change.">
              <input value={form.gender || "—"} disabled readOnly />
            </Field>
            <Field label="Date of birth *"><input type="date" value={form.dob} onChange={set("dob")} /></Field>
            <Field label="Height (cm)"><input type="number" min={120} max={220} value={form.height} onChange={set("height")} /></Field>
            <Field label="Body type">{select("bodyType", ["Slim","Average","Athletic","Heavy"], "Select body type")}</Field>
            <Field label="Marital status">{select("maritalStatus", ["Never married","Divorced","Widowed","Awaiting divorce"])}</Field>
            <Field label="Mother tongue">{select("motherTongue", ["Malayalam","Tamil","Kannada","Hindi","English","Other"])}</Field>
          </div>
        </section>

        {/* LOCATION */}
        <section className="card pf__sec" id="location">
          <h2>Location</h2>
          <div className="grid">
            <Field label="State / country *">{select("state", STATES)}</Field>
            {isKerala
              ? <Field label="District *">{select("district", KERALA_DISTRICTS, "Select district")}</Field>
              : <Field label="District / city *"><input value={form.otherDistrict} onChange={set("otherDistrict")} /></Field>}
            <Field label="Place / town *" hint="For example Aluva, Chalakudy or Taliparamba"><input value={form.place} onChange={set("place")} /></Field>
            <Field label="Pincode"><input inputMode="numeric" maxLength={6} value={form.pincode} onChange={set("pincode")} /></Field>
            <Field label="House name" hint="Used for your address only, not shown on your public profile"><input value={form.houseName} onChange={set("houseName")} /></Field>
            <Field label="Nearest landmark"><input value={form.landmark} onChange={set("landmark")} /></Field>
            <Field label="House location (Google Maps link)" wide hint="Optional. Paste a link from Google Maps"><input type="url" placeholder="https://maps.app.goo.gl/..." value={form.mapLink} onChange={set("mapLink")} /></Field>
            <Field label="Who can see my house address and map link" wide>
              {select("addressVisibility", ["Only me","Accepted matches only","Premium members I accept"])}
            </Field>
          </div>
          <p className="note">Everyone sees your district and place. Your house name and map link stay hidden unless you allow them above.</p>
        </section>

        {/* COMMUNITY */}
        <section className="card pf__sec">
          <h2>Religion and community</h2>
          <div className="grid">
            <Field label="Religion">{select("religion", RELIGIONS)}</Field>
            <Field label="Community / caste"><input value={form.community} onChange={set("community")} /></Field>
            <Field label="Sub-community"><input value={form.subCommunity} onChange={set("subCommunity")} /></Field>
          </div>
        </section>

        {/* EDUCATION */}
        <section className="card pf__sec">
          <h2>Education and career</h2>
          <div className="grid">
            <Field label="Highest education"><input value={form.education} onChange={set("education")} placeholder="B.Tech, MBBS, MBA..." /></Field>
            <Field label="College / university"><input value={form.college} onChange={set("college")} /></Field>
            <Field label="Occupation"><input value={form.occupation} onChange={set("occupation")} /></Field>
            <Field label="Employer"><input value={form.employer} onChange={set("employer")} /></Field>
            <Field label="Annual income">{select("income", INCOME_RANGES, "Select range")}</Field>
            <Field label="Work location"><input value={form.workLocation} onChange={set("workLocation")} /></Field>
          </div>
        </section>

        {/* FAMILY */}
        <section className="card pf__sec">
          <h2>Family</h2>
          <div className="grid">
            <Field label="Father's occupation"><input value={form.fatherOccupation} onChange={set("fatherOccupation")} /></Field>
            <Field label="Mother's occupation"><input value={form.motherOccupation} onChange={set("motherOccupation")} /></Field>
            <Field label="Siblings"><input value={form.siblings} onChange={set("siblings")} placeholder="1 brother, married" /></Field>
            <Field label="Family type">{select("familyType", ["Nuclear","Joint"])}</Field>
            <Field label="Family status">{select("familyStatus", ["Middle class","Upper middle class","Affluent"])}</Field>
          </div>
        </section>

        {/* HOROSCOPE */}
        <section className="card pf__sec">
          <h2>Horoscope</h2>
          <div className="grid">
            <Field label="Star (nakshathram)">{select("star", STARS, "Select star")}</Field>
            <Field label="Rasi">{select("rasi", ["Mesham","Edavam","Mithunam","Karkidakam","Chingam","Kanni","Thulam","Vrischikam","Dhanu","Makaram","Kumbham","Meenam"], "Select rasi")}</Field>
            <Field label="Dosham">{select("dosham", ["No dosham","Chovva dosham","Other dosham","Don't know"])}</Field>
            <div className="field">
              <span>Time of birth</span>
              <div className="time-row">
                <select aria-label="Birth hour" value={form.birthHour} onChange={set("birthHour")}>
                  <option value="">Hour</option>
                  {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
                <select aria-label="Birth minute" value={form.birthMinute} onChange={set("birthMinute")}>
                  <option value="">Min</option>
                  {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <select aria-label="AM or PM" value={form.birthPeriod} onChange={set("birthPeriod")}>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
            <Field label="Place of birth"><input value={form.placeOfBirth} onChange={set("placeOfBirth")} /></Field>
          </div>
        </section>

        {/* LIFESTYLE + ABOUT */}
        <section className="card pf__sec">
          <h2>Lifestyle</h2>
          <div className="grid">
            <Field label="Diet">{select("diet", ["Vegetarian","Non-vegetarian","Eggetarian"])}</Field>
            <Field label="Smoking">{select("smoking", ["No","Occasionally","Yes"])}</Field>
            <Field label="Drinking">{select("drinking", ["No","Occasionally","Yes"])}</Field>
          </div>
        </section>

        <section className="card pf__sec">
          <h2>About me</h2>
          <Field label="Tell families about yourself" wide hint={`${form.about.length}/500`}>
            <textarea rows={5} maxLength={500} value={form.about} onChange={set("about")} />
          </Field>
        </section>

        {/* Sticky save bar */}
        <div className="savebar">
          <div className="savebar__msg" role="status">
            {error ? <span className="err">{error}</span> : saved ? <span className="ok">Profile saved</span> : <span className="muted">Unsaved changes will be lost if you leave.</span>}
          </div>
          <button type="button" className="btn btn--solid" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}