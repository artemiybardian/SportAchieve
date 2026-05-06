import { FC, useState, useRef } from 'react';
import { PlayIcon } from './Icons';

interface VideoPreviewProps {
  videoUrl: string;
  posterUrl?: string;
}

export const VideoPreview: FC<VideoPreviewProps> = ({ videoUrl, posterUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    if (videoRef.current) {
      void videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (videoRef.current && !videoRef.current.seeking) {
      setIsPlaying(false);
    }
  };

  const handleSeeking = () => {
    setIsSeeking(true);
  };

  const handleSeeked = () => {
    setIsSeeking(false);
  };

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '212px',
        position: 'relative',
        overflow: 'hidden',
        margin: "0 8px",
        borderRadius: '12px',
      }}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        controls={isPlaying}
        onPlay={() => setIsPlaying(true)}
        onPause={handlePause}
        onSeeking={handleSeeking}
        onSeeked={handleSeeked}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      >
        Your browser does not support the video tag.
      </video>
      {!isPlaying && !isSeeking && (
        <div
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: `url(${posterUrl}) center/cover no-repeat`,
          }}
        >
          <button
            onClick={handlePlay}
            style={{
              background: '#68C6E0',
              height: '64px',
              width: '64px',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <PlayIcon color="white" />
          </button>
        </div>
      )}
    </section>
  );
};
