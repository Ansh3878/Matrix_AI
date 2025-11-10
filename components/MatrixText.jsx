import React from 'react';

const MatrixText = () => {
  return (
    <div className="relative w-full h-32 md:h-40 lg:h-48 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 flex items-end justify-center">
        <h1 
          className="text-[8rem] sm:text-[10rem] md:text-[12rem] lg:text-[16rem] xl:text-[20rem] font-black text-gray-700/20 dark:text-gray-300/12 select-none"
          style={{
            lineHeight: '0.2',
            letterSpacing: '-0.05em',
            transform: 'translateY(30%)',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: '600'
          }}
        >
          MATRIX
        </h1>
      </div>
    </div>
  );
};

export default MatrixText;
