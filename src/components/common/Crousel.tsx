"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CarouselProps {
  items: React.ReactNode[];
  className?: string;
  itemClassName?: string;
  showDots?: boolean;
  showArrows?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  loop?: boolean;
  orientation?: "horizontal" | "vertical";
}

export default function Crousel({
  items,
  className,
  itemClassName,
  showDots = true,
  showArrows = true,
  autoPlay = false,
  autoPlayInterval = 3000,
  loop = true,
  orientation = "horizontal",
}: CarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(autoPlay);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Auto-play functionality
  React.useEffect(() => {
    if (!api || !isAutoPlaying || items.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else if (loop) {
        api.scrollTo(0);
      } else {
        setIsAutoPlaying(false);
      }
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [api, isAutoPlaying, autoPlayInterval, loop, items.length]);

  const scrollTo = React.useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative w-full", className)}>
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: loop,
        }}
        orientation={orientation}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {items.map((item, index) => (
            <CarouselItem
              key={index}
              className={cn(
                "pl-2 md:pl-4",
                orientation === "horizontal" ? "basis-full sm:basis-1/2 lg:basis-1/3" : "basis-full",
                itemClassName
              )}
            >
              {item}
            </CarouselItem>
          ))}
        </CarouselContent>

        {showArrows && items.length > 1 && (
          <>
            <CarouselPrevious className="left-2 sm:left-4" />
            <CarouselNext className="right-2 sm:right-4" />
          </>
        )}

        {/* Custom Navigation Dots */}
        {showDots && items.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all duration-300",
                  current === index
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Auto-play toggle button */}
        {items.length > 1 && (
          <div className="flex items-center justify-center mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="h-8 text-xs"
            >
              {isAutoPlaying ? "Pause" : "Play"}
            </Button>
          </div>
        )}
      </Carousel>

      {/* Slide counter */}
      {items.length > 1 && (
        <div className="text-center mt-2 text-xs sm:text-sm text-muted-foreground">
          {current + 1} / {items.length}
        </div>
      )}
    </div>
  );
}

