import React from 'react';

const StatItem = ({ number, label }) => {
  return (
    <div>
      <p className="text-2xl font-bold">
        {number}
      </p>
      <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">
        {label}
      </p>
    </div>
  );
};

export default StatItem;