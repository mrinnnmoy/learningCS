const FILTERS = ['all', 'active', 'completed'];

export default function TodoFilters({ currentFilter, onFilterChange }) {
    return (
        <div className="todo-filters">
            {FILTERS.map(filter => (
                <button
                    key={filter}
                    onClick={() => onFilterChange(filter)}
                    className={`filter-btn ${currentFilter === filter ? 'active' : ''}`}
                >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
            ))}
        </div>
    );
}