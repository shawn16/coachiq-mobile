import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ApexLogoProps {
  size?: number;
}

export default function ApexLogo({ size = 80 }: ApexLogoProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
    >
      {/* Main upward chevron — white */}
      <Path
        d="M16 88L60 24L104 88L82 88L60 50L38 88Z"
        fill="white"
      />
      {/* Green accent triangle beneath */}
      <Path
        d="M48 96L60 72L72 96Z"
        fill="#34C759"
      />
    </Svg>
  );
}
