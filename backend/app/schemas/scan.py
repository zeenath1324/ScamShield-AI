from datetime import datetime
from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class IndicatorItem(BaseModel):
    id: str
    name: str
    severity: Literal["low", "medium", "high"]
    category: str
    description: str
    why_it_matters: str
    evidence: Optional[str] = None
    weight: int

class ScanCreateRequest(BaseModel):
    scan_type: Literal["url", "message", "combined"]
    url: Optional[str] = Field(None, max_length=2048)
    subject: Optional[str] = Field(None, max_length=500)
    message: Optional[str] = Field(None, max_length=15000)
    use_ai: bool = False

class ScanResponse(BaseModel):
    id: int
    user_id: int
    scan_type: str
    redacted_input_preview: str
    normalized_url: Optional[str] = None
    risk_score: int
    risk_category: str
    detected_indicators: List[IndicatorItem]
    explanation: str
    recommended_actions: List[str]
    ai_explanation_status: str
    ai_summary: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ScanListResponse(BaseModel):
    items: List[ScanResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class RiskDistribution(BaseModel):
    low: int = 0
    suspicious: int = 0
    high: int = 0

class DashboardStatsResponse(BaseModel):
    total_scans: int
    high_risk_count: int
    suspicious_count: int
    low_risk_count: int
    risk_distribution: RiskDistribution
    recent_scans: List[ScanResponse]
    safety_tips: List[Dict[str, str]]

class AdminMetricsResponse(BaseModel):
    total_users: int
    total_scans: int
    scans_by_type: Dict[str, int]
    scans_by_risk: Dict[str, int]
    recent_activity_count: int

class MessageResponse(BaseModel):
    message: str
    detail: str = ""

