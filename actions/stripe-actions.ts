import { updateUser, updateUserBystripecustomerid } from "@/lib/queries"
import { stripe } from "@/lib/stripe"
import { User } from "@/lib/supabase"
import Stripe from "stripe"

type MembershipStatus = User["membership"]

const getMembershipStatus = (
  status: Stripe.Subscription.Status,
  membership: MembershipStatus
): MembershipStatus => {
  switch (status) {
    case "active":
    case "trialing":
      return membership
    case "canceled":
    case "incomplete":
    case "incomplete_expired":
    case "past_due":
    case "paused":
    case "unpaid":
      return "free"
    default:
      return "free"
  }
}

const getSubscription = async (subscriptionId: string) => {
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["default_payment_method"],
  })
}

export const updateStripeCustomer = async (
  userId: string,
  subscriptionId: string,
  customerId: string
) => {
  try {
    if (!userId || !subscriptionId || !customerId) {
      throw new Error("Missing required parameters for updateStripeCustomer")
    }

    const subscription = await getSubscription(subscriptionId)

    const user = await updateUser(userId, {
      stripecustomerid: customerId,
      stripesubscriptionid: subscription.id,
    })

    if (!user) {
      throw new Error("Failed to update customer profile")
    }

    if (user.previoussubscriptionid) {
      try {
        await stripe.subscriptions.cancel(user.previoussubscriptionid)
        console.log(
          `Canceled previous subscription: ${user.previoussubscriptionid}`
        )
      } catch (error) {
        console.error(
          `Failed to cancel previous subscription: ${user.previoussubscriptionid}`,
          error
        )
      }
    }

    return user
  } catch (error) {
    console.error("Error in updateStripeCustomer:", error)
    throw error instanceof Error
      ? error
      : new Error("Failed to update Stripe customer")
  }
}

export const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  productId: string
): Promise<MembershipStatus> => {
  try {
    if (!subscriptionId || !customerId || !productId) {
      throw new Error(
        "Missing required parameters for manageSubscriptionStatusChange"
      )
    }

    const subscription = await getSubscription(subscriptionId)

    const product = await stripe.products.retrieve(productId)
    const membership = product.metadata.membership as MembershipStatus

    if (!["free", "pro", "ultimate"].includes(membership)) {
      throw new Error(
        `Invalid membership type in product metadata: ${membership}`
      )
    }

    const membershipStatus = getMembershipStatus(
      subscription.status,
      membership
    )

    await updateUserBystripecustomerid(customerId, {
      stripesubscriptionid: subscription.id,
      membership: membershipStatus,
    })

    return membershipStatus
  } catch (error) {
    console.error("Error in manageSubscriptionStatusChange:", error)
    throw error instanceof Error
      ? error
      : new Error("Failed to update subscription status")
  }
}
