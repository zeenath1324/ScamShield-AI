from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base

def utc_now():
    return datetime.now(timezone.utc)

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scan_type = Column(String(50), nullable=False, index=True)  # "url", "message", "combined"
    
    # Privacy: redacted/truncated preview instead of storing dangerous raw payloads
    redacted_input_preview = Column(Text, nullable=False)
    normalized_url = Column(String(1024), nullable=True, index=True)
    
    # Risk assessment
    risk_score = Column(Integer, nullable=False)  # 0 to 100
    risk_category = Column(String(50), nullable=False, index=True)  # "low", "suspicious", "high"
    
    # Structured indicators: list of objects {id, name, severity, category, description, evidence}
    detected_indicators = Column(JSON, nullable=False, default=list)
    explanation = Column(Text, nullable=False)
    recommended_actions = Column(JSON, nullable=False, default=list)
    
    # AI enrichment status
    ai_explanation_status = Column(String(50), default="not_requested", nullable=False)
    ai_summary = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

    user = relationship("User", back_populates="scans")

    def __repr__(self):
        return f"<Scan {self.id} type={self.scan_type} score={self.risk_score} category={self.risk_category}>"
