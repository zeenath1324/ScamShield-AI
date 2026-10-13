import time
from collections import defaultdict
from typing import Dict, List
from fastapi import Request, HTTPException, status
from app.core.config import settings

class InMemoryRateLimiter:
    """
    Lightweight, thread-safe in-memory rate limiter using sliding window timestamps.
    Prevents brute-force on auth routes and abuse of scan analyzers.
    """
    def __init__(self):
        # Maps client key to list of request timestamps
        self.requests: Dict[str, List[float]] = defaultdict(list)

    def _get_client_key(self, request: Request, endpoint_tag: str) -> str:
        client_ip = request.client.host if request.client else "unknown"
        # If behind a proxy, look at X-Forwarded-For
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        return f"{endpoint_tag}:{client_ip}"

    def check(self, request: Request, endpoint_tag: str, max_requests: int, window_seconds: int = 60):
        key = self._get_client_key(request, endpoint_tag)
        now = time.time()
        window_start = now - window_seconds
        
        # Purge timestamps outside current window
        self.requests[key] = [t for t in self.requests[key] if t > window_start]
        
        if len(self.requests[key]) >= max_requests:
            retry_after = int(window_seconds - (now - self.requests[key][0])) + 1
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Please wait {retry_after} seconds before trying again.",
                headers={"Retry-After": str(max(1, retry_after))}
            )
        
        self.requests[key].append(now)

rate_limiter = InMemoryRateLimiter()

def rate_limit_auth(request: Request):
    rate_limiter.check(request, "auth", max_requests=settings.RATE_LIMIT_AUTH_PER_MINUTE, window_seconds=60)

def rate_limit_scan(request: Request):
    rate_limiter.check(request, "scan", max_requests=settings.RATE_LIMIT_SCAN_PER_MINUTE, window_seconds=60)
