import './SearchBar.css';

const SearchBar = ({ value, onChange, onSubmit, placeholder = "Search..." }) => {
  return (
    <div className="search-container">
      <form onSubmit={onSubmit} className="search-form">
        <input 
          type="text" 
          placeholder={placeholder} 
          value={value}
          onChange={onChange}
          className="form-input search-input"
        />
        <button 
          type="submit"
          className="btn btn-primary search-button"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;