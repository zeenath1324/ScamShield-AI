from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, or_
from app.db.session import get_db
from app.models.user import User
from app.models.scan import Scan
from app.schemas.scan import (
    ScanCreateRequest,
    ScanResponse,
    ScanListResponse,
    MessageResponse
)
from app.api.deps import get_current_user
from app.core.rate_limit import rate_limit_scan
from app.services.risk_engine import evaluate_scan
from app.services.groq_service import generate_ai_explanation

router = APIRouter(prefix="/scans", tags=["Scans"])

@router.post("/analyze", response_model=ScanResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(rate_limit_scan)])
async def analyze_content(
    req: ScanCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validation
    if req.scan_type == "url":
        if not req.url or not req.url.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="A valid URL or domain string is required for URL analysis."
            )
        if len(req.url) > 2048:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="URL length exceeds maximum permissible limit (2048 characters)."
            )

    elif req.scan_type == "message":
        if not req.message or not req.message.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Message body text is required for email or SMS analysis."
            )
        if len(req.message) > 15000:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Message text exceeds maximum permissible limit (15,000 characters)."
            )

    elif req.scan_type == "combined":
        has_url = bool(req.url and req.url.strip())
        has_msg = bool(req.message and req.message.strip())
        if not has_url and not has_msg:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="At least one URL or message text must be provided for combined analysis."
            )

    # 1. Rule-based static evaluation (Strictly NO network requests to target URL)
    assessment = evaluate_scan(
        scan_type=req.scan_type,
        url=req.url,
        subject=req.subject,
        message=req.message
    )

    ai_status = "not_requested"
    ai_summary = None

    # 2. Optional AI Enrichment
    if req.use_ai:
        ai_res = await generate_ai_explanation(
            scan_type=assessment["scan_type"],
            risk_score=assessment["risk_score"],
            risk_category=assessment["risk_category"],
            detected_indicators=assessment["detected_indicators"],
            sanitized_preview=assessment["redacted_input_preview"]
        )
        if ai_res:
            ai_status = "generated"
            ai_summary = ai_res.get("explanation")
            # If AI suggested custom safety tips, merge or enrich recommended actions
            if ai_res.get("advice"):
                assessment["recommended_actions"] = list(set(assessment["recommended_actions"] + ai_res["advice"]))
        else:
            ai_status = "fallback_rule_based"

    # 3. Persist record in database for authenticated user
    new_scan = Scan(
        user_id=current_user.id,
        scan_type=assessment["scan_type"],
        redacted_input_preview=assessment["redacted_input_preview"],
        normalized_url=assessment["normalized_url"],
        risk_score=assessment["risk_score"],
        risk_category=assessment["risk_category"],
        detected_indicators=assessment["detected_indicators"],
        explanation=assessment["explanation"],
        recommended_actions=assessment["recommended_actions"],
        ai_explanation_status=ai_status,
        ai_summary=ai_summary
    )
    db.add(new_scan)
    db.commit()
    db.refresh(new_scan)

    return ScanResponse.model_validate(new_scan)

@router.get("", response_model=ScanListResponse)
def get_user_scans(
    search: Optional[str] = Query(None, description="Search keyword in preview or URL"),
    risk_category: Optional[str] = Query(None, description="Filter: low, suspicious, high"),
    scan_type: Optional[str] = Query(None, description="Filter: url, message, combined"),
    sort: Optional[str] = Query("newest", description="Sorting: newest, oldest, highest_risk"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Scan).filter(Scan.user_id == current_user.id)

    # Search filter
    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                Scan.redacted_input_preview.ilike(term),
                Scan.normalized_url.ilike(term)
            )
        )

    # Risk category filter
    if risk_category and risk_category.lower() in ("low", "suspicious", "high"):
        query = query.filter(Scan.risk_category == risk_category.lower())

    # Scan type filter
    if scan_type and scan_type.lower() in ("url", "message", "combined"):
        query = query.filter(Scan.scan_type == scan_type.lower())

    # Sorting
    if sort == "oldest":
        query = query.order_by(asc(Scan.created_at))
    elif sort == "highest_risk":
        query = query.order_by(desc(Scan.risk_score), desc(Scan.created_at))
    else:  # newest default
        query = query.order_by(desc(Scan.created_at))

    total = query.count()
    total_pages = max(1, (total + page_size - 1) // page_size)
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()

    return ScanListResponse(
        items=[ScanResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/{scan_id}", response_model=ScanResponse)
def get_single_scan(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found or access unauthorized."
        )
    return ScanResponse.model_validate(scan)

@router.delete("/{scan_id}", response_model=MessageResponse)
def delete_single_scan(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found or access unauthorized."
        )
    db.delete(scan)
    db.commit()
    return MessageResponse(message=f"Scan #{scan_id} deleted successfully.")

@router.delete("", response_model=MessageResponse)
def clear_all_scans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = db.query(Scan).filter(Scan.user_id == current_user.id).delete()
    db.commit()
    return MessageResponse(message=f"All {count} scan records have been cleared.")
