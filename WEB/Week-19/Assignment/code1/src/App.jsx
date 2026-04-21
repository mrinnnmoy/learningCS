import Card from './components/Card';
import ProfileCard from './components/ProfileCard';

function App() {
  return (
    <div className="app">
      <h1 className="page-title">Team Members</h1>
      <div className="card-grid">
        <Card>
          <ProfileCard
            name="Alice Johnson"
            role="Frontend Engineer"
            avatarEmoji="👩‍💻"
            bio="Loves building accessible, performant interfaces. Coffee enthusiast and occasional hiker."
            initialFollowers={128}
          />
        </Card>

        <Card>
          <ProfileCard
            name="Bob Smith"
            role="Backend Engineer"
            avatarEmoji="🧑‍💻"
            bio="Database nerd. Will talk about indexing strategies for hours if you let him."
            initialFollowers={94}
          />
        </Card>

        <Card>
          <ProfileCard
            name="Carol White"
            role="Product Designer"
            avatarEmoji="🎨"
            bio="Short bio."
            initialFollowers={210}
          />
        </Card>
      </div>
    </div>
  );
}

export default App;