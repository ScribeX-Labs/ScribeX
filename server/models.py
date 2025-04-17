from enum import Enum
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SubscriptionTier(str, Enum):
    FREE = "free"
    PRO = "pro"


class Subscription(BaseModel):
    user_id: str
    tier: SubscriptionTier = SubscriptionTier.FREE
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: bool = True
