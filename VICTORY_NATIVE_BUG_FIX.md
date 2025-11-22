# Victory-Native Touch Detection Bug Fix

## Summary

Fixed a critical bug in Victory-native's CartesianChart touch detection where tap coordinates were incorrectly calculated, causing taps to register at wrong x/y positions on the chart.

## The Bug

The `CartesianChart` component's pan gesture handlers were using `touch.absoluteX` and `touch.absoluteY` (screen-absolute coordinates) instead of `touch.x` and `touch.y` (view-relative coordinates). Additionally, the chart's padding offset was not being subtracted from the touch coordinates.

This caused two issues:
1. **Screen position offset**: When the chart was inside containers with margins/padding, touch coordinates were offset by the parent container's position
2. **Chart padding offset**: The chart's own internal padding was not accounted for

## Example of the Bug

When a user tapped at the left edge of a chart (x=0 in chart coordinates):
- Expected: touch x ≈ 0
- Actual: touch x ≈ 16-20 pixels (offset by parent container position + chart padding)

This resulted in tooltips, crosshairs, and other tap-based features appearing at incorrect positions.

## The Fix

Changed three locations in `src/cartesian/CartesianChart.tsx` where `handleTouch` is called:

### Before:
```typescript
handleTouch(
  v,
  touch.absoluteX - scrolledX,
  touch.absoluteY - scrolledY,
);
```

### After:
```typescript
handleTouch(
  v,
  touch.x - scrolledX - valueFromSidedNumber(padding, "left"),
  touch.y - scrolledY - valueFromSidedNumber(padding, "top"),
);
```

### Changes:
1. Changed from `touch.absoluteX/absoluteY` to `touch.x/touch.y` (view-relative coordinates)
2. Subtracted chart's left and top padding to account for the chart's internal coordinate system

## Testing

Tested with a growth chart displaying CDC percentile curves and child measurements:
- Chart with 53 data points (49 percentile + 4 child measurements)
- Chart padding: `{ left: 20, right: 20, top: 20, bottom: 20 }`
- Located inside View containers with margins

### Before Fix:
- Tapping at left edge returned x=16.3 months (should be x=0.5)
- ~10-15 month offset across entire chart

### After Fix:
- Tapping at left edge correctly returns x=0.5 months
- Tap detection accurate across entire chart range (0-240 months)

## Files Modified

- `src/cartesian/CartesianChart.tsx` (lines 454-455, 481-482, 514-515)

## Affected Gesture Handlers

1. `.onTouchesDown()` - Initial tap detection
2. `.onStart()` - Gesture start after bootstrap
3. `.onTouchesMove()` - Drag/move detection

## Breaking Changes

None. This is a bug fix that makes touch detection work correctly as intended.

## Victory-native Version

Tested and fixed in: `victory-native@41.20.2`

## Related Issues

This fix resolves touch detection issues when:
- Charts are nested in containers with margins/padding
- Charts have non-zero padding props
- Using chartPressState for tooltips, crosshairs, or interactive features
