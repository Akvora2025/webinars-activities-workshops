import { useNavigate } from 'react-router-dom';
import './Placeholder.css';

function Placeholder({ title }) {
    const navigate = useNavigate();

    return (
        <div className="placeholder-container">
            <div className="placeholder-content">
                <div className="placeholder-icon">🚀</div>
                <h1>{title}</h1>
                <p>This section is currently under development. Stay tuned for updates!</p>
                <button onClick={() => navigate('/')} className="back-btn">
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}

export default Placeholder;
