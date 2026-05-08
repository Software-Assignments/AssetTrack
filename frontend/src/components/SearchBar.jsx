export default function SearchBar({ value, onChange, placeholder = 'Search…' }) {
    return (
        <input
            type="search"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ maxWidth: 320 }}
        />
    );
}