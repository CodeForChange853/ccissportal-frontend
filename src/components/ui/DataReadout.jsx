// frontend/src/components/ui/DataReadout.jsx

import React from 'react';

/**
 * Terminal-font metric readout.
 *
 * @param {string}         label
 * @param {string|number}  value
 * @param {string}         unit
 * @param {string}         sub
 * @param {'default'|'sm'|'lg'} size
 * @param {string}         color
 * @param {string}         className
 * @param {string}         aria-label  – override the accessible label (default: "{label}: {value}{unit}")
 */
const DataReadout = ({
    label,
    value,
    unit,
    sub,
    size = 'default',
    color,
    className = '',
    'aria-label': ariaLabel,
}) => {
    const sizeClass = size !== 'default' ? `data-readout__value--${size}` : '';
    const computedAriaLabel = ariaLabel ?? (label ? `${label}: ${value ?? '—'}${unit ?? ''}` : undefined);

    return (
        <div
            className={`data-readout ${className}`.trim()}
            aria-label={computedAriaLabel}
        >
            {label && <span className="data-readout__label" aria-hidden="true">{label}</span>}
            <span
                className={`data-readout__value ${sizeClass}`.trim()}
                style={color ? { color } : undefined}
                aria-hidden="true"
            >
                {value ?? '—'}
                {unit && <span className="data-readout__unit">{unit}</span>}
            </span>
            {sub && <span className="data-readout__sub" aria-hidden="true">{sub}</span>}
        </div>
    );
};

export default DataReadout;