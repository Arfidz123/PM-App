import React from 'react';
import Svg, { Line, Path } from 'react-native-svg';

export interface CustomPowerIconProps {
  color?: string;
  size?: number;
  strokeWidth?: number;
}

/**
 * ACPDB Icon - Symbol for AC (Alternating Current):
 * Solid bar on top, Sine wave (~) on bottom
 */
export const AcpdbIcon: React.FC<CustomPowerIconProps> = ({
  color = '#FFFFFF',
  size = 28,
  strokeWidth = 2,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Top solid horizontal bar */}
      <Line
        x1="3.5"
        y1="7.5"
        x2="20.5"
        y2="7.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Bottom sine wave (AC ~) */}
      <Path
        d="M 3.5 16.5 C 6 12.5, 9 12.5, 12 16.5 C 15 20.5, 18 20.5, 20.5 16.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
};

/**
 * DCPDB Icon - Symbol for DC (Direct Current):
 * Solid bar on top, 3 dashed segments on bottom
 */
export const DcpdbIcon: React.FC<CustomPowerIconProps> = ({
  color = '#FFFFFF',
  size = 28,
  strokeWidth = 2,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Top solid horizontal bar */}
      <Line
        x1="3.5"
        y1="7.5"
        x2="20.5"
        y2="7.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Bottom 3 dashed lines (DC: dash - dash - dash) */}
      <Line
        x1="3.8"
        y1="16.5"
        x2="7.4"
        y2="16.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="10.2"
        y1="16.5"
        x2="13.8"
        y2="16.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="16.6"
        y1="16.5"
        x2="20.2"
        y2="16.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
};
