from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.db.session import get_db
from app.models.user import User
from app.models.scan import Scan
from app.schemas.scan import (
    DashboardStatsResponse,
    RiskDistribution,
    ScanResponse,
    AdminMetricsResponse
)
from app.api.deps import get_current_user, get_current_admin_user

router = APIRouter(tags=["Dashboard & Analytics"])

CYBERSECURITY_SAFETY_TIPS = [
    {
        "title": "Always verify unexpected sender addresses",
        "tip": "Check the exact domain after the '@' symbol in emails. Scammers often use close misspellings like 'support@paypa1-security.com' instead of authentic domains."
    },
    {
        "title": "Never share One-Time Passcodes (OTPs)",
        "tip": "Legitimate banks and tech firms will never ask you to verbally tell or text an OTP code. OTPs are meant only for direct entry into verified official apps."
    },
    {
        "title": "Beware of manufactured urgency",
        "tip": "Phrases like 'Account suspended in 24 hours' or 'Arrest warrant issued' are designed to trigger panic and bypass your rational skepticism. Pause and verify."
    },
    {
        "title": "Inspect destination domains before clicking",
        "tip": "Hover over links on desktop or long-press on mobile to inspect the actual destination URL before tapping."
    },
    {
        "title": "Enable Multi-Factor Authentication (MFA)",
        "tip": "Use hardware keys or authenticator apps rather than SMS where possible. MFA provides a resilient shield even if credentials are stolen."
    }
]

@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns authentic user dashboard statistics strictly calculated from stored database records.
    """
    user_scans = db.query(Scan).filter(Scan.user_id == current_user.id)
    total_scans = user_scans.count()

    high_risk_count = db.query(Scan).filter(
        Scan.user_id == current_user.id,
        Scan.risk_category == "high"
    ).count()

    suspicious_count = db.query(Scan).filter(
        Scan.user_id == current_user.id,
        Scan.risk_category == "suspicious"
    ).count()

    low_risk_count = db.query(Scan).filter(
        Scan.user_id == current_user.id,
        Scan.risk_category == "low"
    ).count()

    recent_items = (
        db.query(Scan)
        .filter(Scan.user_id == current_user.id)
        .order_by(desc(Scan.created_at))
        .limit(5)
        .all()
    )

    return DashboardStatsResponse(
        total_scans=total_scans,
        high_risk_count=high_risk_count,
        suspicious_count=suspicious_count,
        low_risk_count=low_risk_count,
        risk_distribution=RiskDistribution(
            low=low_risk_count,
            suspicious=suspicious_count,
            high=high_risk_count
        ),
        recent_scans=[ScanResponse.model_validate(s) for s in recent_items],
        safety_tips=CYBERSECURITY_SAFETY_TIPS
    )

@router.get("/admin/metrics", response_model=AdminMetricsResponse)
def get_admin_metrics(
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Returns privacy-preserving platform-wide aggregate metrics for administrators.
    Does not expose sensitive scan payloads, passwords, or individual message contents.
    """
    total_users = db.query(User).count()
    total_scans = db.query(Scan).count()

    # Scans by type
    type_counts = (
        db.query(Scan.scan_type, func.count(Scan.id))
        .group_by(Scan.scan_type)
        .all()
    )
    scans_by_type = {t[0]: t[1] for t in type_counts}

    # Scans by risk
    risk_counts = (
        db.query(Scan.risk_category, func.count(Scan.id))
        .group_by(Scan.risk_category)
        .all()
    )
    scans_by_risk = {r[0]: r[1] for r in risk_counts}

    return AdminMetricsResponse(
        total_users=total_users,
        total_scans=total_scans,
        scans_by_type=scans_by_type,
        scans_by_risk=scans_by_risk,
        recent_activity_count=total_scans
    )
