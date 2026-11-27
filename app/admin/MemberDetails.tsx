"use client";
// app/admin/MemberDetails.tsx — complete member record visible to admins (includes private address/contact fields)

export type FullProfile = {
  profileFor: string;
  gender: string;
  dob: string;
  age: number;
  height: string;
  maritalStatus: string;
  motherTongue: string;
  mobile: string;
  email: string;
  state: string;
  district: string;
  place: string;
  pincode: string;
  houseName: string;
  landmark: string;
  mapLink?: string;
  addressVisibility: string;
  religion: string;
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
  faceVerified: boolean;
};

function Group({ title, rows }: { title: string; rows: [string, string | undefined][] }) {
  return (
    <div className="ad-sec">
      <h3 className="ad-sec-h">{title}</h3>
      <dl className="ad-dl">
        {rows.map(([label, val]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{val && val.trim() ? val : "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function MemberDetails({ p }: { p: FullProfile }) {
  return (
    <div className="ad-full">
      <div className="ad-bio" style={{ marginTop: 0 }}>
        <small className="muted">About me</small>
        <p>{p.about || "—"}</p>
      </div>

      <Group
        title="Basic details"
        rows={[
          ["Profile created for", p.profileFor],
          ["Gender", p.gender],
          ["Date of birth", `${p.dob} (${p.age} yrs)`],
          ["Height", p.height],
          ["Marital status", p.maritalStatus],
          ["Mother tongue", p.motherTongue],
        ]}
      />

      <Group
        title="Contact & address (admin view)"
        rows={[
          ["Mobile", p.mobile],
          ["Email", p.email],
          ["State / country", p.state],
          ["District", p.district],
          ["Place / town", p.place],
          ["Pincode", p.pincode],
          ["House name", p.houseName],
          ["Nearest landmark", p.landmark],
          ["Address visibility", p.addressVisibility],
        ]}
      />
      {p.mapLink && (
        <p style={{ margin: "-6px 0 4px", fontSize: 12.5 }}>
          <a href={p.mapLink} target="_blank" rel="noreferrer" className="link">
            Open house location in Google Maps ↗
          </a>
        </p>
      )}

      <Group
        title="Religion & community"
        rows={[
          ["Religion", p.religion],
          ["Community / caste", p.community],
          ["Sub-community", p.subCommunity],
        ]}
      />

      <Group
        title="Education & career"
        rows={[
          ["Highest education", p.education],
          ["College / university", p.college],
          ["Occupation", p.occupation],
          ["Employer", p.employer],
          ["Annual income", p.income],
          ["Work location", p.workLocation],
        ]}
      />

      <Group
        title="Family"
        rows={[
          ["Father's occupation", p.fatherOccupation],
          ["Mother's occupation", p.motherOccupation],
          ["Siblings", p.siblings],
          ["Family type", p.familyType],
          ["Family status", p.familyStatus],
        ]}
      />

      <Group
        title="Horoscope"
        rows={[
          ["Star (nakshathram)", p.star],
          ["Rasi", p.rasi],
          ["Dosham", p.dosham],
          ["Time of birth", p.timeOfBirth],
          ["Place of birth", p.placeOfBirth],
        ]}
      />

      <Group
        title="Lifestyle"
        rows={[
          ["Diet", p.diet],
          ["Smoking", p.smoking],
          ["Drinking", p.drinking],
        ]}
      />
    </div>
  );
}
