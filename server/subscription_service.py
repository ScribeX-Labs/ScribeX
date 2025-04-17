from firebase_admin import firestore
from firebase import db
from models import SubscriptionTier
import time


async def get_user_subscription(user_id: str):
    """Get a user's subscription details from Firestore"""
    if not user_id:
        raise ValueError("User ID is required")

    try:
        doc_ref = db.collection("subscriptions").document(user_id)
        doc = doc_ref.get()

        if not doc.exists:
            # User doesn't have a subscription record, create default free tier
            default_subscription = {
                "user_id": user_id,
                "tier": SubscriptionTier.FREE.value,
                "is_active": True,
                "created_at": firestore.SERVER_TIMESTAMP,
            }
            doc_ref.set(default_subscription)
            # Return a copy of default_subscription with consistent timestamp for immediate use
            return {
                **default_subscription,
                "created_at": firestore.SERVER_TIMESTAMP._seconds,
            }

        return doc.to_dict()
    except Exception as e:
        print(f"Error getting user subscription: {str(e)}")
        # Return default free subscription on error, but don't try to save
        return {
            "user_id": user_id,
            "tier": SubscriptionTier.FREE.value,
            "is_active": True,
            "created_at": int(time.time()),
        }


async def update_user_subscription(
    user_id: str, tier: SubscriptionTier, is_active: bool = True
):
    """Update a user's subscription tier"""
    if not user_id:
        raise ValueError("User ID is required")

    try:
        doc_ref = db.collection("subscriptions").document(user_id)
        doc = doc_ref.get()

        subscription_data = {
            "user_id": user_id,
            "tier": tier.value,
            "is_active": is_active,
            "updated_at": firestore.SERVER_TIMESTAMP,
        }

        if not doc.exists:
            subscription_data["created_at"] = firestore.SERVER_TIMESTAMP
            doc_ref.set(subscription_data)
        else:
            doc_ref.update(subscription_data)

        # Return a copy with consistent timestamp for immediate use
        return {
            **subscription_data,
            "updated_at": int(time.time()),
            "created_at": subscription_data.get("created_at", int(time.time())),
        }
    except Exception as e:
        print(f"Error updating user subscription: {str(e)}")
        raise e


async def is_pro_user(user_id: str):
    """Check if user has an active Pro subscription"""
    if not user_id:
        return False

    try:
        subscription = await get_user_subscription(user_id)
        return subscription.get(
            "tier"
        ) == SubscriptionTier.PRO.value and subscription.get("is_active", False)
    except Exception as e:
        print(f"Error checking pro status: {str(e)}")
        return False
