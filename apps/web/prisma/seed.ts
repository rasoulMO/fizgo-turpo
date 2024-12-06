// prisma/seed.ts
import { PrismaClient, TaskLabel, TaskPriority } from '@prisma/client'

const prisma = new PrismaClient()

const orderTaskTemplates = [
  {
    title_template: 'Process Order #{orderId}',
    description_template:
      'New order received from {customerName} requiring processing:\n- Review order items\n- Verify stock availability\n- Pack items according to order specifications\n- Mark as ready for pickup when completed\n\nItems:\n{itemList}',
    task_type: 'ORDER_PROCESSING',
    priority: TaskPriority.HIGH,
    label: TaskLabel.NEW_ORDER,
    is_system_template: true,
    metadata_template: {}
  },
  {
    title_template: 'Assign Delivery for Order #{orderId}',
    description_template:
      'Order #{orderId} ready for delivery assignment.\n- Delivery Address: {deliveryAddress}\n- Estimated Weight: {estimatedWeight}kg\n- Special Handling: {requiresSpecialHandling}',
    task_type: 'DELIVERY_ASSIGNMENT',
    priority: TaskPriority.HIGH,
    label: TaskLabel.DELIVERY_MANAGEMENT,
    is_system_template: true,
    metadata_template: {}
  }
]

async function main() {
  console.log('Start seeding task templates...')

  for (const template of orderTaskTemplates) {
    const existingTemplate = await prisma.task_templates.findFirst({
      where: {
        task_type: template.task_type,
        is_system_template: true
      }
    })

    if (!existingTemplate) {
      await prisma.task_templates.create({
        data: template
      })
      console.log(`Created template for ${template.task_type}`)
    } else {
      console.log(`Template for ${template.task_type} already exists`)
    }
  }

  console.log('Seeding completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
