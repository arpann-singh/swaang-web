import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateSwaangLetter = (data: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. 🎭 HEADER BRANDING
  doc.setFillColor(255, 95, 95); 
  doc.rect(0, 0, pageWidth, 15, "F");

  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.text("SWAANG: THE DRAMATIC SOCIETY", pageWidth / 2, 30, { align: "center" });
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("SHRI SHANKARACHARYA TECHNICAL CAMPUS, BHILAI", pageWidth / 2, 36, { align: "center" });
  doc.line(20, 40, pageWidth - 20, 40); 

  // 2. 📅 METADATA
  doc.setFontSize(10);
  doc.text(`Ref: SW/${new Date().getFullYear()}/${Math.floor(Math.random() * 900) + 100}`, 20, 48);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 20, 48, { align: "right" });

  // 3. ✉️ RECIPIENT & SUBJECT
  doc.setFont("helvetica", "bold");
  doc.text("TO,", 20, 60);
  doc.text(data.recipient.toUpperCase(), 20, 65);
  doc.text("SSTC, BHILAI (C.G.)", 20, 70);

  doc.setFontSize(11);
  doc.text(`SUBJECT: ${data.subject.toUpperCase()}`, pageWidth / 2, 85, { align: "center" });
  doc.line(pageWidth / 2 - 40, 86, pageWidth / 2 + 40, 86);

  // 4. 📝 BODY CONTENT
  doc.setFont("times", "normal");
  const bodyText = `Respected Sir/Ma'am,\n\nI am writing to you on behalf of Swaang regarding the upcoming "${data.eventName}". ${data.description}\n\nWe request your formal approval for the event to be held at ${data.venue} on ${data.date}. The session is scheduled from ${data.time}. Below is the list of students required for the successful execution of the same:`;
  
  const splitText = doc.splitTextToSize(bodyText, pageWidth - 40);
  doc.text(splitText, 20, 95);

  // 5. 👥 STUDENT TABLE
  autoTable(doc, {
    startY: 135,
    head: [['S.NO', 'STUDENT NAME', 'ROLL NO', 'BRANCH & YEAR']],
    body: data.students.map((s: any, i: number) => [i + 1, s.name.toUpperCase(), s.roll, s.branch.toUpperCase()]),
    theme: 'striped',
    headStyles: { fillColor: [45, 45, 45] },
    styles: { fontSize: 8 }
  });

  // 6. ✍️ DYNAMIC SIGNATORY & SEAL
  const finalY = (doc as any).lastAutoTable.finalY + 25;
  
  doc.setFont("helvetica", "bold");
  doc.text(data.signatoryName.toUpperCase(), 20, finalY + 5);
  doc.setFont("helvetica", "normal");
  doc.text(data.designation, 20, finalY + 10);
  doc.text("SWAANG, SSTC Bhilai", 20, finalY + 15);

  // Official Seal Vector
  doc.setDrawColor(255, 95, 95);
  doc.circle(pageWidth - 45, finalY + 5, 12, "D");
  doc.setFontSize(6);
  doc.text("OFFICIAL SEAL", pageWidth - 45, finalY + 5, { align: "center" });

  doc.save(`Swaang_${data.eventName.replace(/\s+/g, '_')}.pdf`);
};