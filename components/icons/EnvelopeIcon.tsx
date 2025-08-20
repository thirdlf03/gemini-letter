
import React from 'react';

const EnvelopeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="5" width="20" height="14" rx="2" fill="#FFD700" stroke="#DAA520" />
    <path d="M2 7l10 7 10-7" stroke="#DAA520" />
  </svg>
);

export default EnvelopeIcon;
