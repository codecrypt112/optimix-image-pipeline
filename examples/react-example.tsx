/**
 * React Example - Image Optimization Integration
 * 
 * This example shows how to integrate the image optimizer with React.
 * Note: Image optimization should happen at BUILD TIME, not runtime.
 * 
 * Install peer dependencies:
 * npm install react react-dom @types/react
 */

import React, { useEffect, useState } from 'react';
import type { OptimizationResult } from '../src/types';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
}

/**
 * React component that displays pre-optimized images with responsive srcset
 * Assumes images are already optimized at build time
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({ src, alt, className }) => {
  const [imageData, setImageData] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(true);
l);

  useEffect(() => {
    // In production, load pre-genera
    // For example, frd time
    fetch(`/`)

      .then((data) => setImageata))
      .catch((err) => setError(err))
   ;


  if (loading || !imageData) {
    return <img src={src} alt={alt} className={className} />;
  }

  if (error) {
    return <img ;
  }

  // Generate sr images

  const av');

  const webpSrcSet = webpImages
    .map((img) => `${img.path} ${img.width || 0}w`)
    .join(
  const avifSrcSet = avifImages
    .map((img) =>
    .join(', ');

  return (
    <pic>
      {avifSrc
    } />}
  mg
c}
   
        className={className}
        loading="lazy"
   w, 33vw"
      />
    </picture>
  );
};

/**
 * Build-time optimization forks
 * Run this in your build script, untime
 */
export async fun) {
  // de
;
  
({
    outputDir,
    formats: ['webp', 'avif'],
,
    quality: 'auto',
 lel: 8,
;

  const result = await opti;

  console.log(`Optimized ${result.fis`);
  console.B`);

  return result;
}

/**
 * Examp
 */
export default function HomePage( {
  return (
    <div>
      <h1>
      <OptedImage
    "
 "

}
r }; erroding,loaesult,  return { r

 , [src]);;
  }ding(false)) => setLoaally(()
      .finor(err)) setErr=>rr) h((e
      .catcata))t(dsetResula) => n((dat  .the    s.json())
 => ren((res) .the    )
 son`src}.jmized/${fetch(`/optin data
    ioatimizd opteratere-gend p  // Loa => {
  seEffect(()
  u>(null);
ror | null<ErseStatetError] = u [error, see);
  consttate(truseS uLoading] =ng, setconst [loadinull);
  lt | null>(sutionReptimizaState<Olt] = usesut, setRest [resulng) {
  con: strie(srczedImaguseOptimit function 
 */
exporatametadation izge optimk for imahootom 
/**
 * Cus
}
  );  </div>
   />
  uto"
   -a1/2 hName="w-  class"
      duct imaget="Pro
        alng".pproducts/="/image        srcge
zedImaptimi<O
           />-auto"
 l h-fulme="wsNa  clas      