/**
 * CDC Data Service
 * Fetches and caches official CDC growth chart data
 */

/* eslint-disable no-console */
// Console logging is intentional in this service for debugging CDC data fetching

import Papa from 'papaparse';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GrowthChartDataPoint } from '../types';
import { logger } from '../utils/logger';

const CACHE_KEYS = {
  // CDC data
  WEIGHT_FOR_AGE_INFANT: '@cdc_weight_for_age_infant',
  WEIGHT_FOR_AGE_CHILD: '@cdc_weight_for_age_child',
  HEIGHT_FOR_AGE_INFANT: '@cdc_height_for_age_infant',
  HEIGHT_FOR_AGE_CHILD: '@cdc_height_for_age_child',
  HEAD_CIRC_FOR_AGE: '@cdc_head_circ_for_age',
  BMI_FOR_AGE: '@cdc_bmi_for_age',

  // WHO data (hosted by CDC)
  WHO_WEIGHT_FOR_AGE_INFANT: '@who_weight_for_age_infant',
  WHO_LENGTH_FOR_AGE_INFANT: '@who_length_for_age_infant',
  WHO_HEAD_CIRC_FOR_AGE: '@who_head_circ_for_age',

  LAST_UPDATE: '@cdc_last_update',
};

const CDC_URLS = {
  // CDC Infant datasets (birth to 36 months)
  WEIGHT_FOR_AGE_INFANT:
    'https://www.cdc.gov/growthcharts/data/zscore/wtageinf.csv',
  HEIGHT_FOR_AGE_INFANT:
    'https://www.cdc.gov/growthcharts/data/zscore/lenageinf.csv',
  HEAD_CIRC_FOR_AGE:
    'https://www.cdc.gov/growthcharts/data/zscore/hcageinf.csv',

  // CDC Child/teen datasets (2-20 years, 24-240 months)
  WEIGHT_FOR_AGE_CHILD:
    'https://www.cdc.gov/growthcharts/data/zscore/wtage.csv',
  HEIGHT_FOR_AGE_CHILD:
    'https://www.cdc.gov/growthcharts/data/zscore/statage.csv',
  BMI_FOR_AGE: 'https://www.cdc.gov/growthcharts/data/zscore/bmiagerev.csv',

  // WHO datasets (birth to 60 months, hosted by CDC)
  WHO_WEIGHT_FOR_AGE:
    'https://www.cdc.gov/growthcharts/data/who/wfa_boys_z_who.txt',
  WHO_LENGTH_FOR_AGE:
    'https://www.cdc.gov/growthcharts/data/who/lfa_boys_z_who.txt',
  WHO_HEAD_CIRC_FOR_AGE:
    'https://www.cdc.gov/growthcharts/data/who/hcfa_boys_z_who.txt',
};

// Cache duration: 30 days
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;

interface CDCDataRow {
  Sex: number; // 1 = male, 2 = female
  Agemos: number; // Age in months
  L: number;
  M: number;
  S: number;
  P3?: number;
  P5?: number;
  P10?: number;
  P25?: number;
  P50?: number;
  P75?: number;
  P90?: number;
  P95?: number;
  P97?: number;
}

interface WHODataRow {
  Month?: number;
  month?: number;
  L: number;
  M: number;
  S: number;
  P3?: number;
  P5?: number;
  P10?: number;
  P25?: number;
  P50?: number;
  P75?: number;
  P90?: number;
  P95?: number;
  P97?: number;
}

interface CDCDataCache {
  male: GrowthChartDataPoint[];
  female: GrowthChartDataPoint[];
  lastUpdate: number;
}

class CDCDataService {
  private loadingPromises: Map<string, Promise<CDCDataCache>> = new Map();

  /**
   * Transform CDC CSV row to our GrowthChartDataPoint format
   */
  private transformCDCRow(row: CDCDataRow): GrowthChartDataPoint {
    return {
      ageInMonths: row.Agemos,
      L: row.L,
      M: row.M,
      S: row.S,
    };
  }

  /**
   * Parse CDC CSV data and organize by sex
   */
  private parseCDCData(data: CDCDataRow[]): CDCDataCache {
    const male: GrowthChartDataPoint[] = [];
    const female: GrowthChartDataPoint[] = [];

    data.forEach((row: CDCDataRow) => {
      if (!row.Sex || !row.Agemos) {
        return;
      } // Skip invalid rows

      const point = this.transformCDCRow(row);

      if (row.Sex === 1) {
        male.push(point);
      } else if (row.Sex === 2) {
        female.push(point);
      }
    });

    // Sort by age
    male.sort((a, b) => a.ageInMonths - b.ageInMonths);
    female.sort((a, b) => a.ageInMonths - b.ageInMonths);

    return {
      male,
      female,
      lastUpdate: Date.now(),
    };
  }

  /**
   * Parse WHO CSV data (single gender per file)
   */
  private parseWHOData(data: WHODataRow[]): GrowthChartDataPoint[] {
    const points: GrowthChartDataPoint[] = [];

    data.forEach((row: WHODataRow) => {
      // WHO files use "Month" instead of "Agemos"
      const ageInMonths = row.Month !== undefined ? row.Month : row.month;

      if (ageInMonths === undefined || ageInMonths === null) {
        return;
      } // Skip invalid rows

      points.push({
        ageInMonths: ageInMonths,
        L: row.L,
        M: row.M,
        S: row.S,
      });
    });

    // Sort by age
    points.sort((a, b) => a.ageInMonths - b.ageInMonths);

    return points;
  }

  /**
   * Check if cached data is still valid
   */
  private async isCacheValid(cacheKey: string): Promise<boolean> {
    try {
      const lastUpdateStr = await AsyncStorage.getItem(
        CACHE_KEYS.LAST_UPDATE + cacheKey,
      );
      if (!lastUpdateStr) {
        return false;
      }

      const lastUpdate = parseInt(lastUpdateStr, 10);
      const now = Date.now();

      return now - lastUpdate < CACHE_DURATION;
    } catch (error) {
      logger.error('Error checking cache validity:', error);
      return false;
    }
  }

  /**
   * Load data from cache
   */
  private async loadFromCache(cacheKey: string): Promise<CDCDataCache | null> {
    try {
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (!cachedData) {
        return null;
      }

      return JSON.parse(cachedData);
    } catch (error) {
      logger.error('Error loading from cache:', error);
      return null;
    }
  }

  /**
   * Save data to cache
   */
  private async saveToCache(
    cacheKey: string,
    data: CDCDataCache,
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
      await AsyncStorage.setItem(
        CACHE_KEYS.LAST_UPDATE + cacheKey,
        Date.now().toString(),
      );
    } catch (error) {
      logger.error('Error saving to cache:', error);
    }
  }

  /**
   * Fetch CDC data from remote URL
   */
  private async fetchRemoteData(url: string): Promise<CDCDataCache> {
    try {
      // Fetch CSV file from CDC
      console.log(`Fetching CDC data from: ${url}`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get CSV text
      const csvText = await response.text();

      // Parse CSV using PapaParse
      const results = Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      });

      if (results.errors && results.errors.length > 0) {
        logger.warn('CSV parsing warnings:', results.errors);
      }

      // Transform and return data
      const parsedData = this.parseCDCData(results.data as CDCDataRow[]);
      console.log(
        `Successfully fetched and parsed CDC data: ${parsedData.male.length} male, ${parsedData.female.length} female data points`,
      );

      return parsedData;
    } catch (error) {
      logger.error('Error fetching remote data:', error);
      throw error;
    }
  }

  /**
   * Fetch WHO data from remote URL (single gender per file)
   */
  private async fetchWHORemoteData(
    url: string,
  ): Promise<GrowthChartDataPoint[]> {
    try {
      // Fetch CSV file from CDC FTP
      console.log(`Fetching WHO data from: ${url}`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get CSV text
      const csvText = await response.text();

      // Parse CSV using PapaParse
      const results = Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      });

      if (results.errors && results.errors.length > 0) {
        logger.warn('CSV parsing warnings:', results.errors);
      }

      // Transform and return data
      const parsedData = this.parseWHOData(results.data as WHODataRow[]);
      console.log(
        `Successfully fetched and parsed WHO data: ${parsedData.length} data points`,
      );

      return parsedData;
    } catch (error) {
      logger.error('Error fetching WHO remote data:', error);
      throw error;
    }
  }

  /**
   * Get CDC data for a specific measurement type
   * Uses cache if available and valid, otherwise fetches from remote
   */
  private async getCDCData(
    url: string,
    cacheKey: string,
  ): Promise<CDCDataCache> {
    // Check if we're already loading this data
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    const loadingPromise = (async () => {
      try {
        // Check cache first
        const cacheValid = await this.isCacheValid(cacheKey);
        if (cacheValid) {
          const cachedData = await this.loadFromCache(cacheKey);
          if (cachedData) {
            console.log(`Using cached CDC data for ${cacheKey}`);
            return cachedData;
          }
        }

        // Fetch from remote
        console.log(`Fetching CDC data from ${url}`);
        const remoteData = await this.fetchRemoteData(url);

        // Save to cache
        await this.saveToCache(cacheKey, remoteData);

        return remoteData;
      } catch (error) {
        logger.error(`Error fetching CDC data for ${cacheKey}:`, error);

        // Try to use expired cache as fallback
        const cachedData = await this.loadFromCache(cacheKey);
        if (cachedData) {
          console.log(`Using expired cache for ${cacheKey} as fallback`);
          return cachedData;
        }

        throw error;
      } finally {
        this.loadingPromises.delete(cacheKey);
      }
    })();

    this.loadingPromises.set(cacheKey, loadingPromise);
    return loadingPromise;
  }

  /**
   * Merge infant and child datasets, removing duplicates in overlap range
   */
  private mergeDatasets(
    infant: GrowthChartDataPoint[],
    child: GrowthChartDataPoint[],
  ): GrowthChartDataPoint[] {
    // Use infant data up to 36 months, then child data for 36+ months
    // This avoids duplicates in the 24-36 month overlap
    const infantData = (infant || []).filter(p => p.ageInMonths <= 36);
    const childData = (child || []).filter(p => p.ageInMonths > 36);
    return [...infantData, ...childData].sort(
      (a, b) => a.ageInMonths - b.ageInMonths,
    );
  }

  /**
   * Get Weight-for-Age data (combines infant + child datasets)
   */
  async getWeightForAgeData(): Promise<CDCDataCache> {
    const [infantData, childData] = await Promise.all([
      this.getCDCData(
        CDC_URLS.WEIGHT_FOR_AGE_INFANT,
        CACHE_KEYS.WEIGHT_FOR_AGE_INFANT,
      ),
      this.getCDCData(
        CDC_URLS.WEIGHT_FOR_AGE_CHILD,
        CACHE_KEYS.WEIGHT_FOR_AGE_CHILD,
      ),
    ]);

    return {
      male: this.mergeDatasets(infantData.male, childData.male),
      female: this.mergeDatasets(infantData.female, childData.female),
      lastUpdate: Date.now(),
    };
  }

  /**
   * Get Height-for-Age data (combines infant + child datasets)
   */
  async getHeightForAgeData(): Promise<CDCDataCache> {
    const [infantData, childData] = await Promise.all([
      this.getCDCData(
        CDC_URLS.HEIGHT_FOR_AGE_INFANT,
        CACHE_KEYS.HEIGHT_FOR_AGE_INFANT,
      ),
      this.getCDCData(
        CDC_URLS.HEIGHT_FOR_AGE_CHILD,
        CACHE_KEYS.HEIGHT_FOR_AGE_CHILD,
      ),
    ]);

    return {
      male: this.mergeDatasets(infantData.male, childData.male),
      female: this.mergeDatasets(infantData.female, childData.female),
      lastUpdate: Date.now(),
    };
  }

  /**
   * Get Head Circumference-for-Age data
   */
  async getHeadCircForAgeData(): Promise<CDCDataCache> {
    return this.getCDCData(
      CDC_URLS.HEAD_CIRC_FOR_AGE,
      CACHE_KEYS.HEAD_CIRC_FOR_AGE,
    );
  }

  /**
   * Fetch WHO data (separate files for boys/girls)
   */
  private async getWHOData(
    boysUrl: string,
    girlsUrl: string,
    cacheKey: string,
  ): Promise<CDCDataCache> {
    // Check if we're already loading
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    const loadingPromise = (async () => {
      try {
        // Check cache first
        const cacheValid = await this.isCacheValid(cacheKey);
        if (cacheValid) {
          const cachedData = await this.loadFromCache(cacheKey);
          if (cachedData) {
            console.log(`Using cached WHO data for ${cacheKey}`);
            return cachedData;
          }
        }

        // Fetch both boys and girls data using WHO-specific parser
        console.log(`Fetching WHO data from ${boysUrl} and ${girlsUrl}`);
        const [boysData, girlsData] = await Promise.all([
          this.fetchWHORemoteData(boysUrl),
          this.fetchWHORemoteData(girlsUrl),
        ]);

        const combined: CDCDataCache = {
          male: boysData,
          female: girlsData,
          lastUpdate: Date.now(),
        };

        // Save to cache
        await this.saveToCache(cacheKey, combined);

        return combined;
      } catch (error) {
        logger.error(`Error fetching WHO data for ${cacheKey}:`, error);

        // Try to use expired cache as fallback
        const cachedData = await this.loadFromCache(cacheKey);
        if (cachedData) {
          console.log(`Using expired cache for ${cacheKey} as fallback`);
          return cachedData;
        }

        throw error;
      } finally {
        this.loadingPromises.delete(cacheKey);
      }
    })();

    this.loadingPromises.set(cacheKey, loadingPromise);
    return loadingPromise;
  }

  /**
   * Get WHO Weight-for-Age data (birth to 24 months)
   */
  async getWHOWeightForAgeData(): Promise<CDCDataCache> {
    return this.getWHOData(
      'https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Boys-Weight-for-age-Percentiles.csv',
      'https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Girls-Weight-for-age%20Percentiles.csv',
      CACHE_KEYS.WHO_WEIGHT_FOR_AGE_INFANT,
    );
  }

  /**
   * Get WHO Length-for-Age data (birth to 24 months)
   */
  async getWHOLengthForAgeData(): Promise<CDCDataCache> {
    return this.getWHOData(
      'https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Boys-Length-for-age-Percentiles.csv',
      'https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Girls-Length-for-age-Percentiles.csv',
      CACHE_KEYS.WHO_LENGTH_FOR_AGE_INFANT,
    );
  }

  /**
   * Get WHO Head Circumference-for-Age data (birth to 24 months)
   */
  async getWHOHeadCircForAgeData(): Promise<CDCDataCache> {
    return this.getWHOData(
      'https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Boys-Head-Circumference-for-age-Percentiles.csv',
      'https://ftp.cdc.gov/pub/Health_Statistics/NCHS/growthcharts/WHO-Girls-Head-Circumference-for-age-Percentiles.csv',
      CACHE_KEYS.WHO_HEAD_CIRC_FOR_AGE,
    );
  }

  /**
   * Get BMI-for-Age data
   */
  async getBMIForAgeData(): Promise<CDCDataCache> {
    return this.getCDCData(CDC_URLS.BMI_FOR_AGE, CACHE_KEYS.BMI_FOR_AGE);
  }

  /**
   * Get chart data for a specific measurement type and sex
   */
  async getChartData(
    measurementType: string,
    sex: 'male' | 'female',
  ): Promise<GrowthChartDataPoint[]> {
    let data: CDCDataCache;

    switch (measurementType) {
      case 'weight':
        data = await this.getWeightForAgeData();
        break;
      case 'height':
        data = await this.getHeightForAgeData();
        break;
      case 'headCircumference':
        data = await this.getHeadCircForAgeData();
        break;
      default:
        throw new Error(`Unknown measurement type: ${measurementType}`);
    }

    return data[sex];
  }

  /**
   * Clear all cached CDC data
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        CACHE_KEYS.WEIGHT_FOR_AGE_INFANT,
        CACHE_KEYS.WEIGHT_FOR_AGE_CHILD,
        CACHE_KEYS.HEIGHT_FOR_AGE_INFANT,
        CACHE_KEYS.HEIGHT_FOR_AGE_CHILD,
        CACHE_KEYS.HEAD_CIRC_FOR_AGE,
        CACHE_KEYS.BMI_FOR_AGE,
        CACHE_KEYS.WHO_WEIGHT_FOR_AGE_INFANT,
        CACHE_KEYS.WHO_LENGTH_FOR_AGE_INFANT,
        CACHE_KEYS.WHO_HEAD_CIRC_FOR_AGE,
        CACHE_KEYS.LAST_UPDATE + CACHE_KEYS.WEIGHT_FOR_AGE_INFANT,
        CACHE_KEYS.LAST_UPDATE + CACHE_KEYS.WEIGHT_FOR_AGE_CHILD,
        CACHE_KEYS.LAST_UPDATE + CACHE_KEYS.HEIGHT_FOR_AGE_INFANT,
        CACHE_KEYS.LAST_UPDATE + CACHE_KEYS.HEIGHT_FOR_AGE_CHILD,
        CACHE_KEYS.LAST_UPDATE + CACHE_KEYS.HEAD_CIRC_FOR_AGE,
        CACHE_KEYS.LAST_UPDATE + CACHE_KEYS.BMI_FOR_AGE,
        CACHE_KEYS.LAST_UPDATE + CACHE_KEYS.WHO_WEIGHT_FOR_AGE_INFANT,
        CACHE_KEYS.LAST_UPDATE + CACHE_KEYS.WHO_LENGTH_FOR_AGE_INFANT,
        CACHE_KEYS.LAST_UPDATE + CACHE_KEYS.WHO_HEAD_CIRC_FOR_AGE,
      ]);
    } catch (error) {
      logger.error('Error clearing cache:', error);
    }
  }

  /**
   * Preload all CDC data (useful for first app launch or settings screen)
   */
  async preloadAllData(): Promise<void> {
    await Promise.all([
      this.getWeightForAgeData(),
      this.getHeightForAgeData(),
      this.getHeadCircForAgeData(),
      this.getBMIForAgeData(),
    ]);
  }
}

// Export singleton instance
export default new CDCDataService();
