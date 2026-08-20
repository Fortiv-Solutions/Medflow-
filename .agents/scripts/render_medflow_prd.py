from pathlib import Path

import fitz


pdf_path = Path("attached_assets/MedFlow(prd)_1786864429943.pdf")
output_dir = Path(".agents/outputs/medflow-prd")
output_dir.mkdir(parents=True, exist_ok=True)

document = fitz.open(pdf_path)
for index, page in enumerate(document):
    pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
    pixmap.save(output_dir / f"page-{index + 1:02d}.png")
    text = page.get_text("text")
    (output_dir / f"page-{index + 1:02d}.txt").write_text(text, encoding="utf-8")

print(f"Rendered {len(document)} pages to {output_dir}")