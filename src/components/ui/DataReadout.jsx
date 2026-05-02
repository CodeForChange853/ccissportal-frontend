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
 */
const DataReadout = ({
    label,
    value,
    unit,
    sub,
    size = 'default',
    color,
    className = '',
}) => {
    const sizeClass = size !== 'default' ? `data-readout__value--${size}` : '';

    return (
        <div className={`data-readout ${className}`.trim()}>
            {label && <span className="data-readout__label">{label}</span>}
            <span
                className={`data-readout__value ${sizeClass}`.trim()}
                style={color ? { color } : undefined}
            >
                {value ?? '—'}
                {unit && <span className="data-readout__unit">{unit}</span>}
            </span>
            {sub && <span className="data-readout__sub">{sub}</span>}
        </div>
    );
};

export default DataReadout;