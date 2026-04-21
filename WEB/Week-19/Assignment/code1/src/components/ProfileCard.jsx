import { useState } from 'react';

export default function ProfileCard({ name, role, avatarEmoji, bio, initialFollowers = 0 }) {
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(initialFollowers);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleFollowClick = () => {
        setIsFollowing(prev => !prev);
        // Functional update ensures we always read the LATEST count,
        // even if multiple state updates happened in quick succession.
        setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);
    };

    const truncatedBio = bio.length > 60 ? bio.slice(0, 60) + '...' : bio;
    // If the bio is short enough, there's nothing to expand — hide the toggle.
    const needsToggle = bio.length > 60;

    return (
        <div className="profile-card">
            <div className="avatar">{avatarEmoji}</div>
            <h3 className="name">{name}</h3>
            <p className="role">{role}</p>

            <p className="bio">
                {isExpanded ? bio : truncatedBio}
                {needsToggle && (
                    <button
                        className="toggle-link"
                        onClick={() => setIsExpanded(prev => !prev)}
                    >
                        {isExpanded ? ' Show less' : ' Show more'}
                    </button>
                )}
            </p>

            <div className="profile-footer">
                <span className="follower-count">{followerCount} followers</span>
                <button
                    className={`follow-btn ${isFollowing ? 'following' : ''}`}
                    onClick={handleFollowClick}
                >
                    {isFollowing ? 'Following' : 'Follow'}
                </button>
            </div>
        </div>
    );
}