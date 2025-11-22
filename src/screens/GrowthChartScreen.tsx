/**
 * Growth Chart Screen
 * Displays growth chart with percentile curves and child's data
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AreaRange,
  CartesianChart,
  Line,
  Scatter,
  useChartPressState,
} from 'victory-native';
import {
  GrowthChartNavigationProp,
  GrowthChartRouteProp,
} from '../types/navigation';
import {
  ChartStandard,
  Child,
  GrowthChartDataPoint,
  Measurement,
} from '../types';
import { useAppDataStore } from '../store/appDataStore';
import CDCDataService from '../services/CDCDataService';
import { calculateAgeInMonths } from '../utils/ageCalculator';
import {
  calculatePercentile,
  getPercentileCurve,
  interpretPercentile,
} from '../utils/percentileCalculator';
import { useTheme } from '../hooks/useTheme';
import AppHeader from '../components/AppHeader';
import { logger } from '../utils/logger';
import { ToolTipOverlay } from '../components/ToolTipOverlay';

interface Props {
  navigation: GrowthChartNavigationProp;
  route: GrowthChartRouteProp;
}

const GrowthChartScreen: React.FC<Props> = ({
  navigation: _navigation,
  route,
}) => {
  const { childId, measurementType } = route.params;
  const getChild = useAppDataStore(state => state.getChild);
  const getMeasurementsByType = useAppDataStore(
    state => state.getMeasurementsByType,
  );

  const [child, setChild] = useState<Child | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [chartStandard, setChartStandard] = useState<ChartStandard>('CDC');
  const [chartData, setChartData] = useState<GrowthChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_chartWidth, setChartWidth] = useState(
    Dimensions.get('window').width - 16,
  );
  const { colors } = useTheme();

  // Press state for tooltips
  // Initialize with data range to match chart domain
  const { state: chartPressState } = useChartPressState({
    x: 0.5, // Match the chart's minAge
    y: { x: 0.5, child: 0, p5: 0, p25: 0, p50: 0, p75: 0, p95: 0 },
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setChartWidth(window.width - 16);
    });

    return () => subscription?.remove();
  }, []);

  const loadData = useCallback(() => {
    try {
      const childData = getChild(childId);
      const measurementsData = getMeasurementsByType(childId, measurementType);

      setChild(childData);
      setMeasurements(measurementsData);
    } catch (err) {
      logger.error('Error loading data:', err);
      setError('Failed to load child data');
      Alert.alert('Error', 'Failed to load chart data');
    } finally {
      setLoading(false);
    }
  }, [childId, measurementType, getChild, getMeasurementsByType]);

  const loadChartData = useCallback(async () => {
    if (!child) {
      return;
    }

    setLoadingChart(true);
    setError(null);

    try {
      let data: GrowthChartDataPoint[];

      if (chartStandard === 'CDC') {
        // Use official CDC data service
        data = await CDCDataService.getChartData(measurementType, child.sex);
      } else {
        // Use official WHO data service
        let whoData;
        switch (measurementType) {
          case 'weight':
            whoData = await CDCDataService.getWHOWeightForAgeData();
            break;
          case 'height':
            whoData = await CDCDataService.getWHOLengthForAgeData();
            break;
          case 'headCircumference':
            whoData = await CDCDataService.getWHOHeadCircForAgeData();
            break;
          default:
            throw new Error(`Unknown measurement type: ${measurementType}`);
        }
        data = whoData[child.sex];
      }

      setChartData(data);
    } catch (err) {
      logger.error('Error loading chart data:', err);
      setError(
        'Failed to load growth chart data. Please check your internet connection. ' +
          'Growth chart data will be cached for 30 days after the first successful download.',
      );
      setChartData([]);
    } finally {
      setLoadingChart(false);
    }
  }, [child, chartStandard, measurementType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (child) {
      loadChartData();
    }
  }, [child, loadChartData]);

  // Prepare chart data for Victory - MUST be before early returns
  const prepareVictoryData = useCallback(() => {
    if (!child || chartData.length === 0) {
      return null;
    }

    // Get all unique x values (ages) from the full dataset
    const percentilesToShow = [5, 25, 50, 75, 95];
    const allAges = new Set<number>();

    // Collect all ages from percentile curves
    percentilesToShow.forEach(percentile => {
      const curve = getPercentileCurve(percentile, chartData);
      curve.forEach(point => allAges.add(point.ageInMonths));
    });

    // Sort all ages from percentiles
    const sortedAges = Array.from(allAges).sort((a, b) => a - b);

    // Use full data range for the domain (show entire chart)
    const minAge = sortedAges.length > 0 ? sortedAges[0] : 0;
    const maxAge =
      sortedAges.length > 0 ? sortedAges[sortedAges.length - 1] : 36;

    // Debug: Log first 10 ages to see data distribution
    // Build data array with all percentiles
    type ChartDataPoint = {
      x: number;
      p5?: number;
      p25?: number;
      p50?: number;
      p75?: number;
      p95?: number;
      child?: number;
    };

    // Reduce percentile data density for better tap detection
    // Only include every Nth age to reduce data points from ~242 to ~40-50
    const percentileDataInterval = 5; // Every 2.5 months (0.5 * 5)
    const filteredAges = sortedAges.filter(
      (_, index) => index % percentileDataInterval === 0,
    );

    const percentileData: ChartDataPoint[] = filteredAges.map(age => {
      const dataPoint: ChartDataPoint = { x: age };
      percentilesToShow.forEach(percentile => {
        const curve = getPercentileCurve(percentile, chartData);
        const point = curve.find(p => Math.abs(p.ageInMonths - age) < 0.1);
        if (point) {
          const key = `p${percentile}` as keyof Omit<ChartDataPoint, 'x'>;
          dataPoint[key] = point.value;
        }
      });
      return dataPoint;
    });

    // Create data points for child's measurements - keep each as separate point
    const childMeasurementData = measurements.map(m => ({
      x: calculateAgeInMonths(child.birthDate, m.date),
      child: m.value,
    }));

    // Combine percentile data and child measurement data
    const data = [...percentileData, ...childMeasurementData].sort(
      (a, b) => a.x - b.x,
    );

    // Calculate y-axis range from full data
    let initialMinY: number | undefined;
    let initialMaxY: number | undefined;

    const allYValues: number[] = [];
    data.forEach(point => {
      if ('p5' in point && point.p5 !== undefined) {
        allYValues.push(point.p5);
      }
      if ('p95' in point && point.p95 !== undefined) {
        allYValues.push(point.p95);
      }
      if ('child' in point && point.child !== undefined) {
        allYValues.push(point.child);
      }
    });

    if (allYValues.length > 0) {
      const minY = Math.min(...allYValues);
      const maxY = Math.max(...allYValues);
      const padding = (maxY - minY) * 0.1; // 10% padding
      initialMinY = Math.max(0, minY - padding);
      initialMaxY = maxY + padding;
    }

    return {
      data,
      yKeys: ['child', 'p5', 'p25', 'p50', 'p75', 'p95'], // child FIRST for tap priority
      initialMinAge: minAge,
      initialMaxAge: maxAge,
      initialMinY,
      initialMaxY,
    };
  }, [child, chartData, measurements]);

  const victoryData = useMemo(() => prepareVictoryData(), [prepareVictoryData]);

  // Prepare child measurements for tooltip proximity detection
  const childMeasurementsForTooltip = useMemo(() => {
    if (!child) {
      return [];
    }
    return measurements.map(m => ({
      age: calculateAgeInMonths(child.birthDate, m.date),
      value: m.value,
    }));
  }, [child, measurements]);

  const styles = getStyles(colors);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!child) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Data not found</Text>
      </View>
    );
  }

  // Calculate latest percentile
  let latestPercentileData = null;
  if (measurements.length > 0 && chartData.length > 0) {
    const latestMeasurement = measurements[measurements.length - 1];
    const ageInMonths = calculateAgeInMonths(
      child.birthDate,
      latestMeasurement.date,
    );
    latestPercentileData = calculatePercentile(
      latestMeasurement.value,
      ageInMonths,
      chartData,
    );
  }

  const getMeasurementLabel = (): string => {
    switch (measurementType) {
      case 'weight':
        return 'Weight';
      case 'height':
        return 'Height';
      case 'headCircumference':
        return 'Head Circumference';
      default:
        return 'Measurement';
    }
  };

  const getYAxisLabel = (): string => {
    return measurementType === 'weight' ? 'kg' : 'cm';
  };

  return (
    <View style={styles.container}>
      <AppHeader title={child.name} subtitle={getMeasurementLabel()} />

      <View style={styles.standardToggleContainer}>
        <TouchableOpacity
          style={[
            styles.standardButton,
            chartStandard === 'CDC' && styles.standardButtonSelected,
          ]}
          onPress={() => setChartStandard('CDC')}
        >
          <Text
            style={[
              styles.standardButtonText,
              chartStandard === 'CDC' && styles.standardButtonTextSelected,
            ]}
          >
            CDC
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.standardButton,
            chartStandard === 'WHO' && styles.standardButtonSelected,
          ]}
          onPress={() => setChartStandard('WHO')}
        >
          <Text
            style={[
              styles.standardButtonText,
              chartStandard === 'WHO' && styles.standardButtonTextSelected,
            ]}
          >
            WHO
          </Text>
        </TouchableOpacity>
      </View>

      {latestPercentileData && !loadingChart && (
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Latest Measurement</Text>
          <Text style={styles.statsValue}>
            {latestPercentileData.value.toFixed(1)} {getYAxisLabel()}
          </Text>
          <Text style={styles.statsPercentile}>
            {latestPercentileData.percentile.toFixed(1)}th percentile
          </Text>
          <Text style={styles.statsInterpretation}>
            {interpretPercentile(latestPercentileData.percentile)}
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {loadingChart && (
        <View style={styles.chartLoadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.chartLoadingText}>
            Loading growth chart data...
          </Text>
        </View>
      )}

      {!loadingChart && victoryData && (
        <View style={styles.chartContainer}>
          <View style={styles.chartTitleContainer}>
            <Text style={styles.chartTitle}>Growth Chart</Text>
            <Text style={styles.chartHint}>Tap points for details</Text>
          </View>
          <View style={styles.chartCanvasContainer}>
            <CartesianChart
              data={victoryData.data}
              xKey="x"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              yKeys={victoryData.yKeys as any}
              padding={{ left: 20, right: 20, top: 20, bottom: 20 }}
              axisOptions={{
                labelColor: colors.primary,
                labelPosition: { x: 'inset', y: 'inset' },
                formatYLabel: value => `${value}`,
                formatXLabel: value => `${value}`,
              }}
              domainPadding={{ left: 0, right: 0, top: 20, bottom: 20 }}
              domain={{
                x: [victoryData.initialMinAge, victoryData.initialMaxAge],
                y:
                  victoryData.initialMinY !== undefined &&
                  victoryData.initialMaxY !== undefined
                    ? [victoryData.initialMinY, victoryData.initialMaxY]
                    : undefined,
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              chartPressState={chartPressState as any}
            >
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {({ points }: any) => (
                <>
                  {/* Percentile curves - with reduced data density for better tap detection */}
                  <Line
                    points={points.p5}
                    color="#ccc"
                    strokeWidth={1}
                    curveType="natural"
                    connectMissingData={true}
                  />
                  <AreaRange
                    lowerPoints={points.p5}
                    upperPoints={points.p25}
                    connectMissingData={true}
                    opacity={0.1}
                  />
                  <Line
                    points={points.p25}
                    color="#ccc"
                    strokeWidth={1}
                    curveType="natural"
                    connectMissingData={true}
                  />
                  <AreaRange
                    lowerPoints={points.p25}
                    upperPoints={points.p75}
                    connectMissingData={true}
                    opacity={0.2}
                  />
                  <AreaRange
                    lowerPoints={points.p75}
                    upperPoints={points.p95}
                    connectMissingData={true}
                    opacity={0.1}
                  />
                  <Line
                    points={points.p50}
                    color="#999"
                    strokeWidth={2}
                    curveType="natural"
                    connectMissingData={true}
                  />
                  <Line
                    points={points.p75}
                    color="#ccc"
                    strokeWidth={1}
                    curveType="natural"
                    connectMissingData={true}
                  />
                  <Line
                    points={points.p95}
                    color="#ccc"
                    strokeWidth={1}
                    curveType="natural"
                    connectMissingData={true}
                  />

                  {/* Child's measurements as scatter points - RENDER LAST (on top) */}
                  <Scatter
                    points={points.child}
                    radius={6}
                    shape="circle"
                    style="fill"
                    color={colors.primary}
                  />
                </>
              )}
            </CartesianChart>
            <ToolTipOverlay
              x={chartPressState.x}
              y={chartPressState.y}
              isActive={chartPressState.isActive}
              childMeasurements={childMeasurementsForTooltip}
              proximityThreshold={3.0}
            />
          </View>
          <View style={styles.legend}>
            <Text style={styles.legendTitle}>Percentile Curves</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={styles.legendLineGray} />
                <Text style={styles.legendText}>5th, 25th, 75th, 95th</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.legendLineDarkGray} />
                <Text style={styles.legendText}>50th (median)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.legendCircle} />
                <Text style={styles.legendText}>Child's measurements</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {!loadingChart && !victoryData && (
        <View style={styles.emptyChartContainer}>
          <View style={styles.emptyChart}>
            <Text style={styles.emptyChartText}>
              No measurements to display
            </Text>
            <Text style={styles.emptyChartSubtext}>
              Add measurements to see the growth chart
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const getStyles = (colors: typeof import('../constants/colors').LightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    standardToggleContainer: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: colors.primary,
    },
    standardButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#fff',
      alignItems: 'center',
    },
    standardButtonSelected: {
      backgroundColor: '#fff',
    },
    standardButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#fff',
    },
    standardButtonTextSelected: {
      color: colors.primary,
    },
    statsCard: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginVertical: 8,
      padding: 16,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    statsTitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    statsValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 2,
    },
    statsPercentile: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
      marginBottom: 2,
    },
    statsInterpretation: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    chartContainer: {
      flex: 1,
      backgroundColor: colors.card,
      margin: 16,
      paddingVertical: 16,
      paddingRight: 16,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    chartTitleContainer: {
      paddingLeft: 16,
      marginBottom: 12,
    },
    chartTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    chartHint: {
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    emptyChartContainer: {
      flex: 1,
      backgroundColor: colors.card,
      margin: 16,
      paddingVertical: 16,
      paddingRight: 16,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    emptyChart: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyChartText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    emptyChartSubtext: {
      fontSize: 14,
      color: colors.textLight,
    },
    legend: {
      marginTop: 16,
      paddingTop: 16,
      paddingHorizontal: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    legendTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    legendItems: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    legendLine: {
      width: 20,
      height: 1,
      backgroundColor: '#ccc',
    },
    legendLineGray: {
      width: 20,
      height: 1,
      backgroundColor: '#aaa',
    },
    legendLineDarkGray: {
      width: 20,
      height: 2,
      backgroundColor: '#666',
    },
    legendCircle: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
    legendText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    errorText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 100,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary,
    },
    errorBanner: {
      backgroundColor: '#FFF3CD',
      borderLeftWidth: 4,
      borderLeftColor: '#FFA500',
      padding: 12,
      margin: 16,
      borderRadius: 8,
    },
    errorBannerText: {
      fontSize: 14,
      color: '#856404',
    },
    chartLoadingContainer: {
      backgroundColor: colors.card,
      margin: 16,
      padding: 40,
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    chartLoadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary,
    },
    chartCanvasContainer: {
      flex: 1,
      width: '100%',
    },
  });

export default GrowthChartScreen;
