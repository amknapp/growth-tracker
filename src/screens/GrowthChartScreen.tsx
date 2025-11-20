/**
 * Growth Chart Screen
 * Displays growth chart with percentile curves and child's data
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  AreaRange,
  CartesianChart,
  Line,
  Scatter,
  useChartTransformState,
} from 'victory-native';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
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
  const deleteMeasurement = useAppDataStore(state => state.deleteMeasurement);

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

  // Pan and zoom state for the chart - with throttling to prevent Skia crashes
  const rawChartTransform = useChartTransformState();
  const lastUpdateTime = useSharedValue(0);
  const lastTransformValue = useSharedValue(rawChartTransform.state.value);

  // Throttle to 30fps (33ms between updates) to reduce Skia rendering load
  const throttledState = useDerivedValue(() => {
    'worklet';
    const now = Date.now();
    if (now - lastUpdateTime.value >= 33) {
      lastUpdateTime.value = now;
      lastTransformValue.value = rawChartTransform.state.value;
    }
    return lastTransformValue.value;
  });

  // Wrap throttled state in the expected structure
  const chartTransformState = useMemo(() => ({
    state: throttledState,
  }), [throttledState]);

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

    // Determine age range - focus on relevant window for initial view,
    // but load more data to support zooming out
    let initialMinAge = 0;
    let initialMaxAge = 36; // Default initial view: first 3 years

    if (measurements.length > 0) {
      const childAges = measurements.map(m =>
        calculateAgeInMonths(child.birthDate, m.date),
      );
      const childMinAge = Math.min(...childAges);
      const childMaxAge = Math.max(...childAges);

      // Show window around child's data (±3 months buffer on each side)
      initialMinAge = Math.max(0, Math.floor(childMinAge - 3));
      initialMaxAge = Math.ceil(childMaxAge + 3);

      // Ensure at least 6 months wide for initial view
      const range = initialMaxAge - initialMinAge;
      if (range < 6) {
        const expansion = (6 - range) / 2;
        initialMinAge = Math.max(0, initialMinAge - expansion);
        initialMaxAge = initialMaxAge + expansion;
      }
    }

    // Load data with extended range to support zooming
    // Use a reasonable maximum (60 months = 5 years for most pediatric charts)
    // This provides plenty of room for zoom out without overwhelming the renderer
    const minAge = 0;
    const maxAge = Math.max(60, initialMaxAge + 12); // At least 5 years, or child's age + 1 year

    // Get all unique x values (ages) that we need
    const percentilesToShow = [5, 25, 50, 75, 95];
    const allAges = new Set<number>();

    // Collect ages from percentile curves within the extended range
    percentilesToShow.forEach(percentile => {
      const curve = getPercentileCurve(percentile, chartData);
      curve
        .filter(
          point => point.ageInMonths >= minAge && point.ageInMonths <= maxAge,
        )
        .forEach(point => allAges.add(point.ageInMonths));
    });

    // Sort all ages from percentiles
    const sortedAges = Array.from(allAges).sort((a, b) => a - b);

    // Build data array with ONLY percentile values (no mixed data)
    type PercentileDataPoint = {
      x: number;
      p5: number;
      p25: number;
      p50: number;
      p75: number;
      p95: number;
    };

    const percentileData: PercentileDataPoint[] = sortedAges
      .map(age => {
        const dataPoint: Partial<PercentileDataPoint> = { x: age };
        let hasAllValues = true;

        percentilesToShow.forEach(percentile => {
          const curve = getPercentileCurve(percentile, chartData);
          const point = curve.find(p => Math.abs(p.ageInMonths - age) < 0.1);
          if (point) {
            const key = `p${percentile}` as keyof Omit<
              PercentileDataPoint,
              'x'
            >;
            dataPoint[key] = point.value;
          } else {
            hasAllValues = false;
          }
        });

        return hasAllValues ? (dataPoint as PercentileDataPoint) : null;
      })
      .filter((p): p is PercentileDataPoint => p !== null);

    // Create completely separate data array for child's measurements
    const childMeasurementData = measurements.map(m => ({
      x: calculateAgeInMonths(child.birthDate, m.date),
      y: m.value,
    }));

    return {
      percentileData,
      childMeasurementData,
      minAge,
      maxAge,
      initialMinAge,
      initialMaxAge,
    };
  }, [child, chartData, measurements]);

  const victoryData = useMemo(() => prepareVictoryData(), [prepareVictoryData]);

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

  const handleDeleteMeasurement = (measurementId: string) => {
    Alert.alert(
      'Delete Measurement',
      'Are you sure you want to delete this measurement?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMeasurement(measurementId);
              loadData();
            } catch (err) {
              logger.error('Error deleting measurement:', err);
              Alert.alert('Error', 'Failed to delete measurement');
            }
          },
        },
      ],
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    measurementId: string,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.deleteButtonContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteMeasurement(measurementId)}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Icon name="delete" size={28} color="#fff" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
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

      <ScrollView style={styles.scrollView}>
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

        {!loadingChart && (
          <View style={styles.chartContainer}>
            <View style={styles.chartTitleContainer}>
              <Text style={styles.chartTitle}>Growth Chart</Text>
              <Text style={styles.chartHint}>
                Pinch to zoom • Drag to pan
              </Text>
            </View>

            {victoryData ? (
              <>
                <View style={styles.chartCanvasContainer}>
                  {/* Percentile curves chart */}
                  <CartesianChart
                    data={victoryData.percentileData}
                    xKey="x"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    yKeys={['p5', 'p25', 'p50', 'p75', 'p95'] as any}
                    domain={{
                      x: [victoryData.initialMinAge, victoryData.initialMaxAge],
                    }}
                    axisOptions={{
                      tickCount: 5,
                      labelColor: colors.primary,
                      labelPosition: { x: 'inset', y: 'inset' },
                      formatYLabel: value => `${value}`,
                      formatXLabel: value => `${value}`,
                    }}
                    domainPadding={{ left: 10, right: 10, top: 20, bottom: 20 }}
                    transformState={chartTransformState}
                  >
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {({ points }: any) => (
                      <>
                        {/* Percentile curves with shaded areas */}
                        <Line
                          points={points.p5}
                          color="#ccc"
                          strokeWidth={1}
                          curveType="natural"
                        />
                        <AreaRange
                          lowerPoints={points.p5}
                          upperPoints={points.p25}
                          opacity={0.1}
                        />
                        <Line
                          points={points.p25}
                          color="#ccc"
                          strokeWidth={1}
                          curveType="natural"
                        />
                        <AreaRange
                          lowerPoints={points.p25}
                          upperPoints={points.p75}
                          opacity={0.2}
                        />
                        <Line
                          points={points.p50}
                          color="#999"
                          strokeWidth={2}
                          curveType="natural"
                        />
                        <AreaRange
                          lowerPoints={points.p75}
                          upperPoints={points.p95}
                          opacity={0.1}
                        />
                        <Line
                          points={points.p75}
                          color="#ccc"
                          strokeWidth={1}
                          curveType="natural"
                        />
                        <Line
                          points={points.p95}
                          color="#ccc"
                          strokeWidth={1}
                          curveType="natural"
                        />
                      </>
                    )}
                  </CartesianChart>

                  {/* Child measurements chart - overlaid */}
                  {victoryData.childMeasurementData.length > 0 && (
                    <View style={StyleSheet.absoluteFill} pointerEvents="none">
                      <CartesianChart
                        data={victoryData.childMeasurementData}
                        xKey="x"
                        yKeys={['y']}
                        domain={{
                          x: [
                            victoryData.initialMinAge,
                            victoryData.initialMaxAge,
                          ],
                        }}
                        axisOptions={{
                          tickCount: 0,
                          labelColor: 'transparent',
                        }}
                        domainPadding={{
                          left: 10,
                          right: 10,
                          top: 20,
                          bottom: 20,
                        }}
                        transformState={chartTransformState}
                      >
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {({ points }: any) => (
                          <Scatter
                            points={points.y}
                            radius={6}
                            shape="circle"
                            style="fill"
                            color={colors.primary}
                          />
                        )}
                      </CartesianChart>
                    </View>
                  )}
                </View>
                <View style={styles.legend}>
                  <Text style={styles.legendTitle}>Percentile Curves</Text>
                  <View style={styles.legendItems}>
                    <View style={styles.legendItem}>
                      <View style={styles.legendLineGray} />
                      <Text style={styles.legendText}>
                        5th, 25th, 75th, 95th
                      </Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={styles.legendLineDarkGray} />
                      <Text style={styles.legendText}>50th (median)</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={styles.legendCircle} />
                      <Text style={styles.legendText}>
                        Child's measurements
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.emptyChart}>
                <Text style={styles.emptyChartText}>
                  No measurements to display
                </Text>
                <Text style={styles.emptyChartSubtext}>
                  Add measurements to see the growth chart
                </Text>
              </View>
            )}
          </View>
        )}

        {measurements.length > 0 && !loadingChart && (
          <View style={styles.measurementsList}>
            <Text style={styles.measurementsTitle}>All Measurements</Text>
            {measurements.map(m => (
              <Swipeable
                key={m.id}
                renderRightActions={(progress, dragX) =>
                  renderRightActions(progress, dragX, m.id)
                }
                overshootRight={false}
              >
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementDate}>{m.date}</Text>
                  <Text style={styles.measurementValue}>
                    {m.value.toFixed(1)} {getYAxisLabel()}
                  </Text>
                </View>
              </Swipeable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const getStyles = (colors: typeof import('../constants/colors').LightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
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
      margin: 16,
      padding: 20,
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
      marginBottom: 8,
    },
    statsValue: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    statsPercentile: {
      fontSize: 18,
      color: colors.primary,
      fontWeight: '600',
      marginBottom: 4,
    },
    statsInterpretation: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    chartContainer: {
      backgroundColor: colors.card,
      margin: 16,
      marginTop: 0,
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
    emptyChart: {
      height: 200,
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
    measurementsList: {
      backgroundColor: colors.card,
      margin: 16,
      marginTop: 0,
      padding: 16,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    measurementsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    measurementItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 4,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    measurementDate: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    measurementValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    deleteButtonContainer: {
      justifyContent: 'center',
    },
    deleteButton: {
      backgroundColor: colors.error,
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      height: '100%',
      borderRadius: 0,
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
      height: 350,
      width: '100%',
    },
  });

export default GrowthChartScreen;
