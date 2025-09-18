'use client'

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';


export default function Home() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showStartMatchForm, setShowStartMatchForm] = useState(false);
    const [newMatch, setNewMatch] = useState({
        team1: '',
        team2: '',
        venue: ''
    });

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/matches`);
            setMatches(response.data.matches);
            setError(null);
        } catch (err) {
            setError('Failed to fetch matches');
            console.error('Error fetching matches:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStartMatch = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/matches/start`, newMatch);
            setMatches([response.data.match, ...matches]);
            setNewMatch({ team1: '', team2: '', venue: '' });
            setShowStartMatchForm(false);
        } catch (err) {
            setError('Failed to start match');
            console.error('Error starting match:', err);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <div className="container">
                <div className="header">
                    <h1>Cricket Scoring App</h1>
                </div>
                <div className="loading">Loading matches...</div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="header">
                <h1>Cricket Scoring App</h1>

            </div>

            {error && <div className="error">{error}</div>}

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>Ongoing Matches</h2>
                    <button
                        className="btn btn-success"
                        onClick={() => setShowStartMatchForm(!showStartMatchForm)}
                    >
                        {showStartMatchForm ? 'Cancel' : 'Start New Match'}
                    </button>
                </div>

                {showStartMatchForm && (
                    <form onSubmit={handleStartMatch} style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                        <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>Start New Match</h3>
                        <div className="form-group">
                            <label htmlFor="team1">Team 1</label>
                            <input
                                type="text"
                                id="team1"
                                value={newMatch.team1}
                                onChange={(e) => setNewMatch({ ...newMatch, team1: e.target.value })}
                                placeholder="Enter team 1 name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="team2">Team 2</label>
                            <input
                                type="text"
                                id="team2"
                                value={newMatch.team2}
                                onChange={(e) => setNewMatch({ ...newMatch, team2: e.target.value })}
                                placeholder="Enter team 2 name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="venue">Venue</label>
                            <input
                                type="text"
                                id="venue"
                                value={newMatch.venue}
                                onChange={(e) => setNewMatch({ ...newMatch, venue: e.target.value })}
                                placeholder="Enter venue name"
                                required
                            />
                        </div>
                        <button type="submit" className="btn">Start Match</button>
                    </form>
                )}

                {matches.length === 0 ? (
                    <div className="loading">No matches found. Start a new match to begin!</div>
                ) : (
                    <div className="col">
                        {matches.map((match) => (
                            <Link key={match.matchId} href={`/match/${match.matchId}`}>
                                <div className="card match-card">
                                    <div className="match-info">
                                        <div style={{ textDecoration: "underline", color: "black" }} className="match-teams">
                                            {match.team1} vs {match.team2}
                                        </div>
                                        <div style={{ textDecoration: "none" }} className={`match-status status-${match.status}`}>
                                            {match.status}
                                        </div>
                                    </div>
                                    <div className="match-venue">{match.venue}</div>
                                    <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#7f8c8d', textDecoration: "underline" }}>
                                        Match ID: {match.matchId} | Started: {formatDate(match.createdAt)}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
