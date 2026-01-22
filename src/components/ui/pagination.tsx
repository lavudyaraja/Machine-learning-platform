import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants, type Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
  onClick?: () => void
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  Omit<React.ComponentProps<"a">, "onClick">

function PaginationLink({
  className,
  isActive,
  size = "icon",
  onClick,
  children,
  ...props
}: PaginationLinkProps) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-current={isActive ? "page" : undefined}
        data-slot="pagination-link"
        data-active={isActive}
        className={cn(
          buttonVariants({
            variant: isActive ? "outline" : "ghost",
            size,
          }),
          className
        )}
        {...(props as React.ComponentProps<"button">)}
      >
        {children}
      </button>
    );
  }

  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
}

function PaginationPrevious({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      onClick={onClick}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      onClick={onClick}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

/**
 * Complete Data Pagination Component with all logic
 * Handles page navigation, page size selection, and displays current range
 */
interface DataPaginationProps {
  /** Total number of items */
  totalItems: number
  /** Current page number (1-indexed) */
  currentPage: number
  /** Number of items per page */
  pageSize: number
  /** Callback when page changes */
  onPageChange: (page: number) => void
  /** Callback when page size changes */
  onPageSizeChange?: (pageSize: number) => void
  /** Available page size options */
  pageSizeOptions?: number[]
  /** Custom label for items (e.g., "rows", "items", "records") */
  itemLabel?: string
  /** Show page size selector */
  showPageSizeSelector?: boolean
  /** Show current range info */
  showRangeInfo?: boolean
  /** Custom className */
  className?: string
  /** Hide pagination if only one page */
  hideOnSinglePage?: boolean
}

function DataPagination({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [50, 100, 200, 300],
  itemLabel = "rows",
  showPageSizeSelector = true,
  showRangeInfo = true,
  className,
  hideOnSinglePage = true,
}: DataPaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize)
  
  // Hide if only one page and hideOnSinglePage is true
  if (hideOnSinglePage && totalPages <= 1) {
    return null
  }

  // Generate page numbers with ellipsis logic
  const generatePageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = []
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Smart pagination with ellipsis
      if (currentPage <= 3) {
        // Near the beginning: show first 5 pages, ellipsis, last page
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
        pages.push("ellipsis")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Near the end: show first page, ellipsis, last 5 pages
        pages.push(1)
        pages.push("ellipsis")
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // In the middle: show first page, ellipsis, current-1, current, current+1, ellipsis, last page
        pages.push(1)
        pages.push("ellipsis")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push("ellipsis")
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const pages = generatePageNumbers()
  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, totalItems)

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const handlePageSizeChange = (value: string) => {
    const newPageSize = Number(value)
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize)
      // Reset to page 1 when page size changes
      onPageChange(1)
    }
  }

  return (
    <div className={cn("space-y-4 pt-4 border-t", className)}>
      {(showPageSizeSelector || showRangeInfo) && (
        <div className="flex items-center justify-between flex-wrap gap-4">
          {showPageSizeSelector && onPageSizeChange && (
            <div className="flex items-center gap-2">
              <Label htmlFor="page-size" className="text-sm">
                {itemLabel.charAt(0).toUpperCase() + itemLabel.slice(1)} per page:
              </Label>
              <Select
                value={pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger id="page-size" className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {showRangeInfo && (
            <p className="text-sm text-muted-foreground">
              Showing <strong>{startIndex.toLocaleString()}</strong> to{" "}
              <strong>{endIndex.toLocaleString()}</strong> of{" "}
              <strong>{totalItems.toLocaleString()}</strong> {itemLabel}
            </p>
          )}
        </div>
      )}

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={handlePrevious}
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>

          {pages.map((page, index) => {
            if (page === "ellipsis") {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              )
            }
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => onPageChange(page as number)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          })}

          <PaginationItem>
            <PaginationNext
              onClick={handleNext}
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  DataPagination,
}
