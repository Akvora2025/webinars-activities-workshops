import { useState, useEffect } from 'react';
import axios from 'axios';
import './Videos.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Videos() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/videos`);
            setVideos(response.data.videos);
            setError('');
        } catch (err) {
            console.error('Error fetching videos:', err);
            setError('Failed to load videos. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Extract video ID and create embed URL with strict parameters
    const getEmbedUrlWithParams = (embedUrl) => {
        // Remove any existing query parameters
        const baseUrl = embedUrl.split('?')[0];

        // Add strict parameters to prevent external navigation and recommendations
        const params = new URLSearchParams({
            rel: '0',              // No related videos
            modestbranding: '1',   // Minimal YouTube branding
            controls: '1',         // Show playback controls
            disablekb: '0',        // Enable keyboard controls
            fs: '1',               // Allow fullscreen
            iv_load_policy: '3',   // Hide video annotations
            autoplay: '0',         // Don't autoplay
            enablejsapi: '0'       // Disable JS API
        });

        return `${baseUrl}?${params.toString()}`;
    };

    if (loading) {
        return (
            <div className="videos-container">
                <div className="videos-loading">
                    <div className="spinner"></div>
                    <p>Loading videos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="videos-container">
                <div className="videos-error">
                    <p>{error}</p>
                    <button onClick={fetchVideos} className="retry-btn">Retry</button>
                </div>
            </div>
        );
    }

    if (videos.length === 0) {
        return (
            <div className="videos-container">
                <div className="videos-empty">
                    <h2>No Videos Available</h2>
                    <p>Check back later for new content!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="videos-container">
            <div className="videos-header">
                <h1>Video Library</h1>
                <p>Watch our collection of educational videos</p>
            </div>

            <div className="videos-grid">
                {videos.map((video) => (
                    <div key={video._id} className="video-card">
                        <div className="video-wrapper">
                            <iframe
                                src={getEmbedUrlWithParams(video.embedUrl)}
                                title={video.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="video-iframe"
                            ></iframe>
                        </div>
                        <div className="video-info">
                            <h3 className="video-title">{video.title}</h3>
                            <p className="video-date">
                                Added on {new Date(video.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Videos;
