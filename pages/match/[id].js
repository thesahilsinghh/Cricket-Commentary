import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { io } from 'socket.io-client';
import Link from 'next/link';

const API_BASE_URL = 'http://localhost:2999';
const SOCKET_URL = 'http://localhost:2999';

export default function MatchDetails() {
    const router = useRouter();
    const { id } = router.query;
    const [match, setMatch] = useState(null);
    const [commentary, setCommentary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);
    const [showAddCommentaryForm, setShowAddCommentaryForm] = useState(false);
    const [newCommentary, setNewCommentary] = useState({
        over: '',
        ball: '',
        eventType: 'run',
        runs: 0,
        description: '',
        batsman: '',
        bowler: ''
    });

    useEffect(() => {
        if (id) {
            fetchMatchDetails();
            setupSocket();
        }

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [id]);

    const fetchMatchDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/matches/${id}`);
            setMatch(response.data.match);
            setCommentary(response.data.commentary);
            setError(null);
        } catch (err) {
            setError('Failed to fetch match details');
            console.error('Error fetching match details:', err);
        } finally {
            setLoading(false);
        }
    };

    const setupSocket = () => {
        const newSocket = io(SOCKET_URL);

        newSocket.on('connect', () => {
            console.log('Connected to server');
            newSocket.emit('joinMatch', parseInt(id));
        });

        newSocket.on('commentaryUpdate', (data) => {
            if (data.matchId === parseInt(id)) {
                setCommentary(prev => [...prev, data.commentary]);
            }
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        setSocket(newSocket);
    };

    const handleAddCommentary = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/matches/${id}/commentary`, newCommentary);
            setNewCommentary({
                over: '',
                ball: '',
                eventType: 'run',
                runs: 0,
                description: '',
                batsman: '',
                bowler: ''
            });
            setShowAddCommentaryForm(false);
        } catch (err) {
            setError('Failed to add commentary');
            console.error('Error adding commentary:', err);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getEventTypeClass = (eventType) => {
        switch (eventType) {
            case 'run':
                return 'event-run';
            case 'wicket':
                return 'event-wicket';
            case 'wide':
                return 'event-wide';
            case 'boundary':
                return 'event-boundary';
            case 'six':
                return 'event-six';
            default:
                return 'event-run';
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="header">
                    <h1>🏏 Cricket Scoring App</h1>
                    <p>Real-time cricket scoreboard and commentary</p>
                </div>
                <div className="loading">Loading match details...</div>
            </div>
        );
    }

    if (error || !match) {
        return (
            <div className="container">
                <div className="header">
                    <h1>🏏 Cricket Scoring App</h1>
                    <p>Real-time cricket scoreboard and commentary</p>
                </div>
                <div className="error">{error || 'Match not found'}</div>
                <Link href="/">
                    <button className="btn">← Back to Matches</button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="header">
                <h1>🏏 Cricket Scoring App</h1>
                <p>Real-time cricket scoreboard and commentary</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <Link href="/">
                    <button className="btn btn-secondary">← Back to Matches</button>
                </Link>
            </div>

            <div className="card">
                <h2>Match Details</h2>
                <div className="match-info">
                    <div className="match-teams">
                        {match.team1} vs {match.team2}
                    </div>
                    <div className={`match-status status-${match.status}`}>
                        {match.status}
                    </div>
                </div>
                <div className="match-venue">📍 {match.venue}</div>
                <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#7f8c8d' }}>
                    Match ID: {match.matchId} | Started: {formatDate(match.createdAt)}
                </div>
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>Live Commentary</h2>
                    <button
                        className="btn btn-success"
                        onClick={() => setShowAddCommentaryForm(!showAddCommentaryForm)}
                    >
                        {showAddCommentaryForm ? 'Cancel' : 'Add Commentary'}
                    </button>
                </div>

                {showAddCommentaryForm && (
                    <form onSubmit={handleAddCommentary} style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                        <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>Add Ball Commentary</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="form-group">
                                <label htmlFor="over">Over</label>
                                <input
                                    type="number"
                                    id="over"
                                    value={newCommentary.over}
                                    onChange={(e) => setNewCommentary({ ...newCommentary, over: e.target.value })}
                                    placeholder="e.g., 1"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="ball">Ball</label>
                                <input
                                    type="number"
                                    id="ball"
                                    value={newCommentary.ball}
                                    onChange={(e) => setNewCommentary({ ...newCommentary, ball: e.target.value })}
                                    placeholder="e.g., 1"
                                    required
                                />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="form-group">
                                <label htmlFor="eventType">Event Type</label>
                                <select
                                    id="eventType"
                                    value={newCommentary.eventType}
                                    onChange={(e) => setNewCommentary({ ...newCommentary, eventType: e.target.value })}
                                >
                                    <option value="run">Run</option>
                                    <option value="wicket">Wicket</option>
                                    <option value="wide">Wide</option>
                                    <option value="no-ball">No Ball</option>
                                    <option value="bye">Bye</option>
                                    <option value="leg-bye">Leg Bye</option>
                                    <option value="boundary">Boundary</option>
                                    <option value="six">Six</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="runs">Runs</label>
                                <input
                                    type="number"
                                    id="runs"
                                    value={newCommentary.runs}
                                    onChange={(e) => setNewCommentary({ ...newCommentary, runs: e.target.value })}
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="form-group">
                                <label htmlFor="batsman">Batsman</label>
                                <input
                                    type="text"
                                    id="batsman"
                                    value={newCommentary.batsman}
                                    onChange={(e) => setNewCommentary({ ...newCommentary, batsman: e.target.value })}
                                    placeholder="Batsman name"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="bowler">Bowler</label>
                                <input
                                    type="text"
                                    id="bowler"
                                    value={newCommentary.bowler}
                                    onChange={(e) => setNewCommentary({ ...newCommentary, bowler: e.target.value })}
                                    placeholder="Bowler name"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                value={newCommentary.description}
                                onChange={(e) => setNewCommentary({ ...newCommentary, description: e.target.value })}
                                placeholder="Describe what happened..."
                                rows="3"
                                required
                            />
                        </div>
                        <button type="submit" className="btn">Add Commentary</button>
                    </form>
                )}

                {commentary.length === 0 ? (
                    <div className="loading">No commentary yet. Add the first ball!</div>
                ) : (
                    <div>
                        {commentary.map((item, index) => (
                            <div key={index} className="commentary-item">
                                <div className="commentary-header">
                                    <div className="ball-info">
                                        Over {item.over}.{item.ball}
                                    </div>
                                    <div className={`event-type ${getEventTypeClass(item.eventType)}`}>
                                        {item.eventType} {item.runs > 0 && `(${item.runs})`}
                                    </div>
                                </div>
                                <div className="commentary-description">
                                    {item.description}
                                </div>
                                <div className="commentary-meta">
                                    {item.batsman && `Batsman: ${item.batsman}`}
                                    {item.batsman && item.bowler && ' • '}
                                    {item.bowler && `Bowler: ${item.bowler}`}
                                    {item.batsman && ` • ${formatDate(item.timestamp)}`}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
