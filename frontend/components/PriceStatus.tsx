import { Badge } from "@/components/ui/badge";
import { priceService } from "@/lib/priceService";
import { useEffect, useState } from "react";

export function PriceStatus() {
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  // const [isUpdating, setIsUpdating] = useState(false); // Removed unused variables

  useEffect(() => {
    const checkPriceStatus = () => {
      const cachedPrices = priceService.getCachedPrices();
      if (cachedPrices) {
        setLastUpdate(cachedPrices.lastUpdated);
      }
    };

    // Check initial status
    checkPriceStatus();

    // Check every 5 seconds
    const interval = setInterval(checkPriceStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="text-xs">
        Live Prices
      </Badge>
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      {lastUpdate && (
        <span className="text-xs text-muted-foreground">
          Updated {formatTimeAgo(lastUpdate)}
        </span>
      )}
    </div>
  );
} 