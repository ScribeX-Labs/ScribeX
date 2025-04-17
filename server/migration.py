from firebase import db
from firebase_admin import firestore
from models import SubscriptionTier
import asyncio


async def migrate_user_subscriptions():
    """
    Migrate all existing users to have a subscription tier.
    This will:
    1. Find all users in the system
    2. Check if they have a subscription record
    3. Create a default FREE subscription record if they don't
    """
    print("Starting user subscription migration...")

    # Get all user IDs from the 'users' collection
    users_ref = db.collection("users")
    users = users_ref.stream()
    user_ids = [user.id for user in users]

    # Also check uploads collection for user IDs we might have missed
    uploads_ref = db.collection("uploads")
    uploads = uploads_ref.stream()
    upload_user_ids = [upload.id for upload in uploads]

    # Combine and deduplicate user IDs
    all_user_ids = list(set(user_ids + upload_user_ids))

    print(f"Found {len(all_user_ids)} users to migrate")

    # Get subscription collection
    subscriptions_ref = db.collection("subscriptions")

    # Check each user and create subscription if needed
    for user_id in all_user_ids:
        try:
            # Check if user already has a subscription
            subscription_doc = subscriptions_ref.document(user_id).get()

            if not subscription_doc.exists:
                # Create default free subscription
                print(f"Creating default FREE subscription for user {user_id}")
                subscriptions_ref.document(user_id).set(
                    {
                        "user_id": user_id,
                        "tier": SubscriptionTier.FREE.value,
                        "is_active": True,
                        "created_at": firestore.SERVER_TIMESTAMP,
                    }
                )
            else:
                print(f"User {user_id} already has a subscription tier")
        except Exception as e:
            print(f"Error processing user {user_id}: {str(e)}")

    print("Migration completed")


if __name__ == "__main__":
    # Run the migration
    asyncio.run(migrate_user_subscriptions())
