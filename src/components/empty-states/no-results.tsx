"use client";

import { Search } from "lucide-react";

interface NoResultsProps {
  searchQuery: string;
  activeFilter: string;
}

/**
 * Empty state shown when a search or filter yields no results.
 * Distinct from the "no products" state — this is contextual.
 */
export function NoResults({ searchQuery, activeFilter }: NoResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        className={`
          w-16 h-16 rounded-[var(--radius-lg)] bg-surface-secondary
          flex items-center justify-center mb-5
          border border-border
        `}
      >
        <Search className="w-8 h-8 text-text-tertiary" />
      </div>

      <h3 className="text-xl font-semibold text-foreground mb-2">
        No matching products
      </h3>
      <p className="text-text-secondary max-w-sm leading-relaxed">
        {searchQuery ? (
          <>
            No products match &ldquo;
            <span className="font-medium text-foreground">{searchQuery}</span>
            &rdquo;
            {activeFilter !== "all" && (
              <>
                {" "}
                with the{" "}
                <span className="font-medium text-foreground capitalize">
                  {activeFilter.replace("_", " ")}
                </span>{" "}
                filter
              </>
            )}
            . Try adjusting your search or clearing filters.
          </>
        ) : (
          <>
            No products found with the{" "}
            <span className="font-medium text-foreground capitalize">
              {activeFilter.replace("_", " ")}
            </span>{" "}
            filter. Try selecting a different status.
          </>
        )}
      </p>
    </div>
  );
}
