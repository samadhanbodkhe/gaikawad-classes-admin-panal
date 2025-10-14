import React from "react";

const MyYouTubePlayer = () => {
    const videoId = "-obyfy9VZWc";
    const embedUrl = `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&controls=1&showinfo=0`;

    return (
        <div style={{ position: 'relative', width: '640px', height: '360px' }}>
            <iframe
                title="YouTube Video"
                width="640"
                height="360"
                src={embedUrl}
                frameBorder="0"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
            />
            {/* Only YouTube Branding and Controls Block Karne ke liye */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "50px", // Sirf bottom ke branding & controls pe lagega
                    background: "transparent",
                    zIndex: 1,
                }}
            />
        </div>
    );
};

export default MyYouTubePlayer;
