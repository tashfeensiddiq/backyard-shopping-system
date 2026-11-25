import { useEffect, useState } from "react";
import {
  getProfile,
  updateProfile,
  type Profile,
} from "../services/profileService";

interface ProfilePageProps {
  onBack: () => void;
}

export default function ProfilePage({ onBack }: ProfilePageProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);

      const data = await getProfile();

      setProfile(data);
      setName(data.name || "");
      setPhoneNumber(data.phone_number || "");
      setAddress(data.address || "");
      setProfilePicture(data.profile_picture || "");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updatedProfile = await updateProfile({
        name,
        phone_number: phoneNumber,
        address,
        profile_picture: profilePicture,
      });

      setProfile(updatedProfile);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* Header */}
        <div className="profile-header">
          <button className="profile-back-btn" onClick={onBack}>
            ← Back to Shopping
          </button>

          <h1>My Profile</h1>
          <p>Manage your personal information and account details.</p>
        </div>

        {/* Profile Card */}
        <div className="profile-card">

          {/* Avatar */}
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" />
              ) : (
                <span>
                  {name
                    .split(" ")
                    .map((word) => word.charAt(0))
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
              )}
            </div>

            <div>
              <h2>{profile?.name}</h2>
              <p>{profile?.email}</p>

              <span
                className={`profile-verification ${
                  profile?.is_verified ? "verified" : "unverified"
                }`}
              >
                {profile?.is_verified ? "✓ Verified Account" : "Unverified Account"}
              </span>
            </div>
          </div>

          {/* Messages */}
          {error && <div className="profile-message error">{error}</div>}
          {success && <div className="profile-message success">{success}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="profile-form-group">
              <label htmlFor="profile-name">Full Name</label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="profile-email">Email Address</label>
              <input
                id="profile-email"
                type="email"
                value={profile?.email || ""}
                disabled
              />
              <small>Email address cannot be changed.</small>
            </div>

            <div className="profile-form-group">
              <label htmlFor="profile-phone">Phone Number</label>
              <input
                id="profile-phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="profile-address">Address</label>
              <textarea
                id="profile-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your delivery address"
                rows={4}
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="profile-picture">Profile Picture URL</label>
              <input
                id="profile-picture"
                type="url"
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
                placeholder="https://example.com/profile.jpg"
              />
            </div>

            <button
              type="submit"
              className="profile-save-btn"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}