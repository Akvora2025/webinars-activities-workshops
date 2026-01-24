import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

function Layout({ children }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={`app-layout ${isExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
            <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
            {isExpanded && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsExpanded(false)}
                />
            )}
            <div className="main-container">
                <Header />
                <main className="content-area">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default Layout;
