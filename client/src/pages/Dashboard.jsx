import { useState, useEffect } from 'react';
import DashboardCarousel from '../components/DashboardCarousel';
import './Dashboard.css';
import api from '../services/api';


const Dashboard = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardPosts = async () => {
            try {
                const response = await api.get('/dashboard-posts');
                setPosts(response.data);
            } catch (err) {
                console.error('Error fetching dashboard posts:', err);
                setError('Failed to load dashboard content');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardPosts();
    }, []);


    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loader"></div>
                <p>Enhancing your experience...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-hero">
                <DashboardCarousel items={posts} />
            </div>

            <div className="dashboard-welcome">
                <h2>Explore upcoming opportunities</h2>
                <p>Stay ahead with our latest webinars, workshops, and internships.</p>
            </div>

            <div className="dashboard-grid">
                {/* You can add more dashboard widgets here if needed */}
                <div className="dashboard-card-mini">
                    <h3>Webinars</h3>
                    <p>Join live sessions with experts.</p>
                    <a href="/webinars">View All</a>
                </div>
                <div className="dashboard-card-mini">
                    <h3>Workshops</h3>
                    <p>Hands-on learning experiences.</p>
                    <a href="/workshops">View All</a>
                </div>
                <div className="dashboard-card-mini">
                    <h3>Internships</h3>
                    <p>Practical industry exposure.</p>
                    <a href="/internships">View All</a>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
