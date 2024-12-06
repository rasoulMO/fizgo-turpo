export const ROUTES = {
  // Public
  HOME: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  FORGET_PASSWORD: '/forget-password',
  RESET_PASSWORD: '/reset-password',

  // Customer
  CUSTOMER_PROFILE: '/account/profile',
  CUSTOMER_FAVORITES: '/account/favorites',
  CUSTOMER_ORDERS: '/account/orders',
  CUSTOMER_MESSAGES: '/account/chat', // TODO: Change to '/account/messages'
  CUSTOMER_ITEMS: '/account/items',
  CUSTOMER_ADDRESSES: '/account/addresses',
  CUSTOMER_PAYMENTS: '/account/payments',
  CUSTOMER_SETTINGS: '/account/settings',

  // Shop
  SHOP_OVERVIEW: '/dashboard/shop/overview',
  SHOP_PRODUCTS: '/dashboard/shop/products',
  SHOP_ORDERS: '/dashboard/shop/orders',
  SHOP_DELIVERIES: '/dashboard/shop/deliveries',
  SHOP_INTERACTIONS: '/dashboard/shop/interactions',
  SHOP_PROMOTIONS: '/dashboard/shop/promotions',
  SHOP_NOTIFICATIONS: '/dashboard/shop/notifications',
  SHOP_SETTINGS: '/dashboard/shop/settings',

  // Admin
  ADMIN_USERS: '/dashboard/admin/users',
  ADMIN_SHOPS: '/dashboard/admin/shops',
  ADMIN_PARTNERS: '/dashboard/admin/partners',
  ADMIN_DELIVERY_PARTNERS: '/dashboard/admin/delivery-partners',
  ADMIN_OERDERS: '/dashboard/admin/orders',
  ADMIN_DELIVERIES: '/dashboard/admin/deliveries',
  ADMIN_CONTACTS: '/dashboard/admin/contacts',
  ADMIN_TASKS: '/dashboard/admin/tasks',
  ADMIN_NOTIFICATIONS: '/dashboard/admin/notifications',
  ADMIN_SUBSCRIPTIONS: '/dashboard/admin/subscriptions'
} as const
