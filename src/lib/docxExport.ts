import {
  AlignmentType,
  Document,
  Packer,
  Paragraph,
  TextRun,
  PageBreak,
} from "docx";
import type { TikaUnit } from "./book";
import { parseCommentary } from "./book";

const FONT = "Noto Sans Oriya";

export async function exportBookDocx(units: TikaUnit[]) {
  const children: Paragraph[] = [];

  units.forEach((unit, index) => {
    if (index > 0) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }

    unit.verse
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .forEach((line) =>
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 60 },
            children: [new TextRun({ text: line, font: FONT, size: 26, bold: true })],
          }),
        ),
      );

    children.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 240 },
        children: [new TextRun({ text: unit.reference, font: FONT, size: 22, italics: true })],
      }),
    );

    parseCommentary(unit.commentary).forEach((block) => {
      if (block.type === "sep") {
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 },
            children: [new TextRun({ text: "●", font: FONT, size: 24 })],
          }),
        );
      } else {
        children.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 180, line: 360 },
            indent: { firstLine: 360 },
            children: [new TextRun({ text: block.text, font: FONT, size: 24 })],
          }),
        );
      }
    });
  });

  const doc = new Document({
    styles: { default: { document: { run: { font: FONT, size: 24 } } } },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: children.length
          ? children
          : [new Paragraph({ children: [new TextRun({ text: "—", font: FONT })] })],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sloka-commentary.docx";
  a.click();
  URL.revokeObjectURL(url);
}
