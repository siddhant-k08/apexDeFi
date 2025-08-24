// Price Service for fetching live cryptocurrency prices
export interface PriceData {
  apt: number;
  apex: number;
  lastUpdated: number;
  aptChange?: number;
  apexChange?: number;
}

export class PriceService {
  private cache: PriceData | null = null;
  private cacheExpiry = 30000; // 30 seconds cache
  private lastFetch = 0;

  // Fetch live APT price from CoinGecko API
  private async fetchAptPrice(): Promise<number> {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=aptos&vs_currencies=usd'
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.aptos.usd;
    } catch (error) {
      console.error('Error fetching APT price from CoinGecko:', error);
      
      // Fallback to alternative API
      try {
        const response = await fetch(
          'https://api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=APT&convert=USD',
          {
            headers: {
              'X-CMC_PRO_API_KEY': 'demo' // Use demo key for testing
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.data.APT.quote.USD.price;
      } catch (fallbackError) {
        console.error('Error fetching APT price from CoinMarketCap:', fallbackError);
        return 4.70; // Final fallback price
      }
    }
  }

  // Get APEX price based on DEX ratio and APT price
  private async getApexPrice(aptPrice: number, apexPerApt: number): Promise<number> {
    return aptPrice / apexPerApt;
  }

  // Main method to get live prices
  async getLivePrices(apexPerApt: number): Promise<PriceData> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cache && (now - this.lastFetch) < this.cacheExpiry) {
      return this.cache;
    }

    try {
      const aptPrice = await this.fetchAptPrice();
      const apexPrice = await this.getApexPrice(aptPrice, apexPerApt);
      
      // Calculate price changes
      const aptChange = this.cache ? aptPrice - this.cache.apt : 0;
      const apexChange = this.cache ? apexPrice - this.cache.apex : 0;
      
      this.cache = {
        apt: aptPrice,
        apex: apexPrice,
        lastUpdated: now,
        aptChange,
        apexChange
      };
      
      this.lastFetch = now;
      
      return this.cache;
    } catch (error) {
      console.error('Error fetching live prices:', error);
      
      // Return fallback prices if all APIs fail
      return {
        apt: 4.70,
        apex: 4.70 / apexPerApt,
        lastUpdated: now
      };
    }
  }

  // Get cached prices (for immediate access)
  getCachedPrices(): PriceData | null {
    return this.cache;
  }

  // Clear cache (for testing or manual refresh)
  clearCache(): void {
    this.cache = null;
    this.lastFetch = 0;
  }
}

// Export singleton instance
export const priceService = new PriceService(); 