from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer


def markdown_to_story(markdown_text: str):
    styles = getSampleStyleSheet()
    normal = ParagraphStyle(
        "NormalCustom",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10.5,
        leading=14,
        spaceAfter=6,
    )
    h1 = ParagraphStyle(
        "H1Custom",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=15,
        leading=18,
        textColor=colors.black,
        spaceBefore=6,
        spaceAfter=10,
    )
    h2 = ParagraphStyle(
        "H2Custom",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=15,
        textColor=colors.black,
        spaceBefore=6,
        spaceAfter=6,
    )
    bullet = ParagraphStyle(
        "BulletCustom",
        parent=normal,
        leftIndent=14,
        bulletIndent=4,
        spaceAfter=2,
    )

    story = []
    for raw_line in markdown_text.splitlines():
        line = raw_line.strip()
        if not line:
            story.append(Spacer(1, 4))
            continue
        if line.startswith("# "):
            story.append(Paragraph(line[2:].strip(), h1))
            continue
        if line.startswith("## "):
            story.append(Paragraph(line[3:].strip(), h2))
            continue
        if line.startswith("- "):
            text = line[2:].strip().replace("<", "&lt;").replace(">", "&gt;")
            story.append(Paragraph(text, bullet, bulletText="•"))
            continue

        text = line.replace("<", "&lt;").replace(">", "&gt;")
        story.append(Paragraph(text, normal))
    return story


def main():
    root = Path(__file__).resolve().parent
    input_md = root / "AITor_Evaluation_Plan.md"
    output_pdf = root / "AITor_Evaluation_Plan.pdf"

    content = input_md.read_text(encoding="utf-8")
    story = markdown_to_story(content)

    doc = SimpleDocTemplate(
        str(output_pdf),
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        title="AITor Evaluation Plan",
        author="Nethsara Liyanage",
    )
    doc.build(story)
    print(f"Generated: {output_pdf}")


if __name__ == "__main__":
    main()
