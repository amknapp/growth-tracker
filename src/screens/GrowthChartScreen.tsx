/**
 * Growth Chart Screen
 * Displays growth chart with percentile curves and child's data
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart } from 'react-native-chart-kit';
import { GrowthChartNavigationProp, GrowthChartRouteProp } from '../types/navigation';
import { Child, Measurement, ChartStandard, GrowthChartDataPoint } from '../types';
import SecureStorage from '../services/SecureStorage';
import CDCDataService from '../services/CDCDataService';
import { calculateAgeInMonths } from '../utils/ageCalculator';
import {
  calculatePercentile,
  getPercentileCurve,
  STANDARD_PERCENTILES,
  interpretPercentile,
} from '../utils/percentileCalculator';
import { getCDCChartData } from '../data/cdcData';
import { getWHOChartData } from '../data/whoData';
import { Colors } from '../constants/colors';

interface Props {
  navigation: GrowthChartNavigationProp;
  route: GrowthChartRouteProp;
}

const GrowthChartScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId, measurementType } = route.params;

  const [child, setChild] = useState<Child | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [chartStandard, setChartStandard] = useState<ChartStandard>('CDC');
  const [chartData, setChartData] = useState<GrowthChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartWidth, setChartWidth] = useState(Dimensions.get('window').width - 32);
  const drawerNavigation = useNavigation();

  const openDrawer = () => {
    drawerNavigation.dispatch(DrawerActions.openDrawer());
  };

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setChartWidth(window.width - 32);
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    loadData();
  }, [childId, measurementType]);

  useEffect(() => {
    if (child) {
      loadChartData();
    }
  }, [child, chartStandard, measurementType]);

  const loadData = async () => {
    try {
      const childData = await SecureStorage.getChild(childId);
      const measurementsData = await SecureStorage.getMeasurementsByType(
        childId,
        measurementType
      );

      setChild(childData);
      setMeasurements(measurementsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load child data');
      Alert.alert('Error', 'Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  const loadChartData = async () => {
    if (!child) return;

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
    } catch (error) {
      console.error('Error loading chart data:', error);
      setError('Failed to load growth chart data. Using offline data.');

      // Fallback to local data
      const fallbackData =
        chartStandard === 'CDC'
          ? getCDCChartData(measurementType, child.sex)
          : getWHOChartData(measurementType, child.sex);

      setChartData(fallbackData);
    } finally {
      setLoadingChart(false);
    }
  };

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

  // Prepare chart data for react-native-chart-kit (like CDC growth charts)
  const prepareChartData = () => {
    if (chartData.length === 0) {
      return null;
    }

    // Determine age range - focus on relevant window
    let minAge = 0;
    let maxAge = 36; // Default to first 3 years

    if (measurements.length > 0) {
      const childAges = measurements.map(m =>
        calculateAgeInMonths(child.birthDate, m.date)
      );
      const childMinAge = Math.min(...childAges);
      const childMaxAge = Math.max(...childAges);

      // Show window around child's data (±6 months buffer)
      minAge = Math.max(0, Math.floor(childMinAge - 6));
      maxAge = Math.ceil(childMaxAge + 6);
    }

    // Generate x-axis points (every 2 months for reasonable density)
    const agePoints = [];
    for (let age = minAge; age <= maxAge; age += 2) {
      agePoints.push(age);
    }

    // Prepare datasets - show key percentiles like CDC charts
    const datasets = [];
    const percentilesToShow = [5, 25, 50, 75, 95];

    percentilesToShow.forEach((percentile, index) => {
      const curve = getPercentileCurve(percentile, chartData);

      // Sort curve by age to ensure proper interpolation
      const sortedCurve = [...curve].sort((a, b) => a.ageInMonths - b.ageInMonths);

      const data = agePoints.map(age => {
        // Find the two closest points for interpolation
        let lowerPoint = null;
        let upperPoint = null;

        for (let i = 0; i < sortedCurve.length; i++) {
          if (sortedCurve[i].ageInMonths <= age) {
            lowerPoint = sortedCurve[i];
          }
          if (sortedCurve[i].ageInMonths >= age && !upperPoint) {
            upperPoint = sortedCurve[i];
            break;
          }
        }

        // Interpolate between the two points
        if (lowerPoint && upperPoint) {
          if (lowerPoint.ageInMonths === upperPoint.ageInMonths) {
            return lowerPoint.value;
          }
          const ratio = (age - lowerPoint.ageInMonths) / (upperPoint.ageInMonths - lowerPoint.ageInMonths);
          return lowerPoint.value + ratio * (upperPoint.value - lowerPoint.value);
        } else if (lowerPoint) {
          // Extrapolate forward from last point (needed to extend curves to the right edge)
          return lowerPoint.value;
        } else if (upperPoint) {
          // Extrapolate backward from first point (needed to extend curves to the left edge)
          return upperPoint.value;
        }
        // If no data available at all, use 0 (shouldn't happen with proper CDC/WHO data)
        return 0;
      });

      datasets.push({
        data,
        color: (opacity = 1) =>
          `rgba(150, 150, 150, ${index === 2 ? 0.7 : 0.4})`, // 50th darker
        strokeWidth: index === 2 ? 2 : 1,
        withDots: false,
      });
    });

    // Store child measurements for decorator (we'll render dots manually)
    let childMeasurementsForDots: Array<{age: number, value: number, index: number}> = [];
    if (measurements.length > 0) {
      const childDataPoints = measurements.map(m => ({
        age: calculateAgeInMonths(child.birthDate, m.date),
        value: m.value,
      }));

      // Map child data to chart indices
      childMeasurementsForDots = childDataPoints.map(child => {
        const index = agePoints.findIndex(age => Math.abs(age - child.age) < 1);
        return {
          age: child.age,
          value: child.value,
          index: index >= 0 ? index : -1,
        };
      }).filter(m => m.index >= 0);
    }

    // Create labels - show every other point for readability
    const labels = agePoints.map((age, i) => {
      return i % 2 === 0 ? `${Math.round(age)}` : '';
    });

    return {
      labels,
      datasets,
      childMeasurements: childMeasurementsForDots,
    };
  };

  const chartKitData = prepareChartData();

  // Calculate latest percentile
  let latestPercentileData = null;
  if (measurements.length > 0 && chartData.length > 0) {
    const latestMeasurement = measurements[measurements.length - 1];
    const ageInMonths = calculateAgeInMonths(
      child.birthDate,
      latestMeasurement.date
    );
    latestPercentileData = calculatePercentile(
      latestMeasurement.value,
      ageInMonths,
      chartData
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
              await SecureStorage.deleteMeasurement(measurementId);
              await loadData();
            } catch (error) {
              console.error('Error deleting measurement:', error);
              Alert.alert('Error', 'Failed to delete measurement');
            }
          },
        },
      ]
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    measurementId: string
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>
              {child.name} - {getMeasurementLabel()}
            </Text>
          </View>
        </View>

        <View style={styles.standardToggle}>
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
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {loadingChart && (
        <View style={styles.chartLoadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.chartLoadingText}>Loading growth chart data...</Text>
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
          <Text style={styles.chartTitle}>Growth Chart</Text>

          {chartKitData ? (
            <>
              <View style={styles.chartWrapper}>
                <LineChart
                data={{
                  labels: chartKitData.labels,
                  datasets: chartKitData.datasets,
                }}
                width={chartWidth}
                height={400}
                yAxisSuffix="kg"
                yAxisInterval={1}
                fromZero={true}
                chartConfig={{
                  backgroundColor: 'rgba(255, 255, 255, 0)',
                  backgroundGradientFrom: 'rgba(255, 255, 255, 0)',
                  backgroundGradientTo: 'rgba(255, 255, 255, 0)',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(126, 87, 194, ${opacity * 0.8})`, // Purple labels
                  style: {
                    borderRadius: 0,
                  },
                  propsForDots: {
                    r: '0',
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: '', // solid grid lines
                    stroke: '#e0e0e0',
                    strokeWidth: 1,
                  },
                  propsForLabels: {
                    fontSize: 10,
                    fontWeight: '600',
                  },
                  propsForVerticalLabels: {
                    fontSize: 10,
                    fontWeight: '600',
                    fill: 'rgba(126, 87, 194, 0.9)',
                  },
                  propsForHorizontalLabels: {
                    fontSize: 10,
                    fontWeight: '600',
                    fill: 'rgba(126, 87, 194, 0.9)',
                  },
                }}
                style={{
                  marginVertical: 8,
                  borderRadius: 0,
                  paddingLeft: 0,
                  paddingBlockStart: 0,
                  paddingInlineStart: 0,
                  marginLeft: -10,
                }}
                withVerticalLines={true}
                withHorizontalLines={true}
                segments={4}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLabels={true}
                withHorizontalLabels={false}
                decorator={() => {
                  if (!chartKitData.childMeasurements || chartKitData.childMeasurements.length === 0) {
                    return null;
                  }

                  // Get data range for proper scaling (from 0)
                  const allValues = chartKitData.datasets.flatMap(d => d.data.filter(v => v > 0));
                  const maxValue = Math.max(...allValues);
                  const minValue = 0; // Always start from 0
                  const dataRange = maxValue - minValue;

                  // Chart dimensions (react-native-chart-kit constants)
                  const paddingLeft = 50;
                  const paddingRight = 16;
                  const paddingTop = 16;
                  const paddingBottom = 40;
                  const chartHeight = 400;
                  const usableWidth = chartWidth - paddingLeft - paddingRight;
                  const usableHeight = chartHeight - paddingTop - paddingBottom;

                  return chartKitData.childMeasurements.map((measurement, idx) => {
                    // Calculate x position
                    const xRatio = measurement.index / (chartKitData.labels.length - 1);
                    const x = paddingLeft + (xRatio * usableWidth);

                    // Calculate y position (inverted because chart y=0 is at top)
                    const yRatio = (measurement.value - minValue) / dataRange;
                    const y = paddingTop + usableHeight - (yRatio * usableHeight);

                    return (
                      <View
                        key={idx}
                        style={{
                          position: 'absolute',
                          left: x - 6,
                          top: y - 6,
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: Colors.primary,
                          borderWidth: 2,
                          borderColor: '#fff',
                        }}
                      />
                    );
                  });
                }}
              />
              </View>
              <View style={styles.legend}>
                <Text style={styles.legendTitle}>Percentile Curves</Text>
                <View style={styles.legendItems}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendLine, { backgroundColor: '#aaa' }]} />
                    <Text style={styles.legendText}>5th, 25th, 75th, 95th</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendLine, { backgroundColor: '#666', height: 2 }]} />
                    <Text style={styles.legendText}>50th (median)</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={styles.legendCircle} />
                    <Text style={styles.legendText}>Child's measurements</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 20,
    paddingTop: 60,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  menuButton: {
    marginRight: 12,
    padding: 4,
  },
  menuIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  standardToggle: {
    flexDirection: 'row',
    gap: 12,
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
    color: Colors.primary,
  },
  statsCard: {
    backgroundColor: '#fff',
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
    color: '#666',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statsPercentile: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  statsInterpretation: {
    fontSize: 14,
    color: '#666',
  },
  chartContainer: {
    backgroundColor: '#fff',
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
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingLeft: 16,
  },
  chartWrapper: {
    position: 'relative',
  },
  xAxisLabel: {
    position: 'absolute',
    bottom: 50,
    right: 30,
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emptyChart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptyChartSubtext: {
    fontSize: 14,
    color: '#999',
  },
  legend: {
    marginTop: 16,
    paddingTop: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
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
  legendCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  measurementsList: {
    backgroundColor: '#fff',
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
    color: '#333',
    marginBottom: 12,
  },
  measurementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  measurementDate: {
    fontSize: 14,
    color: '#666',
  },
  measurementValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  deleteButtonContainer: {
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 0,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
    backgroundColor: '#fff',
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
    color: '#666',
  },
});

export default GrowthChartScreen;
