import React from 'react';
type ScribeLogoProps = {
  className?: string;
};
function ScribeLogo({ className }: ScribeLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="2636"
      height="2636"
      fill="none"
      viewBox="0 0 2636 2636"
      className={className}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M1318 2636c727.91 0 1318-590.09 1318-1318S2045.91 0 1318 0 0 590.089 0 1318s590.089 1318 1318 1318m-.67-91.81c676.84 0 1225.52-548.69 1225.52-1225.52 0-676.841-548.68-1225.525-1225.52-1225.525-676.832 0-1225.516 548.684-1225.516 1225.525 0 676.83 548.684 1225.52 1225.516 1225.52"
        clipRule="evenodd"
      ></path>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="100"
        d="M524 897v842M921 670.5v1295M1318 454v1728M1715 670.5v1295M2112 897v842"
      ></path>
    </svg>
  );
}

export default ScribeLogo;
