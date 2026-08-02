import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const loadImage = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = src;
  });
};

export const generateSwaangLetter = async (data: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. 🎭 HEADER BRANDING
  doc.setFillColor(255, 95, 95); 
  doc.rect(0, 0, pageWidth, 15, "F");

  // Load and add logos
  try {
    const sstcLogo = await loadImage("/sstc-logo.png");
    const swaangLogo = await loadImage("/swaang-logo.png");
    
    // Perfectly aligned 20mm from left/right margins, 22x22mm size
    doc.addImage(sstcLogo, "PNG", 20, 18, 22, 22);
    
    // Draw a circular border around the SSTC logo to match the Swaang logo
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.6);
    doc.circle(31, 29, 11.5, "S"); // Center X: 20 + 11, Center Y: 18 + 11

    doc.addImage(swaangLogo, "PNG", pageWidth - 42, 18, 22, 22);
  } catch (err) {
    console.error("Failed to load logos for PDF", err);
  }

  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.text("SWAANG: THE DRAMATIC SOCIETY", pageWidth / 2, 28, { align: "center" });
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("SHRI SHANKARACHARYA TECHNICAL CAMPUS, BHILAI", pageWidth / 2, 34, { align: "center" });
  
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(20, 44, pageWidth - 20, 44); 

  // 2. 📅 METADATA
  doc.setFontSize(10);
  doc.text(`Ref: SW/${new Date().getFullYear()}/${Math.floor(Math.random() * 900) + 100}`, 20, 52);
  
  // Format Date gracefully (e.g. 20-Aug-2026)
  const d = new Date();
  const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  doc.text(`Date: ${dateStr}`, pageWidth - 20, 52, { align: "right" });

  let currentY = 60;

  // 🔥 URGENT STAMP
  if (data.isUrgent) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 95, 95);
    doc.setFontSize(12);
    
    // Draw box
    doc.setDrawColor(255, 95, 95);
    doc.setLineWidth(0.8);
    doc.rect((pageWidth / 2) - 35, currentY, 70, 10);
    
    // Text inside box
    doc.text("URGENT / HIGH PRIORITY", pageWidth / 2, currentY + 7, { align: "center" });
    
    doc.setTextColor(0, 0, 0); // Reset color
    currentY += 18; // push everything else down
  }

  // 3. ✉️ RECIPIENT
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("TO,", 20, currentY);
  doc.text(data.recipient.toUpperCase(), 20, currentY + 6);
  doc.text("SSTC, BHILAI (C.G.)", 20, currentY + 12);
  currentY += 25;

  // 4. 📌 SUBJECT
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`SUBJECT: ${data.subject.toUpperCase()}`, pageWidth / 2, currentY, { align: "center" });
  doc.setLineWidth(0.2);
  const subjectWidth = doc.getTextWidth(`SUBJECT: ${data.subject.toUpperCase()}`);
  doc.line((pageWidth / 2) - (subjectWidth / 2), currentY + 2, (pageWidth / 2) + (subjectWidth / 2), currentY + 2);
  currentY += 15;

  // 5. 📝 BODY CONTENT
  doc.setFontSize(11);
  doc.setFont("times", "normal");
  
  // Format the event date gracefully
  let eventDateFormatted = data.date;
  if (data.date) {
    const ed = new Date(data.date);
    if (!isNaN(ed.getTime())) {
      eventDateFormatted = ed.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  }

  let bodyText = `Respected Sir/Ma'am,\n\nI am writing to you on behalf of Swaang regarding the upcoming "${data.eventName}". ${data.description}\n\nWe request your formal approval for the event to be held at ${data.venue} on ${eventDateFormatted}. The session is scheduled from ${data.time}.`;
  
  if (data.students && data.students.length > 0) {
    bodyText += ` Below is the list of students required for the successful execution of the same:`;
  }
  
  const splitText = doc.splitTextToSize(bodyText, pageWidth - 40);
  
  // Add a slight line-height / spacing for readability, remove justify to fix layout issues
  doc.text(splitText, 20, currentY, { lineHeightFactor: 1.5 });
  
  // Calculate new Y based on text height
  const textDims = doc.getTextDimensions(splitText, { lineHeightFactor: 1.5 });
  currentY += textDims.h + 15;

  // 6. 👥 STUDENT TABLE (Conditionally render)
  if (data.students && data.students.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['S.NO', 'STUDENT NAME', 'ROLL NO', 'BRANCH & YEAR']],
      body: data.students.map((s: any, i: number) => [i + 1, s.name.toUpperCase(), s.roll, s.branch.toUpperCase()]),
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });
    currentY = (doc as any).lastAutoTable.finalY + 20;
  }
  
  // 7. ✍️ DYNAMIC SIGNATORY (Seal removed per user request)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(data.signatoryName.toUpperCase(), 20, currentY + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(data.designation, 20, currentY + 11);
  doc.text("Swaang: The Dramatic Society", 20, currentY + 16);
  doc.text("SSTC, Bhilai", 20, currentY + 21);

  doc.save(`Swaang_${data.eventName.replace(/\s+/g, '_')}.pdf`);
};