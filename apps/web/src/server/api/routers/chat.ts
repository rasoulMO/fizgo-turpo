import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import {
  sendChatMessageEmail,
  sendOfferNotificationEmail,
  sendOfferResponseEmail
} from '@/server/trigger/chat-notifications'
import { ChatMessageType, OfferStatus } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const chatRouter = createTRPCRouter({
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const conversations = await ctx.db.chat_conversations.findMany({
      where: {
        OR: [{ buyer_id: ctx.user.id }, { seller_id: ctx.user.id }],
        status: 'ACTIVE'
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            status: true
          }
        },
        buyer: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true
          }
        },
        seller: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true
          }
        },
        messages: {
          take: 1,
          orderBy: {
            created_at: 'desc'
          },
          select: {
            content: true,
            created_at: true,
            message_type: true,
            sender_id: true
          }
        }
      },
      orderBy: {
        last_message_at: 'desc'
      }
    })

    return conversations
  }),

  getConversation: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { conversationId } = input

      const conversation = await ctx.db.chat_conversations.findUnique({
        where: { id: conversationId },
        include: {
          item: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              status: true,
              seller_id: true
            }
          },
          buyer: {
            select: {
              id: true,
              full_name: true,
              avatar_url: true
            }
          },
          seller: {
            select: {
              id: true,
              full_name: true,
              avatar_url: true
            }
          }
        }
      })

      if (!conversation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Conversation not found'
        })
      }

      // Verify user is part of conversation
      if (
        conversation.buyer_id !== ctx.user.id &&
        conversation.seller_id !== ctx.user.id
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to view this conversation'
        })
      }

      return conversation
    }),

  getMessages: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { conversationId } = input

      const messages = await ctx.db.chat_messages.findMany({
        where: { conversation_id: conversationId },
        include: {
          sender: {
            select: {
              id: true,
              full_name: true,
              avatar_url: true
            }
          },
          offer: {
            select: {
              id: true,
              offer_amount: true,
              status: true,
              buyer_id: true,
              item_id: true
            }
          }
        },
        orderBy: {
          created_at: 'asc'
        }
      })

      return messages
    }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        content: z.string(),
        messageType: z.nativeEnum(ChatMessageType),
        offerId: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { conversationId, content, messageType, offerId } = input

      // Get conversation details first
      const conversation = await ctx.db.chat_conversations.findUnique({
        where: { id: conversationId },
        include: {
          item: true,
          buyer: true,
          seller: true
        }
      })

      if (!conversation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Conversation not found'
        })
      }

      const message = await ctx.db.chat_messages.create({
        data: {
          conversation_id: conversationId,
          sender_id: ctx.user.id,
          content,
          message_type: messageType,
          offer_id: offerId
        },
        include: {
          sender: true
        }
      })

      // Update conversation last_message_at
      await ctx.db.chat_conversations.update({
        where: { id: conversationId },
        data: { last_message_at: new Date() }
      })

      // Send email notification
      const recipientId =
        ctx.user.id === conversation.buyer_id
          ? conversation.seller_id
          : conversation.buyer_id

      const recipient =
        ctx.user.id === conversation.buyer_id
          ? conversation.seller
          : conversation.buyer

      if (recipient?.email) {
        await sendChatMessageEmail.trigger({
          recipientName: recipient.full_name || 'User',
          recipientEmail: recipient.email,
          senderName: message.sender.full_name || 'User',
          itemName: conversation.item.name,
          messagePreview: content,
          conversationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/chat/${conversationId}`
        })
      }

      return message
    }),

  createOffer: protectedProcedure
    .input(
      z.object({
        itemId: z.string(),
        offerAmount: z.number(),
        message: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { itemId, offerAmount, message } = input

      // Start a transaction
      return await ctx.db.$transaction(async (tx) => {
        // Get item with seller details
        const item = await tx.user_items.findUnique({
          where: { id: itemId },
          include: {
            seller: {
              select: {
                id: true,
                email: true,
                full_name: true
              }
            }
          }
        })

        if (!item) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Item not found'
          })
        }

        // Get or create conversation
        let conversation = await tx.chat_conversations.findFirst({
          where: {
            item_id: itemId,
            buyer_id: ctx.user.id,
            seller_id: item.seller_id,
            status: 'ACTIVE'
          }
        })

        if (!conversation) {
          conversation = await tx.chat_conversations.create({
            data: {
              item_id: itemId,
              buyer_id: ctx.user.id,
              seller_id: item.seller_id,
              status: 'ACTIVE',
              last_message_at: new Date()
            }
          })
        }

        // Create offer
        const offer = await tx.user_item_offers.create({
          data: {
            item_id: itemId,
            buyer_id: ctx.user.id,
            offer_amount: offerAmount,
            message: message,
            status: 'PENDING',
            valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
          }
        })

        // Create chat message for offer
        const chatMessage = await tx.chat_messages.create({
          data: {
            conversation_id: conversation.id,
            sender_id: ctx.user.id,
            message_type: 'OFFER',
            content: message || `Offered ${offerAmount} for this item`,
            offer_id: offer.id
          },
          include: {
            sender: {
              select: {
                id: true,
                full_name: true,
                email: true
              }
            }
          }
        })

        // Send email notification to seller
        if (item.seller?.email) {
          await sendOfferNotificationEmail
            .trigger({
              recipientName: item.seller.full_name || 'Seller',
              recipientEmail: item.seller.email,
              senderName: chatMessage.sender.full_name || 'Buyer',
              itemName: item.name,
              offerAmount: offerAmount,
              message: message,
              conversationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/chat/${conversation.id}`
            })
            .catch((error: unknown) => {
              // Log error but don't fail the transaction
              console.error('Failed to send offer notification email:', error)
            })
        }

        // Update conversation last_message_at
        await tx.chat_conversations.update({
          where: { id: conversation.id },
          data: {
            last_message_at: new Date()
          }
        })

        return {
          conversation,
          offer,
          message: chatMessage
        }
      })
    }),

  respondToOffer: protectedProcedure
    .input(
      z.object({
        offerId: z.string(),
        conversationId: z.string(),
        status: z.nativeEnum(OfferStatus)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { offerId, status, conversationId } = input

      return await ctx.db.$transaction(async (tx) => {
        // First verify the offer and user authorization
        const offer = await tx.user_item_offers.findUnique({
          where: { id: offerId },
          include: {
            item: {
              include: {
                seller: {
                  select: {
                    id: true,
                    full_name: true,
                    email: true
                  }
                }
              }
            },
            buyer: {
              select: {
                id: true,
                full_name: true,
                email: true
              }
            }
          }
        })

        if (!offer) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Offer not found'
          })
        }

        // Verify user is the seller
        if (offer.item.seller_id !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only the seller can respond to offers'
          })
        }

        // Update offer status
        const updatedOffer = await tx.user_item_offers.update({
          where: { id: offerId },
          data: {
            status,
            updated_at: new Date()
          },
          include: {
            item: true
          }
        })

        // Create chat message about response
        const message = await tx.chat_messages.create({
          data: {
            conversation_id: conversationId,
            sender_id: ctx.user.id,
            message_type: 'TEXT',
            content:
              status === 'ACCEPTED'
                ? `Offer of ${updatedOffer.offer_amount} was accepted`
                : 'Offer was declined',
            offer_id: offerId
          }
        })

        let paymentMessage = null
        if (status === 'ACCEPTED') {
          paymentMessage = await tx.chat_messages.create({
            data: {
              conversation_id: conversationId,
              sender_id: ctx.user.id, // system message from seller
              message_type: 'PENDING_PAYMENT',
              content: `Great! The seller has accepted your offer of ${updatedOffer.offer_amount}. Please proceed with the payment to secure your purchase.`,
              offer_id: offerId
            }
          })
        }

        // Update conversation last_message_at
        await tx.chat_conversations.update({
          where: { id: conversationId },
          data: { last_message_at: new Date() }
        })

        // Send email notification to buyer
        if (offer.buyer?.email) {
          await sendOfferResponseEmail
            .trigger({
              recipientName: offer.buyer.full_name || 'Buyer',
              recipientEmail: offer.buyer.email,
              sellerName: offer.item.seller?.full_name || 'Seller',
              itemName: offer.item.name,
              offerAmount: offer.offer_amount.toNumber(),
              status: status === 'ACCEPTED' ? 'ACCEPTED' : 'REJECTED',
              conversationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/chat/${conversationId}`
            })
            .catch((error: unknown) => {
              // Log error but don't fail the transaction
              console.error('Failed to send offer response email:', error)
            })
        }

        if (status === 'ACCEPTED') {
          // Mark other pending offers as rejected
          await tx.user_item_offers.updateMany({
            where: {
              item_id: updatedOffer.item_id,
              status: 'PENDING',
              NOT: {
                id: offerId
              }
            },
            data: {
              status: 'REJECTED',
              updated_at: new Date()
            }
          })
        }

        return { offer: updatedOffer, message, paymentMessage }
      })
    }),

  markMessagesAsRead: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { conversationId } = input

      await ctx.db.chat_messages.updateMany({
        where: {
          conversation_id: conversationId,
          sender_id: { not: ctx.user.id },
          is_read: false
        },
        data: {
          is_read: true
        }
      })

      return true
    })
})
