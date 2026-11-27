"use client";
// app/invoices/page.tsx — current plan and payment history
import Link from "next/link";
import PageShell from "../components/PageShell";

type Inv = { id: string; date: string; plan: string; amount: number; status: "Paid" | "Refunded" | "Failed" };
const PLAN = { name: "Diamond", validTill: "24 May 2027" } as { name: string; validTill: string } | null; // TODO: from your API, null for free members
// TODO: GET /api/invoices. Build the PDF on the server; the download link should be a signed, login-protected URL.
const ROWS: Inv[] = [
  { id: "SM-48201733", date: "24 Nov 2026", plan: "Diamond · 6 months", amount: 5899, status: "Paid" },
  { id: "SM-48160211", date: "02 Sep 2026", plan: "Gold · 3 months", amount: 3539, status: "Refunded" },
  { id: "SM-48151870", date: "02 Sep 2026", plan: "Gold · 3 months", amount: 3539, status: "Failed" },
];
const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
const rs = (n: number) => "Rs. " + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Loads /logo-white.png and flattens it onto the invoice header maroon (#6B1530) as raw JPEG bytes for PDF embedding. */
async function loadLogoJpeg(): Promise<{ bytes: Uint8Array; w: number; h: number } | null> {
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = "/logo-white.png";
    });
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#6B1530";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.96);
    const bin = atob(dataUrl.split(",")[1]);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return { bytes, w, h };
  } catch {
    return null;
  }
}

/** Builds a clean, valid PDF 1.4 GST invoice with the real Sammatham logo embedded. */
function buildInvoicePdf(inv: Inv, logo: { bytes: Uint8Array; w: number; h: number } | null): Blob {
  const esc = (s: string) => s.replace(/[^\x20-\x7E]/g, "-").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const taxable = +(inv.amount / 1.18).toFixed(2);
  const gst = +(inv.amount - taxable).toFixed(2);
  const cmds: string[] = [];
  const text = (x: number, y: number, s: string, size = 11, bold = false, rgb = "0.12 0.09 0.10") => {
    cmds.push(`BT /${bold ? "F2" : "F1"} ${size} Tf ${rgb} rg 1 0 0 1 ${x} ${y} Tm (${esc(s)}) Tj ET`);
  };
  const rect = (x: number, y: number, w: number, h: number, rgb: string) => {
    cmds.push(`${rgb} rg ${x} ${y} ${w} ${h} re f`);
  };
  const line = (x1: number, y1: number, x2: number, y2: number, rgb = "0.90 0.88 0.87") => {
    cmds.push(`${rgb} RG 0.8 w ${x1} ${y1} m ${x2} ${y2} l S`);
  };

  // Top maroon header banner (#6B1530 = 107/255, 21/255, 48/255)
  rect(0, 738, 595, 104, "0.4196 0.0824 0.1882");
  if (logo) {
    const drawH = 74;
    const drawW = +(drawH * (logo.w / logo.h)).toFixed(2);
    cmds.push(`q ${drawW} 0 0 ${drawH} 48 753 cm /Im1 Do Q`);
  } else {
    text(48, 796, "SAMMATHAM", 22, true, "1 1 1");
    text(48, 776, "Find Your Life Partner", 9.5, false, "0.96 0.86 0.89");
  }
  text(435, 798, "TAX INVOICE", 16, true, "1 1 1");
  text(435, 778, `Status: ${inv.status.toUpperCase()}`, 10, false, "0.96 0.86 0.89");

  // Invoice metadata box
  rect(48, 644, 499, 74, "0.98 0.95 0.96");
  text(64, 696, "Billed To", 9, true, "0.43 0.39 0.40");
  text(64, 680, "Krishnendu (Member)", 12, true);
  text(64, 662, "Sammatham Registered Account", 10, false, "0.43 0.39 0.40");

  text(340, 696, "Invoice / Order ID:", 9.5, true, "0.43 0.39 0.40");
  text(448, 696, inv.id, 10, true);
  text(340, 678, "Invoice Date:", 9.5, true, "0.43 0.39 0.40");
  text(448, 678, inv.date, 10, false);
  text(340, 660, "Valid Until:", 9.5, true, "0.43 0.39 0.40");
  text(448, 660, PLAN?.validTill ?? "-", 10, false);

  // Itemized table header
  rect(48, 592, 499, 28, "0.4196 0.0824 0.1882");
  text(64, 602, "Description", 10, true, "1 1 1");
  text(320, 602, "Qty", 10, true, "1 1 1");
  text(440, 602, "Amount (INR)", 10, true, "1 1 1");

  // Item row
  text(64, 566, `Sammatham Membership - ${inv.plan}`, 11, true);
  text(64, 550, "Non-recurring membership plan (does not auto-renew)", 9.5, false, "0.43 0.39 0.40");
  text(324, 566, "1", 11, false);
  text(440, 566, rs(taxable), 11, false);
  line(48, 534, 547, 534);

  // Totals
  text(330, 510, "Taxable Value", 10.5, false, "0.43 0.39 0.40");
  text(440, 510, rs(taxable), 10.5, false);
  text(330, 490, "GST (18%)", 10.5, false, "0.43 0.39 0.40");
  text(440, 490, rs(gst), 10.5, false);
  line(325, 478, 547, 478, "0.4196 0.0824 0.1882");

  rect(325, 442, 222, 30, "0.98 0.95 0.96");
  text(335, 453, "Total Paid", 12, true, "0.4196 0.0824 0.1882");
  text(440, 453, rs(inv.amount), 12, true, "0.4196 0.0824 0.1882");

  // Footer note
  line(48, 120, 547, 120);
  text(48, 98, "Thank you for choosing Sammatham.", 10.5, true, "0.4196 0.0824 0.1882");
  text(48, 82, "This is a computer-generated invoice and does not require a physical signature.", 9, false, "0.43 0.39 0.40");
  text(48, 68, "Support: help@sammatham.com  |  https://sammatham.com", 9, false, "0.43 0.39 0.40");

  const enc = new TextEncoder();
  const streamBytes = enc.encode(cmds.join("\n"));
  const parts: BlobPart[] = [];
  let offset = 0;
  const pushStr = (s: string) => { const b = enc.encode(s); parts.push(b); offset += b.length; };
  const pushBin = (b: Uint8Array<ArrayBuffer>) => { parts.push(b); offset += b.length; };

  pushStr("%PDF-1.4\n");
  const offsets: number[] = [0];
  const pushObj = (body: string) => { offsets.push(offset); pushStr(body); };

  pushObj("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  pushObj("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  pushObj(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >>${logo ? " /XObject << /Im1 7 0 R >>" : ""} >> /Contents 6 0 R >>\nendobj\n`,
  );
  pushObj("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");
  pushObj("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n");

  offsets.push(offset);
  pushStr(`6 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n`);
  pushBin(streamBytes);
  pushStr("\nendstream\nendobj\n");

  if (logo) {
    offsets.push(offset);
    pushStr(`7 0 obj\n<< /Type /XObject /Subtype /Image /Width ${logo.w} /Height ${logo.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logo.bytes.length} >>\nstream\n`);
    pushBin(logo.bytes as Uint8Array<ArrayBuffer>);
    pushStr("\nendstream\nendobj\n");
  }

  const xrefPos = offset;
  let xref = `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  pushStr(xref);
  return new Blob(parts, { type: "application/pdf" });
}

async function downloadInvoice(inv: Inv) {
  const logo = await loadLogoJpeg();
  const url = URL.createObjectURL(buildInvoicePdf(inv, logo));
  const a = document.createElement("a");
  a.href = url;
  a.download = `Sammatham-Invoice-${inv.id}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Invoices() {
  return (
    <PageShell>
      <h1 className="pg__h">Payments and invoices</h1>
      <section className="card upsell">
        {PLAN ? <div><b>{PLAN.name} plan</b><p className="muted">Active until {PLAN.validTill}. It will not renew on its own.</p></div> : <div><b>Free plan</b><p className="muted">Upgrade to chat and see contact numbers.</p></div>}
        <Link href="/plans" className="btn btn--solid">{PLAN ? "Extend or upgrade" : "See plans"}</Link>
      </section>

      {ROWS.length === 0 ? <div className="card empty"><p className="muted">No payments yet.</p></div> : (
        <section className="card tw"><table><thead><tr><th>Order</th><th>Date</th><th>Plan</th><th>Amount</th><th>Status</th><th><span className="sr-only">Invoice</span></th></tr></thead>
          <tbody>{ROWS.map((r) => (<tr key={r.id}><td>{r.id}</td><td>{r.date}</td><td>{r.plan}</td><td>{inr(r.amount)}</td>
            <td><span className={`bdg ${r.status === "Paid" ? "" : r.status === "Failed" ? "bdg--bad" : "bdg--muted"}`}>{r.status}</span></td>
            <td>{r.status === "Paid" && (
              <button
                type="button"
                className="inv-dl"
                onClick={() => downloadInvoice(r)}
                aria-label={`Download invoice ${r.id}`}
                title="Download invoice PDF"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            )}</td></tr>))}</tbody></table></section>)}
      <p className="muted">Questions about a payment? <Link href="/help#contact" className="link">Contact support</Link> with the order ID.</p>
    </PageShell>
  );
}