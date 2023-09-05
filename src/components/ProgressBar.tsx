import React, { ReactNode } from 'react';

interface ProgressBarProps {
  size?: number;
  progress?: number;
  trackWidth?: number;
  trackColor?: string;
  indicatorWidth?: number;
  indicatorColor?: string;
  indicatorCap?: 'round' | 'inherit' | 'butt' | 'square' | undefined;
  label?: ReactNode | string;
  labelColor?: string;
  spinnerMode?: boolean;
  spinnerSpeed?: number;
}

export default function ProgressBar(props: ProgressBarProps) {
  const {
    size = 150,
    progress = 0,
    trackWidth = 10,
    trackColor = `#ddd`,
    indicatorWidth = 10,
    indicatorColor = `#07c`,
    indicatorCap = `round`,
    label = `Loading...`,
    labelColor = `#eee`,
    spinnerMode = false,
    spinnerSpeed = 1,
  } = props;

  const center = size / 2;
  const radius =
    center - (trackWidth > indicatorWidth ? trackWidth : indicatorWidth);
  const dashArray = 2 * Math.PI * radius;
  const dashOffset = dashArray * ((100 - progress) / 100);

  const hideLabel =
    size < 100 ||
    (typeof label === 'string' ? !label.length : false) ||
    spinnerMode;

  return (
    <div className="svg-pi-wrapper" style={{ width: size, height: size }}>
      <svg className="svg-pi" style={{ width: size, height: size }}>
        <circle
          className="svg-pi-track"
          cx={center}
          cy={center}
          fill="transparent"
          r={radius}
          stroke={trackColor}
          strokeWidth={trackWidth}
        />
        <circle
          className={`svg-pi-indicator ${
            spinnerMode ? 'svg-pi-indicator--spinner' : ''
          }`}
          style={{ animationDuration: `${spinnerSpeed}s` }}
          cx={center}
          cy={center}
          fill="transparent"
          r={radius}
          stroke={indicatorColor}
          strokeWidth={indicatorWidth}
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          strokeLinecap={indicatorCap}
        />
      </svg>

      {!hideLabel && (
        <div className="svg-pi-label" style={{ color: labelColor }}>
          <span className="svg-pi-label__loading">{label}</span>

          {!spinnerMode && (
            <span className="svg-pi-label__progress">
              {`${progress > 100 ? 100 : progress}%`}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
