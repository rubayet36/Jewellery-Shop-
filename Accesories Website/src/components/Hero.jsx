import { useState } from 'react';

function Hero() {
  const [videoFinished, setVideoFinished] = useState(false);

  const handleVideoEnd = () => {
    setVideoFinished(true);
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-white">
      {!videoFinished ? (
        <video
          src="/hero.mp4"
          autoPlay
          muted
          preload="metadata"
          onEnded={handleVideoEnd}
          className="w-full h-full object-cover"
        />
      ) : (
        <img
          src="/hero.jpg"
          alt="Hero"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}

export default Hero;
