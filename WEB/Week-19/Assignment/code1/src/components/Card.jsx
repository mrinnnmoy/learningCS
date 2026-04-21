// Generic wrapper using the 'children' prop —
// doesn't know or care what content is rendered inside it.
export default function Card({ children }) {
    return <div className="card">{children}</div>;
}