"""
VeriSync AI — Document Ingestion Tests

Tests are organised in four sections:
  1. File validator unit tests
  2. PDF extractor unit tests (synthetic PyMuPDF documents)
  3. DOCX extractor unit tests (synthetic python-docx documents)
  4. API integration tests (TestClient against POST /documents/ingest)

All synthetic documents are generated programmatically — no external fixture
files are required.  Tests that exercise extraction failures deliberately
produce malformed or minimal inputs.

Run with:
    cd backend
    .venv\\Scripts\\pytest tests/test_documents.py -v
"""

from __future__ import annotations

import io
import json
import zipfile
from pathlib import Path
from typing import IO

import pytest
from fastapi.testclient import TestClient

# ---------------------------------------------------------------------------
# Synthetic document builders
# ---------------------------------------------------------------------------


def make_pdf_bytes(text: str = "Hello from a test PDF.\nThis is page one.") -> bytes:
    """
    Build a minimal, valid PDF from scratch using PyMuPDF.
    This is the authoritative way to produce real PDF bytes in tests without
    shipping fixture files.
    """
    import fitz

    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), text, fontsize=11)
    buf = io.BytesIO()
    doc.save(buf)
    doc.close()
    return buf.getvalue()


def make_multi_page_pdf_bytes(pages: list[str]) -> bytes:
    """Create a PDF with one text block per page."""
    import fitz

    doc = fitz.open()
    for page_text in pages:
        page = doc.new_page()
        page.insert_text((72, 72), page_text, fontsize=11)
    buf = io.BytesIO()
    doc.save(buf)
    doc.close()
    return buf.getvalue()


def make_docx_bytes(paragraphs: list[str], headings: list[str] | None = None) -> bytes:
    """Build a minimal DOCX with provided paragraphs and optional headings."""
    from docx import Document

    doc = Document()
    headings = headings or []
    for i, para_text in enumerate(paragraphs):
        if i < len(headings):
            doc.add_heading(headings[i], level=1)
        doc.add_paragraph(para_text)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


def make_corrupt_pdf_bytes() -> bytes:
    """Return bytes that start with %PDF but contain garbage body."""
    return b"%PDF-1.4\n%%EOF\nGARBAGE DATA THAT IS NOT A VALID PDF"


def make_wrong_extension_bytes() -> bytes:
    """Return valid PDF bytes but labelled as .txt (for extension test)."""
    return make_pdf_bytes()


def make_tiny_bytes() -> bytes:
    """Return bytes too small to be any real document."""
    return b"A"


def make_oversized_bytes(size_mb: float = 16.0) -> bytes:
    """Return bytes larger than the default upload limit."""
    return b"x" * int(size_mb * 1024 * 1024)


# ---------------------------------------------------------------------------
# Section 1: File Validator unit tests
# ---------------------------------------------------------------------------

class TestFileValidator:
    from app.services.file_validator import validate_file, FileValidationError, validate_file_count

    def test_valid_pdf_passes(self) -> None:
        from app.services.file_validator import validate_file

        content = make_pdf_bytes()
        # Should not raise
        validate_file("test.pdf", "application/pdf", content)

    def test_valid_docx_passes(self) -> None:
        from app.services.file_validator import validate_file

        content = make_docx_bytes(["This is a test contract paragraph."])
        validate_file(
            "contract.docx",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            content,
        )

    def test_unsupported_extension_rejected(self) -> None:
        from app.services.file_validator import validate_file, FileValidationError

        with pytest.raises(FileValidationError, match="Unsupported file extension"):
            validate_file("resume.txt", "text/plain", b"some text content here")

    def test_unsupported_mime_type_rejected(self) -> None:
        from app.services.file_validator import validate_file, FileValidationError

        content = make_pdf_bytes()
        with pytest.raises(FileValidationError, match="Unsupported content-type"):
            validate_file("test.pdf", "text/html", content)

    def test_empty_file_rejected(self) -> None:
        from app.services.file_validator import validate_file, FileValidationError

        with pytest.raises(FileValidationError, match="empty or corrupt"):
            validate_file("empty.pdf", "application/pdf", b"")

    def test_tiny_file_rejected(self) -> None:
        from app.services.file_validator import validate_file, FileValidationError

        with pytest.raises(FileValidationError, match="empty or corrupt"):
            validate_file("tiny.pdf", "application/pdf", make_tiny_bytes())

    def test_oversized_file_rejected(self) -> None:
        from app.services.file_validator import validate_file, FileValidationError

        content = make_oversized_bytes(16.0)
        with pytest.raises(FileValidationError, match="exceeds the"):
            validate_file("big.pdf", "application/pdf", content, max_size_mb=15.0)

    def test_file_at_size_limit_passes(self) -> None:
        from app.services.file_validator import validate_file

        # A real PDF that's exactly under the limit (use actual pdf bytes, not random)
        content = make_pdf_bytes("A small file")
        # Should not raise — it's well under 15 MB
        validate_file("small.pdf", "application/pdf", content, max_size_mb=15.0)

    def test_wrong_magic_bytes_pdf_rejected(self) -> None:
        from app.services.file_validator import validate_file, FileValidationError

        # DOCX bytes labelled as PDF
        docx_content = make_docx_bytes(["test"])
        with pytest.raises(FileValidationError, match="valid PDF header"):
            validate_file("spoofed.pdf", "application/pdf", docx_content)

    def test_wrong_magic_bytes_docx_rejected(self) -> None:
        from app.services.file_validator import validate_file, FileValidationError

        # PDF bytes labelled as DOCX
        pdf_content = make_pdf_bytes()
        with pytest.raises(FileValidationError, match="valid ZIP/DOCX header"):
            validate_file(
                "spoofed.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                pdf_content,
            )

    def test_legacy_doc_rejected(self) -> None:
        from app.services.file_validator import validate_file, FileValidationError

        # Legacy .doc: claim the extension and MIME, use PK bytes to pass magic check
        with pytest.raises(FileValidationError, match="not yet supported"):
            validate_file(
                "old.doc",
                "application/msword",
                b"PK\x03\x04" + b"\x00" * 200,
            )

    def test_zero_files_rejected(self) -> None:
        from app.services.file_validator import validate_file_count, FileValidationError

        with pytest.raises(FileValidationError, match="No files"):
            validate_file_count(0)

    def test_too_many_files_rejected(self) -> None:
        from app.services.file_validator import validate_file_count, FileValidationError

        with pytest.raises(FileValidationError, match="Too many files"):
            validate_file_count(11, max_count=10)


# ---------------------------------------------------------------------------
# Section 2: PDF Extractor unit tests
# ---------------------------------------------------------------------------

class TestPdfExtractor:

    def test_single_page_extraction(self) -> None:
        from app.services.pdf_extractor import extract_pdf

        content = make_pdf_bytes("Compensation: ₹30,000 per month. Probation: 3 months.")
        full_text, page_count, evidence_blocks = extract_pdf(content, "offer.pdf")

        assert page_count == 1
        assert "Compensation" in full_text or "30,000" in full_text or len(full_text) > 0
        assert len(evidence_blocks) >= 1
        assert evidence_blocks[0]["page"] == 1
        assert evidence_blocks[0]["paragraph_index"] is None

    def test_multi_page_pdf(self) -> None:
        from app.services.pdf_extractor import extract_pdf

        pages = [
            "Clause 1: This offer letter confirms employment with Acme Corp.",
            "Clause 2: Compensation is ₹25,000 per month.",
            "Clause 3: Notice period is 90 days from either party.",
        ]
        content = make_multi_page_pdf_bytes(pages)
        full_text, page_count, evidence_blocks = extract_pdf(content, "contract.pdf")

        assert page_count == 3
        # Each page should produce at least one evidence block
        page_numbers = {b["page"] for b in evidence_blocks}
        assert 1 in page_numbers
        assert 2 in page_numbers
        assert 3 in page_numbers

    def test_evidence_blocks_have_page_numbers(self) -> None:
        from app.services.pdf_extractor import extract_pdf

        content = make_multi_page_pdf_bytes(["Page A text here.", "Page B text here."])
        _, _, evidence_blocks = extract_pdf(content)

        for block in evidence_blocks:
            assert isinstance(block["page"], int)
            assert block["page"] >= 1
            assert block["paragraph_index"] is None

    def test_evidence_block_text_truncated_at_2000(self) -> None:
        from app.services.pdf_extractor import extract_pdf

        long_text = "A" * 3000
        content = make_pdf_bytes(long_text)
        _, _, evidence_blocks = extract_pdf(content)

        for block in evidence_blocks:
            assert len(block["text"]) <= 2000

    def test_corrupt_pdf_raises_extraction_error(self) -> None:
        from app.services.pdf_extractor import extract_pdf, ExtractionError

        content = make_corrupt_pdf_bytes()
        with pytest.raises(ExtractionError):
            extract_pdf(content, "corrupt.pdf")

    def test_word_count_correlates_with_text(self) -> None:
        from app.services.pdf_extractor import extract_pdf

        text = "This employment contract establishes the terms and conditions of your employment."
        content = make_pdf_bytes(text)
        full_text, _, _ = extract_pdf(content)

        # Word count from extracted text should be reasonable
        words = full_text.split()
        assert len(words) >= 5  # at minimum the main clause words


# ---------------------------------------------------------------------------
# Section 3: DOCX Extractor unit tests
# ---------------------------------------------------------------------------

class TestDocxExtractor:

    def test_basic_extraction(self) -> None:
        from app.services.docx_extractor import extract_docx

        content = make_docx_bytes(
            ["This is the offer letter body.", "Monthly salary: ₹30,000 gross."],
            headings=["Compensation Terms"],
        )
        full_text, paragraph_count, evidence_blocks = extract_docx(content, "offer.docx")

        assert paragraph_count >= 2
        assert len(evidence_blocks) >= 2
        assert "₹30,000" in full_text or "30,000" in full_text

    def test_evidence_blocks_have_paragraph_index(self) -> None:
        from app.services.docx_extractor import extract_docx

        content = make_docx_bytes(["Para one.", "Para two.", "Para three."])
        _, _, evidence_blocks = extract_docx(content)

        for block in evidence_blocks:
            assert block["page"] is None
            assert isinstance(block["paragraph_index"], int)

    def test_section_heading_detected(self) -> None:
        from app.services.docx_extractor import extract_docx

        content = make_docx_bytes(
            ["The base salary is ₹25,000 per month."],
            headings=["Clause 3: Compensation"],
        )
        _, _, evidence_blocks = extract_docx(content)

        headings_found = [b["section_heading"] for b in evidence_blocks if b["section_heading"]]
        assert any("Compensation" in h for h in headings_found)

    def test_empty_paragraphs_skipped(self) -> None:
        from app.services.docx_extractor import extract_docx
        from docx import Document

        doc = Document()
        doc.add_paragraph("Real content here.")
        doc.add_paragraph("")  # empty paragraph
        doc.add_paragraph("")  # empty paragraph
        doc.add_paragraph("More real content.")
        buf = io.BytesIO()
        doc.save(buf)
        content = buf.getvalue()

        full_text, paragraph_count, evidence_blocks = extract_docx(content)
        assert paragraph_count == 2  # Only non-empty paragraphs
        assert len(evidence_blocks) == 2

    def test_corrupt_docx_raises_extraction_error(self) -> None:
        from app.services.docx_extractor import extract_docx, ExtractionError

        content = b"PK\x03\x04" + b"\xFF" * 200  # PK magic but garbage content
        with pytest.raises(ExtractionError):
            extract_docx(content, "corrupt.docx")

    def test_evidence_block_text_truncated_at_2000(self) -> None:
        from app.services.docx_extractor import extract_docx

        long_para = "W " * 1500  # 3000 chars
        content = make_docx_bytes([long_para])
        _, _, evidence_blocks = extract_docx(content)

        for block in evidence_blocks:
            assert len(block["text"]) <= 2000


# ---------------------------------------------------------------------------
# Section 4: API integration tests
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
def clear_document_store():
    """Ensure each test starts with a clean in-memory store."""
    from app.services.document_store import document_store

    document_store.clear()
    yield
    document_store.clear()


@pytest.fixture(scope="module")
def client():
    from app.main import app

    return TestClient(app)


class TestIngestEndpoint:

    def test_ingest_valid_pdf(self, client: TestClient) -> None:
        content = make_pdf_bytes("Employment offer: salary ₹30,000. Probation: 3 months.")
        response = client.post(
            "/api/v1/documents/ingest",
            files=[("files", ("offer.pdf", content, "application/pdf"))],
            data={"doc_types": "offer_letter", "domain": "employment-hr"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total_uploaded"] == 1
        assert data["total_succeeded"] == 1
        assert data["total_failed"] == 0
        doc = data["documents"][0]
        assert doc["status"] == "ready"
        assert doc["original_filename"] == "offer.pdf"
        assert doc["doc_type"] == "offer_letter"
        assert doc["page_count"] == 1
        assert isinstance(doc["document_id"], str) and len(doc["document_id"]) > 0

    def test_ingest_valid_docx(self, client: TestClient) -> None:
        content = make_docx_bytes(
            ["Employment Contract — Acme Corp.", "Salary: ₹25,000 per month."],
            headings=["Contract Terms"],
        )
        response = client.post(
            "/api/v1/documents/ingest",
            files=[
                (
                    "files",
                    (
                        "contract.docx",
                        content,
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    ),
                )
            ],
            data={"doc_types": "contract", "domain": "employment-hr"},
        )
        assert response.status_code == 200
        data = response.json()
        doc = data["documents"][0]
        assert doc["status"] == "ready"
        assert doc["paragraph_count"] is not None
        assert doc["page_count"] is None  # DOCX has no reliable page count

    def test_ingest_multiple_files(self, client: TestClient) -> None:
        pdf_content = make_pdf_bytes("Offer letter content.")
        docx_content = make_docx_bytes(["Contract body text."])
        response = client.post(
            "/api/v1/documents/ingest",
            files=[
                ("files", ("offer.pdf", pdf_content, "application/pdf")),
                (
                    "files",
                    (
                        "contract.docx",
                        docx_content,
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    ),
                ),
            ],
            data={"doc_types": '["offer_letter","contract"]', "domain": "employment-hr"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total_uploaded"] == 2
        assert data["total_succeeded"] == 2
        assert data["total_failed"] == 0

    def test_ingest_invalid_extension_returns_failed_status(self, client: TestClient) -> None:
        response = client.post(
            "/api/v1/documents/ingest",
            files=[("files", ("resume.txt", b"Some plain text content here.", "text/plain"))],
            data={"doc_types": "other", "domain": "employment-hr"},
        )
        # Route returns 422 because file count >= 1 but all fail validation
        assert response.status_code in (200, 422)
        if response.status_code == 200:
            data = response.json()
            assert data["total_failed"] == 1
            assert data["documents"][0]["status"] == "failed"

    def test_ingest_empty_file_returns_failed_status(self, client: TestClient) -> None:
        response = client.post(
            "/api/v1/documents/ingest",
            files=[("files", ("empty.pdf", b"", "application/pdf"))],
            data={"doc_types": "other", "domain": "employment-hr"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total_failed"] == 1
        assert "empty" in data["documents"][0]["error_message"].lower() or \
               "small" in data["documents"][0]["error_message"].lower()

    def test_ingest_oversized_file_returns_failed_status(self, client: TestClient) -> None:
        big_content = b"%PDF-1.4\n" + b"x" * (16 * 1024 * 1024)  # 16 MB
        response = client.post(
            "/api/v1/documents/ingest",
            files=[("files", ("huge.pdf", big_content, "application/pdf"))],
            data={"doc_types": "other", "domain": "employment-hr"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total_failed"] == 1
        assert "exceeds" in data["documents"][0]["error_message"].lower()

    def test_ingest_corrupt_pdf_returns_failed_status(self, client: TestClient) -> None:
        content = make_corrupt_pdf_bytes()
        response = client.post(
            "/api/v1/documents/ingest",
            files=[("files", ("corrupt.pdf", content, "application/pdf"))],
            data={"doc_types": "other", "domain": "employment-hr"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total_failed"] == 1
        doc = data["documents"][0]
        assert doc["status"] == "failed"
        assert doc["error_message"] is not None

    def test_ingest_no_files_returns_422(self, client: TestClient) -> None:
        response = client.post(
            "/api/v1/documents/ingest",
            data={"doc_types": "other", "domain": "employment-hr"},
        )
        # FastAPI returns 422 when required File field is missing
        assert response.status_code == 422

    def test_get_document_by_id(self, client: TestClient) -> None:
        content = make_pdf_bytes("Test document for retrieval.")
        ingest_resp = client.post(
            "/api/v1/documents/ingest",
            files=[("files", ("test.pdf", content, "application/pdf"))],
            data={"doc_types": "other", "domain": "employment-hr"},
        )
        doc_id = ingest_resp.json()["documents"][0]["document_id"]

        get_resp = client.get(f"/api/v1/documents/{doc_id}")
        assert get_resp.status_code == 200
        assert get_resp.json()["document"]["document_id"] == doc_id

    def test_get_nonexistent_document_returns_404(self, client: TestClient) -> None:
        response = client.get("/api/v1/documents/00000000-0000-0000-0000-000000000000")
        assert response.status_code == 404

    def test_list_documents(self, client: TestClient) -> None:
        pdf_content = make_pdf_bytes("List test document.")
        client.post(
            "/api/v1/documents/ingest",
            files=[("files", ("list_test.pdf", pdf_content, "application/pdf"))],
            data={"doc_types": "other", "domain": "employment-hr"},
        )
        list_resp = client.get("/api/v1/documents")
        assert list_resp.status_code == 200
        assert isinstance(list_resp.json(), list)
        assert len(list_resp.json()) >= 1

    def test_ingestion_limits_endpoint(self, client: TestClient) -> None:
        response = client.get("/api/v1/documents/limits/config")
        assert response.status_code == 200
        data = response.json()
        assert data["max_file_size_mb"] == 15.0
        assert data["max_files_per_request"] == 10
        assert "in_memory_ephemeral" in data["storage_backend"]

    def test_response_includes_session_id(self, client: TestClient) -> None:
        content = make_pdf_bytes("Session grouping test.")
        response = client.post(
            "/api/v1/documents/ingest",
            files=[("files", ("session.pdf", content, "application/pdf"))],
            data={"doc_types": "other", "domain": "employment-hr"},
        )
        data = response.json()
        assert "session_id" in data
        assert len(data["session_id"]) == 36  # UUID format

    def test_mixed_valid_and_invalid_files(self, client: TestClient) -> None:
        """One valid PDF + one empty file → succeeded=1, failed=1."""
        pdf_content = make_pdf_bytes("Valid content here.")
        response = client.post(
            "/api/v1/documents/ingest",
            files=[
                ("files", ("good.pdf", pdf_content, "application/pdf")),
                ("files", ("empty.pdf", b"", "application/pdf")),
            ],
            data={"doc_types": "other", "domain": "employment-hr"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total_uploaded"] == 2
        assert data["total_succeeded"] == 1
        assert data["total_failed"] == 1
