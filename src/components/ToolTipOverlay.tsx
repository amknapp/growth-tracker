import React from 'react';
import { StyleSheet, TextInput } from 'react-native';
import Reanimated, {
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
} from 'react-native-reanimated';

Reanimated.addWhitelistedNativeProps({ text: true });

const AnimatedTextInput = Reanimated.createAnimatedComponent(TextInput);

type YValues = {
  p5?: { value: SharedValue<number>; position: SharedValue<number> };
  p25?: { value: SharedValue<number>; position: SharedValue<number> };
  p50?: { value: SharedValue<number>; position: SharedValue<number> };
  p75?: { value: SharedValue<number>; position: SharedValue<number> };
  p95?: { value: SharedValue<number>; position: SharedValue<number> };
  child?: { value: SharedValue<number>; position: SharedValue<number> };
};

type ChildMeasurement = {
  age: number;
  value: number;
};

export function ToolTipOverlay({
  x,
  y,
  isActive,
  childMeasurements,
  proximityThreshold = 2.0,
}: {
  x: {
    value: SharedValue<number>;
    position: SharedValue<number>;
  };
  y: YValues;
  isActive: SharedValue<boolean>;
  childMeasurements: ChildMeasurement[];
  proximityThreshold?: number; // in months
}) {
  const style = useAnimatedStyle(() => {
    // Find the first valid y value to position the tooltip
    let validY: {
      value: SharedValue<number>;
      position: SharedValue<number>;
    } | null = null;

    // Priority: child > p50 > p75 > p25 > p95 > p5
    const priorityOrder: Array<keyof YValues> = [
      'child',
      'p50',
      'p75',
      'p25',
      'p95',
      'p5',
    ];

    for (const key of priorityOrder) {
      const yData = y[key];
      if (yData && !isNaN(yData.value.value) && !isNaN(yData.position.value)) {
        validY = yData;
        break;
      }
    }

    // Check if we have nearby child measurements (for visibility)
    const tappedAge = x.value.value;
    let hasNearbyMeasurement = false;
    if (childMeasurements.length > 0) {
      const measurementsWithDistance = childMeasurements.map(m => ({
        ...m,
        distance: Math.abs(m.age - tappedAge),
      }));
      const minDistance = Math.min(
        ...measurementsWithDistance.map(m => m.distance),
      );
      hasNearbyMeasurement = minDistance <= proximityThreshold;
    }

    // Show tooltip if we have valid chart data OR nearby measurements
    const isVisible =
      isActive.value && (validY !== null || hasNearbyMeasurement);
    return {
      opacity: isVisible ? 1 : 0,
      transform: [
        { translateX: x.position.value - 75 }, // Center horizontally (width 150/2)
        { translateY: (validY?.position.value ?? x.position.value) - 50 }, // Position above point
      ],
    };
  });

  const animatedProps = useAnimatedProps(() => {
    if (!isActive.value) {
      return { text: '' };
    }

    const tappedAge = x.value.value;

    // FIRST: Check if the tapped point itself has child data
    if (y.child && !isNaN(y.child.value.value)) {
      const childValue = y.child.value.value;
      return {
        text: `Child: ${childValue.toFixed(1)} @ ${tappedAge.toFixed(1)}mo`,
      };
    }

    // SECOND: Find the CLOSEST child measurement(s) to the tapped age
    if (childMeasurements.length > 0) {
      // Calculate distances for all measurements
      const measurementsWithDistance = childMeasurements.map(m => ({
        ...m,
        distance: Math.abs(m.age - tappedAge),
      }));

      // Find minimum distance
      const minDistance = Math.min(
        ...measurementsWithDistance.map(m => m.distance),
      );

      // Only show if within proximity threshold
      if (minDistance <= proximityThreshold) {
        // Get all measurements at the minimum distance (handles clusters at same age)
        const closestMeasurements = measurementsWithDistance.filter(
          m => m.distance === minDistance,
        );

        if (closestMeasurements.length === 1) {
          const m = closestMeasurements[0];
          return {
            text: `Child: ${m.value.toFixed(1)} @ ${m.age.toFixed(1)}mo`,
          };
        } else {
          // Multiple measurements at same closest distance
          const measurementTexts = closestMeasurements
            .map(m => `${m.value.toFixed(1)}@${m.age.toFixed(1)}mo`)
            .join(', ');
          return {
            text: `Children: ${measurementTexts}`,
          };
        }
      }
    }

    // THIRD: No nearby child measurements, show percentile data if available
    let displayText = '';

    if (y.p50 && !isNaN(y.p50.value.value)) {
      displayText = `50th: ${y.p50.value.value.toFixed(
        1,
      )} @ ${tappedAge.toFixed(1)}mo`;
    } else if (y.p75 && !isNaN(y.p75.value.value)) {
      displayText = `75th: ${y.p75.value.value.toFixed(
        1,
      )} @ ${tappedAge.toFixed(1)}mo`;
    } else if (y.p25 && !isNaN(y.p25.value.value)) {
      displayText = `25th: ${y.p25.value.value.toFixed(
        1,
      )} @ ${tappedAge.toFixed(1)}mo`;
    } else if (y.p95 && !isNaN(y.p95.value.value)) {
      displayText = `95th: ${y.p95.value.value.toFixed(
        1,
      )} @ ${tappedAge.toFixed(1)}mo`;
    } else if (y.p5 && !isNaN(y.p5.value.value)) {
      displayText = `5th: ${y.p5.value.value.toFixed(1)} @ ${tappedAge.toFixed(
        1,
      )}mo`;
    }

    return { text: displayText };
  });

  return (
    <Reanimated.View style={[styles.container, style]}>
      <AnimatedTextInput
        underlineColorAndroid="transparent"
        editable={false}
        value="Value"
        style={styles.valueText}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        animatedProps={animatedProps as any}
      />
    </Reanimated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    width: 150,
    alignItems: 'center',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  valueText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
});
