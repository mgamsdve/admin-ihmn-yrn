import * as Excel from "exceljs";
import { BorderStyle } from "exceljs";
import { saveAs } from "file-saver";

const createXLSX = async (students, profDuCour, NomDuCour, DateDuCour) => {
  const studentss = [
    "Dayani Mikey",
    "RayanDP",
    "Dayani Poty Mael",
    "Dayani Mikey",
    "RayanDP",
    "Dayani Poty Mael",
    "Dayani Mikey",
    "RayanDP",
  ];
  console.log(students);
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet("TEST1");

  // Set column widths
  worksheet.columns = [
    { width: 4 },
    { width: 24.5 },
    { width: 34.63 },
    { width: 21.0 },
  ];

  const imageUrl = "/bzg.png";
  const response = await fetch(imageUrl);
  const buffers = await response.arrayBuffer();
  const imageId = workbook.addImage({
    buffer: buffers,
    extension: "png",
  });
  worksheet.addImage(imageId, {
    tl: { col: 2, row: 0 },
    ext: { width: 220, height: 120 },
  });
  worksheet.addRow([]);
  worksheet.addRow([]);

  worksheet.addRow(["Liste des Présences"]);
  worksheet.addRow([]);

  worksheet.addRow([`${NomDuCour}`]);
  worksheet.addRow([]);

  worksheet.addRow([`${profDuCour}`]);
  worksheet.addRow([]);

  worksheet.addRow([`${DateDuCour}`]);
  worksheet.addRow([]);
  worksheet.addRow(["", "NOM et PRENOM", "Remarque", "Signature"]);

  // Merge cells
  worksheet.mergeCells("A1:D1");
  worksheet.mergeCells("A3:D3");
  worksheet.mergeCells("A5:D5");
  worksheet.mergeCells("A7:D8");

  worksheet.mergeCells("A9:D9");

  // Add border to cells
  const borderStyle: Partial<Excel.Borders> = {
    top: { style: "thin" as BorderStyle, color: { argb: "FF000000" } },
    left: { style: "thin" as BorderStyle, color: { argb: "FF000000" } },
    bottom: { style: "thin" as BorderStyle, color: { argb: "FF000000" } },
    right: { style: "thin" as BorderStyle, color: { argb: "FF000000" } },
  };
  const cells = ["A11", "B11", "C11", "D11"];
  let rowNumber = 12;
  students.forEach((student) => {
    worksheet.addRow([rowNumber - 11, student]);

    cells.push(
      `A${rowNumber}`,
      `B${rowNumber}`,
      `C${rowNumber}`,
      `D${rowNumber}`
    );
    const rowstud = worksheet.getRow(rowNumber);
    rowstud.height = 20;

    rowNumber++;
  });
  cells.forEach((cell) => {
    worksheet.getCell(cell).border = borderStyle;
  });
  const row1 = worksheet.getRow(1);
  row1.height = 100;
  const cell1 = row1.getCell(1);
  cell1.alignment = { vertical: "middle", horizontal: "center" };

  const row3 = worksheet.getRow(3);
  row3.height = 20;
  const cell3 = row3.getCell(1);
  cell3.font = { name: "Arial", size: 16, underline: "single" };
  cell3.alignment = { vertical: "middle", horizontal: "center" };

  const row5 = worksheet.getRow(5);
  row5.height = 26;
  const cell5 = row5.getCell(1);
  cell5.font = { name: "Arial", size: 20, bold: true };
  cell5.alignment = { vertical: "middle", horizontal: "center" };

  const row7 = worksheet.getRow(7);
  row7.height = 19;
  const cell7 = row7.getCell(1);
  cell7.font = { name: "Arial", size: 13, bold: true };
  cell7.alignment = { vertical: "middle", horizontal: "center" };

  const row9 = worksheet.getRow(9);
  row9.height = 19;
  const cell9 = row9.getCell(1);
  cell9.font = { name: "Arial", size: 18 };
  cell9.alignment = { vertical: "middle", horizontal: "center" };

  const row11 = worksheet.getRow(11);
  row11.height = 30;
  const cell11 = row11.getCell(2);
  cell11.font = { name: "Arial", size: 12, bold: true };
  cell11.alignment = { vertical: "middle", horizontal: "center" };
  const cell113 = row11.getCell(3);
  cell113.font = { name: "Arial", size: 12, bold: true };
  cell113.alignment = { vertical: "middle", horizontal: "center" };
  const cell114 = row11.getCell(4);
  cell114.font = { name: "Arial", size: 12, bold: true };
  cell114.alignment = { vertical: "middle", horizontal: "center" };
  // Save the workbook
  const buffer = await workbook.xlsx.writeBuffer();
  // Save the buffer as a file on the user's computer
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `FICHE-DE-PRESENCE-${NomDuCour}-${DateDuCour}.xlsx`);
};

export default createXLSX;
