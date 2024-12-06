export const FEES = {
  PLATFORM: {
    PERCENTAGE: 5, // 5%
    STRIPE_PROCESSING: 2.9 // 2.9%
  },
  SHOP: {
    PERCENTAGE: 80 // 80%
  },
  DELIVERY: {
    PERCENTAGE: 10 // 10%
  }
} as const

export const calculateFees = (amount: number) => {
  const platformFee = Math.round(amount * (FEES.PLATFORM.PERCENTAGE / 100))
  const deliveryFee = Math.round(amount * (FEES.DELIVERY.PERCENTAGE / 100))
  const shopAmount = amount - platformFee - deliveryFee

  return {
    platformFee,
    platformFeePercentage: FEES.PLATFORM.PERCENTAGE,
    shopAmount,
    shopFeePercentage: FEES.SHOP.PERCENTAGE,
    deliveryFee,
    deliveryFeePercentage: FEES.DELIVERY.PERCENTAGE,
    stripeProcessingFee: FEES.PLATFORM.STRIPE_PROCESSING
  }
}
