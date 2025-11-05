# CDC Data Integration

The Growth Tracker app now uses **official CDC growth chart data** fetched directly from the CDC website. This ensures accurate, up-to-date percentile calculations for children's growth tracking.

## How It Works

### 1. Data Sources

The app fetches CSV files from the official CDC website:

- **Weight-for-Age**: `https://www.cdc.gov/growthcharts/data/zscore/wtage.csv`
- **Height-for-Age (Stature)**: `https://www.cdc.gov/growthcharts/data/zscore/statage.csv`
- **Head Circumference-for-Age**: `https://www.cdc.gov/growthcharts/data/zscore/hcageinf.csv`
- **BMI-for-Age**: `https://www.cdc.gov/growthcharts/data/zscore/bmiagerev.csv`

### 2. Caching Strategy

To minimize network usage and ensure offline functionality:

- **30-day cache**: Data is cached locally for 30 days after first download
- **AsyncStorage**: Uses React Native's AsyncStorage for caching reference data
- **Automatic refresh**: Expired cache is automatically refreshed on next use
- **Offline fallback**: If network fails, uses local sample data

### 3. Data Format

CDC CSV files contain LMS parameters:
- **Sex**: 1 = male, 2 = female
- **Agemos**: Age in months
- **L**: Lambda (skewness parameter)
- **M**: Mu (median value)
- **S**: Sigma (coefficient of variation)

The service transforms this into our `GrowthChartDataPoint` format.

### 4. Implementation

#### CDCDataService (`src/services/CDCDataService.ts`)

The service handles:
- Fetching remote CSV files using native `fetch()` API
- Parsing CSV data using PapaParse
- Transforming CDC data to internal format
- Caching data locally in AsyncStorage
- Managing cache expiration (30-day TTL)
- Providing fallback for offline scenarios

**Technical Details:**
- Uses React Native's `fetch()` to download CSV files
- Parses CSV with `Papa.parse()` (header parsing, dynamic typing)
- Organizes data by sex (male/female) and age

#### Key Methods

```typescript
// Get weight data for CDC charts
await CDCDataService.getWeightForAgeData();

// Get height data
await CDCDataService.getHeightForAgeData();

// Get head circumference data
await CDCDataService.getHeadCircForAgeData();

// Get chart data by type and sex
await CDCDataService.getChartData('weight', 'male');

// Preload all data (useful for first launch)
await CDCDataService.preloadAllData();

// Clear cached data
await CDCDataService.clearCache();
```

## Usage in Screens

The `GrowthChartScreen` automatically:

1. Loads child and measurement data from secure storage
2. Fetches appropriate CDC chart data based on measurement type and child's sex
3. Shows loading indicator while fetching
4. Falls back to local data if network unavailable
5. Displays error banner if there are issues

### Loading States

- **Initial Load**: Full-screen loading indicator
- **Chart Data Load**: Inline loading indicator in chart area
- **Error State**: Yellow warning banner with fallback message

## Offline Support

The app handles offline scenarios gracefully:

1. **First Priority**: Use valid cached data (< 30 days old)
2. **Second Priority**: Attempt to fetch fresh data from CDC
3. **Third Priority**: Use expired cache as fallback
4. **Last Resort**: Use local sample data in `src/data/cdcData.ts`

## Performance

- **Lazy Loading**: Data is only fetched when needed
- **Deduplication**: Multiple simultaneous requests use the same Promise
- **Background Updates**: Cache refresh happens transparently
- **Minimal Bundle Size**: Full CDC datasets not included in app bundle

## Testing

To test the CDC data integration:

### 1. Network Scenarios

```typescript
// Simulate slow network
// Check that loading indicators appear

// Simulate offline
// Verify fallback to cached or local data

// Simulate network error
// Check error banner appears
```

### 2. Cache Behavior

```typescript
// Clear cache
await CDCDataService.clearCache();

// First load (should fetch from network)
await CDCDataService.getWeightForAgeData();

// Second load (should use cache)
await CDCDataService.getWeightForAgeData();
```

### 3. Data Accuracy

Compare percentile calculations against official CDC growth charts:
- https://www.cdc.gov/growthcharts/clinical_charts.htm

## Troubleshooting

### Data Not Loading

1. **Check Network**: Ensure device has internet connection
2. **Check Cache**: Clear cache and retry
3. **Check Logs**: Look for error messages in console
4. **Verify URLs**: Ensure CDC URLs are accessible

### Percentile Mismatch

1. **Data Version**: Verify CDC data is current
2. **Age Range**: Check child's age is within valid range
3. **Calculation Method**: Verify LMS formula implementation

### High Data Usage

The CDC CSV files are relatively small (~50-100KB each), but if concerned:

1. Use Wi-Fi for initial download
2. Implement manual refresh option
3. Increase cache duration
4. Consider bundling data with app

## Future Enhancements

Potential improvements:

1. **WHO Data Integration**: Fetch WHO data similarly
2. **Manual Refresh**: User-triggered data update
3. **Data Version Display**: Show which dataset version is being used
4. **Compression**: Compress cached data
5. **Incremental Updates**: Only fetch changed data
6. **Data Validation**: Verify data integrity with checksums

## WHO Charts

Currently, WHO charts use local sample data. To implement WHO data fetching:

1. Find official WHO CSV data sources
2. Create similar service (WHODataService)
3. Update GrowthChartScreen to use WHO service
4. Implement caching strategy

WHO provides standards at:
- https://www.who.int/tools/child-growth-standards/standards

## Security Considerations

- **Data Integrity**: CDC data is from official source
- **No PII**: Reference data contains no personal information
- **Public Data**: CDC growth charts are public domain
- **HTTPS**: All data fetched over secure connections

## Credits

Growth chart data provided by:
- **CDC**: Centers for Disease Control and Prevention
- **National Center for Health Statistics (NCHS)**

Reference:
> Kuczmarski RJ, Ogden CL, Guo SS, et al. 2000 CDC Growth Charts for the United States: methods and development. Vital Health Stat 11. 2002;(246):1-190.
