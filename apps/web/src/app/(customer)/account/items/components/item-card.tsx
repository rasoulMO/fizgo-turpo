import Image from 'next/image'
import Link from 'next/link'
import { ItemCondition, ItemStatus, users } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { MoreHorizontal } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface Item {
  id: string
  name: string
  description: string | null
  condition: ItemCondition
  price: Decimal
  status: ItemStatus
  images: string[] | null
  brand: string | null
  size: string | null
  color: string | null
  created_at: Date | null
  seller: users | null
  seller_id: string | null
}

export function ItemCard({
  item,
  onPublish,
  onArchive
}: {
  item: Item
  onPublish: () => void
  onArchive: () => void
}) {
  return (
    <Card className="overflow-hidden">
      <Link href={`/account/items/${item.id}`}>
        <div className="relative h-64 w-full">
          <Image
            src={item.images?.[0] || '/images/placeholder-avatar.png'}
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="truncate text-lg font-semibold">{item.name}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {item.status === 'DRAFT' && (
                  <DropdownMenuItem onClick={onPublish}>
                    Publish
                  </DropdownMenuItem>
                )}
                {item.status === 'PUBLISHED' && (
                  <DropdownMenuItem onClick={onArchive}>
                    Archive
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href={`/account/items/${item.id}/edit`}>Edit</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <Badge
              variant={item.status === 'PUBLISHED' ? 'default' : 'secondary'}
            >
              {item.status.toLowerCase()}
            </Badge>
            <span className="font-semibold">${Number(item.price)}</span>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Condition: {item.condition}
          </div>
        </div>
      </Link>
    </Card>
  )
}
