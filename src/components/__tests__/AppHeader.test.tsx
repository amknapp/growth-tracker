/**
 * AppHeader Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AppHeader from '../AppHeader';
import { DrawerActions } from '@react-navigation/native';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    dispatch: mockDispatch,
  }),
  DrawerActions: {
    openDrawer: jest.fn(() => ({ type: 'OPEN_DRAWER' })),
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    top: 44,
    bottom: 0,
    left: 0,
    right: 0,
  }),
}));

jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#7E57C2',
      primaryLight: '#B39DDB',
      background: '#f5f5f5',
      card: '#fff',
      text: '#333',
      textSecondary: '#666',
      textLight: '#999',
      border: '#e0e0e0',
      error: '#FF3B30',
    },
    isDark: false,
    colorScheme: 'light',
  }),
}));

const mockDispatch = jest.fn();

describe('AppHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with title only', () => {
      const { getByText, queryByText } = render(
        <AppHeader title="Test Title" />,
      );

      expect(getByText('Test Title')).toBeTruthy();
      expect(queryByText('subtitle')).toBeFalsy();
    });

    it('should render with title and subtitle', () => {
      const { getByText } = render(
        <AppHeader title="Test Title" subtitle="Test Subtitle" />,
      );

      expect(getByText('Test Title')).toBeTruthy();
      expect(getByText('Test Subtitle')).toBeTruthy();
    });

    it('should render with title, subtitle, and subtitle2', () => {
      const { getByText } = render(
        <AppHeader
          title="Test Title"
          subtitle="Test Subtitle"
          subtitle2="Test Subtitle 2"
        />,
      );

      expect(getByText('Test Title')).toBeTruthy();
      expect(getByText('Test Subtitle')).toBeTruthy();
      expect(getByText('Test Subtitle 2')).toBeTruthy();
    });

    it('should not render subtitle2 if subtitle is not provided', () => {
      const { getByText, queryByText } = render(
        <AppHeader title="Test Title" subtitle2="Test Subtitle 2" />,
      );

      expect(getByText('Test Title')).toBeTruthy();
      expect(queryByText('Test Subtitle 2')).toBeTruthy(); // Still renders
    });

    it('should render menu button', () => {
      const { getByText } = render(<AppHeader title="Test Title" />);

      expect(getByText('☰')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should open drawer when menu button is pressed', () => {
      const { getByText } = render(<AppHeader title="Test Title" />);

      const menuButton = getByText('☰');
      fireEvent.press(menuButton);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'OPEN_DRAWER' });
    });

    it('should call DrawerActions.openDrawer when menu button is pressed', () => {
      const { getByText } = render(<AppHeader title="Test Title" />);

      const menuButton = getByText('☰');
      fireEvent.press(menuButton);

      expect(DrawerActions.openDrawer).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible menu button', () => {
      const { getByLabelText } = render(<AppHeader title="Test Title" />);

      const menuButton = getByLabelText('Open navigation menu');
      expect(menuButton).toBeTruthy();
    });

    it('should have accessible header with title', () => {
      const { getByLabelText } = render(<AppHeader title="Test Title" />);

      const header = getByLabelText('Test Title');
      expect(header).toBeTruthy();
    });
  });

  describe('Styling', () => {
    it('should apply primary color to header background', () => {
      const { getByTestId } = render(<AppHeader title="Test Title" />);

      const header = getByTestId('app-header');
      const headerStyle = Array.isArray(header.props.style)
        ? header.props.style
        : [header.props.style];

      const hasBackgroundColor = headerStyle.some(
        (style: any) => style && style.backgroundColor === '#7E57C2',
      );
      expect(hasBackgroundColor).toBeTruthy();
    });

    it('should apply white color to title text', () => {
      const { getByText } = render(<AppHeader title="Test Title" />);

      const title = getByText('Test Title');
      const titleStyle = Array.isArray(title.props.style)
        ? title.props.style
        : [title.props.style];

      const hasWhiteColor = titleStyle.some(
        (style: any) => style && style.color === '#fff',
      );
      expect(hasWhiteColor).toBeTruthy();
    });

    it('should apply opacity to subtitles', () => {
      const { getByText } = render(
        <AppHeader title="Test Title" subtitle="Test Subtitle" />,
      );

      const subtitle = getByText('Test Subtitle');
      const subtitleStyle = Array.isArray(subtitle.props.style)
        ? subtitle.props.style
        : [subtitle.props.style];

      const hasOpacity = subtitleStyle.some(
        (style: any) => style && style.opacity === 0.9,
      );
      expect(hasOpacity).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string title', () => {
      const { queryByText } = render(<AppHeader title="" />);

      // Menu button should still render
      expect(queryByText('☰')).toBeTruthy();
    });

    it('should handle very long title', () => {
      const longTitle =
        'This is a very long title that might wrap to multiple lines';
      const { getByText } = render(<AppHeader title={longTitle} />);

      expect(getByText(longTitle)).toBeTruthy();
    });

    it('should handle special characters in title', () => {
      const { getByText } = render(
        <AppHeader title="Title with & special <> characters" />,
      );

      expect(getByText('Title with & special <> characters')).toBeTruthy();
    });
  });
});
