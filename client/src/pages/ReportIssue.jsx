import { useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Send, Loader2 } from 'lucide-react';
import './ReportIssue.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ReportIssue() {
    const [issue, setIssue] = useState('');
    const [loading, setLoading] = useState(false);
    const { getToken } = useAuth();
    const { user } = useUser();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!issue.trim()) {
            toast.error('Please describe the issue before sending.');
            return;
        }

        setLoading(true);
        try {
            const token = await getToken();
            const response = await axios.post(`${API_URL}/report-issue`,
                { issue: issue.trim() },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                toast.success('Your issue has been sent to the Akvora team.');
                setIssue('');
            }
        } catch (error) {
            console.error('Report Error:', error);
            const errorMsg = error.response?.data?.error || 'Failed to send report. Please try again later.';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="report-page-container">
            <div className="report-card">
                <h1>Report an Issue</h1>
                <p className="report-subtitle">
                    Encountered a bug or have a suggestion? Let us know below.
                </p>

                <form className="report-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="issue-textarea">Describe the issue</label>
                        <textarea
                            id="issue-textarea"
                            className="report-textarea"
                            placeholder="Type details about the issue here... (e.g., I can't download my certificate)"
                            value={issue}
                            onChange={(e) => setIssue(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="send-btn"
                        disabled={loading || !issue.trim()}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="btn-icon animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="btn-icon" />
                                Send Report
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ReportIssue;
