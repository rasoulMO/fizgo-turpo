import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc'

import { addressRouter } from './routers/address'
import { cartRouter } from './routers/cart'
import { chatRouter } from './routers/chat'
import { deliveryPartnerApplicationRouter } from './routers/delivery-partner-application'
import { favoritesRouter } from './routers/favorites'
import { notificationRouter } from './routers/notification'
import { orderRouter } from './routers/order'
import { orderDeliveryRouter } from './routers/order-delivery'
import { p2pRouter } from './routers/p2p'
import { partnerApplicationRouter } from './routers/partner-applications'
import { paymentRouter } from './routers/payment'
import { productRouter } from './routers/product'
import { productSpecificationsRouter } from './routers/product-specifications'
import { shopRouter } from './routers/shop'
import { taskRouter } from './routers/task'
import { userRouter } from './routers/user'
import { userItemsRouter } from './routers/user-items'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  cart: cartRouter,
  chat: chatRouter,
  favorites: favoritesRouter,
  user: userRouter,
  shop: shopRouter,
  product: productRouter,
  productSpecifications: productSpecificationsRouter,
  address: addressRouter,
  payment: paymentRouter,
  order: orderRouter,
  orderDelivery: orderDeliveryRouter,
  task: taskRouter,
  p2p: p2pRouter,
  userItems: userItemsRouter,
  partnerApplications: partnerApplicationRouter,
  deliveryPartnerApplications: deliveryPartnerApplicationRouter,
  notification: notificationRouter
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)
