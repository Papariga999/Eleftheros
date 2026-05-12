import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
}

const defaults: Required<Pick<IconProps, 'size' | 'stroke' | 'fill' | 'strokeWidth'>> = {
  size: 22,
  stroke: 'currentColor',
  fill: 'none',
  strokeWidth: 1.7,
};

function icon(paths: (props: Required<typeof defaults>) => React.ReactNode) {
  return function Icon({ size = 22, stroke = 'currentColor', fill = 'none', strokeWidth = 1.7 }: IconProps) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        {paths({ size, stroke, fill, strokeWidth })}
      </Svg>
    );
  };
}

export const HomeIcon = icon(({ stroke, strokeWidth }) => (
  <>
    <Path d="M3 11.5 12 4l9 7.5" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Path d="M5 10v9.5h14V10" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Path d="M10 19.5V14h4v5.5" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </>
));

export const InvoiceIcon = icon(({ stroke, strokeWidth }) => (
  <>
    <Path d="M6 3h9l3 3v15a0 0 0 0 1 0 0H6Z" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Path d="M15 3v3h3" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Path d="M9 11h6M9 14h6M9 17h4" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </>
));

export const TaxIcon = icon(({ stroke, strokeWidth }) => (
  <>
    <Path d="M4 19V8l8-5 8 5v11" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Path d="M9 19v-6h6v6" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Path d="M4 19h16" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </>
));

export const ExpenseIcon = icon(({ stroke, strokeWidth }) => (
  <>
    <Path d="M4 7h16v12H4z" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Path d="M4 11h16" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Path d="M8 15h3" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </>
));

export const PlusIcon = icon(({ stroke }) => (
  <>
    <Path d="M12 5v14M5 12h14" stroke={stroke} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </>
));

export const BackIcon = icon(({ stroke }) => (
  <Path d="M15 5l-7 7 7 7" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
));

export const SearchIcon = icon(({ stroke, strokeWidth }) => (
  <>
    <Circle cx={11} cy={11} r={7} stroke={stroke} strokeWidth={strokeWidth} fill="none" />
    <Path d="m20 20-3.5-3.5" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
  </>
));

export const CheckIcon = icon(({ stroke }) => (
  <Path d="M5 12.5 10 17l9-10" stroke={stroke} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
));

export const ChevronRightIcon = icon(({ stroke }) => (
  <Path d="m9 5 7 7-7 7" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
));

export const ChevronDownIcon = icon(({ stroke }) => (
  <Path d="m5 9 7 7 7-7" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
));

export const CalendarIcon = icon(({ stroke, strokeWidth }) => (
  <>
    <Rect x={3.5} y={5} width={17} height={15} rx={2.5} stroke={stroke} strokeWidth={strokeWidth} fill="none" />
    <Path d="M3.5 9.5h17M8 3v4M16 3v4" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
  </>
));

export const CameraIcon = icon(({ stroke, strokeWidth }) => (
  <>
    <Path d="M4 8.5h3l1.5-2.5h7L17 8.5h3v11H4Z" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Circle cx={12} cy={14} r={3.5} stroke={stroke} strokeWidth={strokeWidth} fill="none" />
  </>
));

export const BoltIcon = icon(({ stroke, fill, strokeWidth }) => (
  <Path d="M13 3 5 14h6l-1 7 8-11h-6Z" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill={fill} />
));

export const RefreshIcon = icon(({ stroke, strokeWidth }) => (
  <>
    <Path d="M4 12a8 8 0 0 1 14-5" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
    <Path d="M18 3v4h-4" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Path d="M20 12a8 8 0 0 1-14 5" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
    <Path d="M6 21v-4h4" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </>
));

export const LockIcon = icon(({ stroke, strokeWidth }) => (
  <>
    <Rect x={5} y={11} width={14} height={10} rx={2} stroke={stroke} strokeWidth={strokeWidth} fill="none" />
    <Path d="M8 11V8a4 4 0 0 1 8 0v3" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
  </>
));

export const AlertIcon = icon(({ stroke, strokeWidth }) => (
  <>
    <Path d="M12 4 2.5 20h19Z" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Path d="M12 10v4M12 18v.01" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
  </>
));

export const PencilIcon = icon(({ stroke, strokeWidth }) => (
  <Path d="m4 20 4-1 11-11-3-3L5 16Z" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
));

export const SunIcon = icon(({ stroke, strokeWidth }) => (
  <>
    <Circle cx={12} cy={12} r={4} stroke={stroke} strokeWidth={strokeWidth} fill="none" />
    <Path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
  </>
));

export const PersonIcon = icon(({ stroke, strokeWidth }) => (
  <>
    <Circle cx={12} cy={8} r={4} stroke={stroke} strokeWidth={strokeWidth} fill="none" />
    <Path d="M4 21c1-4 4.5-6 8-6s7 2 8 6" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
  </>
));

export const ShieldIcon = icon(({ stroke, strokeWidth }) => (
  <>
    <Path d="M12 3 5 5.5v6c0 4.5 3 8 7 9.5 4-1.5 7-5 7-9.5v-6L12 3Z" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Path d="m9 12 2 2 4-4" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </>
));

export const EyeIcon = icon(({ stroke, strokeWidth }) => (
  <>
    <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
    <Circle cx={12} cy={12} r={3} stroke={stroke} strokeWidth={strokeWidth} fill="none" />
  </>
));

export const CloseIcon = icon(({ stroke }) => (
  <>
    <Path d="M6 6l12 12M18 6 6 18" stroke={stroke} strokeWidth={2.2} strokeLinecap="round" fill="none" />
  </>
));

export const SoftwareIcon = icon(({ stroke }) => (
  <>
    <Rect x={3} y={5} width={18} height={12} rx={2} stroke={stroke} strokeWidth={1.6} fill="none" />
    <Path d="M2 21h20M9 17v4M15 17v4" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" fill="none" />
  </>
));

export const EquipIcon = icon(({ stroke }) => (
  <>
    <Path d="M4 7h16v11H4z" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    <Path d="M9 11h6v3H9z" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" fill="none" />
  </>
));

export const TransitIcon = icon(({ stroke }) => (
  <>
    <Path d="M6 16V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    <Path d="M6 16h12v3H6z" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    <Circle cx={9} cy={13} r={0.8} fill={stroke} />
    <Circle cx={15} cy={13} r={0.8} fill={stroke} />
  </>
));

export const OfficeIcon = icon(({ stroke }) => (
  <>
    <Path d="M5 21V7l7-3 7 3v14" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    <Path d="M9 11h2M13 11h2M9 15h2M13 15h2" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" fill="none" />
  </>
));

export const OtherIcon = icon(({ stroke }) => (
  <>
    <Circle cx={12} cy={12} r={8} stroke={stroke} strokeWidth={1.6} fill="none" />
    <Path d="M9.5 10a2.5 2.5 0 1 1 3.7 2.2c-.7.4-1.2 1-1.2 1.8M12 17.5v.01" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" fill="none" />
  </>
));

export function SprigIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 21V6" stroke="#0d5c3a" strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M12 10c-2-2-4-2-5-1 0 2 1 3.5 3 4 1.4.3 2 .3 2-1V10z" fill="#0d5c3a" />
      <Path d="M12 13c2-2 4-2 5-1 0 2-1 3.5-3 4-1.4.3-2 .3-2-1v-2z" fill="#0d5c3a" fillOpacity={0.85} />
      <Path d="M12 7c-1.6-1.4-3.4-1.4-4.2-.5 0 1.6 1 2.8 2.5 3.2 1 .2 1.7.1 1.7-.9V7z" fill="#0d5c3a" fillOpacity={0.7} />
    </Svg>
  );
}
