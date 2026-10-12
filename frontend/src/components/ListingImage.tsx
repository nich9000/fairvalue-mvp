import { useState } from 'react';
import { photoUrl } from '../lib/listingImages';

interface Props {
  photoId: string;
  alt: string;
  width: number | string;
  height: number;
  srcWidth?: number;
  style?: React.CSSProperties;
  eager?: boolean;
}

// Falls back to the grey placeholder block if the photo fails to load.
export default function ListingImage({ photoId, alt, width, height, srcWidth = 640, style, eager }: Props) {
  const [failed, setFailed] = useState(false);
  const box: React.CSSProperties = { width, height, flexShrink: 0, ...style };
  if (failed) return <div className="img-placeholder" style={box} />;
  return (
    <img
      className="img-placeholder listing-img"
      src={photoUrl(photoId, srcWidth)}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      style={{ ...box, objectFit: 'cover', display: 'block' }}
    />
  );
}
