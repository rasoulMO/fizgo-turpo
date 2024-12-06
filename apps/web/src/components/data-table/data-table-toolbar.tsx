'use client'

import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableFacetedFilter } from '@/components/data-table/data-table-faceted-filter'
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options'

interface FilterableColumn {
  id: string
  title: string
  options: {
    value: string
    label: string
  }[]
}

interface SearchableColumn {
  id: string
  title: string
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  filterableColumns?: FilterableColumn[]
  searchableColumns?: SearchableColumn[]
}

export function DataTableToolbar<TData>({
  table,
  filterableColumns = [],
  searchableColumns = []
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  // If no filterableColumns or searchableColumns are provided, return minimal toolbar
  if (!filterableColumns.length && !searchableColumns.length) {
    return (
      <div className="flex items-center justify-end">
        <DataTableViewOptions table={table} />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {searchableColumns.length > 0 &&
          searchableColumns.map((column) => {
            const tableColumn = table.getColumn(column.id)
            return tableColumn ? (
              <Input
                key={column.id}
                placeholder={`Filter ${column.title}...`}
                value={(tableColumn.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                  tableColumn.setFilterValue(event.target.value)
                }
                className="h-8 w-[150px] lg:w-[250px]"
              />
            ) : null
          })}
        {filterableColumns.length > 0 &&
          filterableColumns.map((column) => {
            const tableColumn = table.getColumn(column.id)
            return tableColumn ? (
              <DataTableFacetedFilter
                key={column.id}
                column={tableColumn}
                title={column.title}
                options={column.options}
              />
            ) : null
          })}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
