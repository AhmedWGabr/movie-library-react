'use client';

import { Genre } from '@/lib/tmdb';
import { ChangeEvent, useState, useEffect } from 'react';

export interface Filters {
  sortBy?: string;
  withGenres?: string[]; // Array of genre IDs
  primaryReleaseDateGte?: string; // YYYY string from select
  primaryReleaseDateLte?: string; // YYYY string from select
  voteAverageGte?: number;
  voteAverageLte?: number;
}

interface FilterSidebarProps {
  genres: Genre[];
  initialFilters: Filters;
  onFilterChange: (newFilters: Filters) => void;
  isSearchActive: boolean;
}

// New structure for sort properties
const SORTABLE_PROPERTIES = [
  { key: 'popularity', label: 'Popularity', defaultDir: 'desc' as const },
  { key: 'primary_release_date', label: 'Release Date', defaultDir: 'desc' as const },
  { key: 'revenue', label: 'Revenue', defaultDir: 'desc' as const },
  { key: 'vote_average', label: 'Vote Average', defaultDir: 'desc' as const },
  { key: 'vote_count', label: 'Vote Count', defaultDir: 'desc' as const },
  // { key: 'original_title', label: 'Original Title', defaultDir: 'asc' as const }, // Example if API supports
];

const LATEST_YEAR = new Date().getFullYear();
const EARLIEST_YEAR = 1900;
const yearOptions: string[] = [];
for (let y = LATEST_YEAR; y >= EARLIEST_YEAR; y--) {
  yearOptions.unshift(y.toString()); // Add to beginning to keep it sorted 1900...LATEST_YEAR
}

const ratingValues: number[] = Array.from({ length: 10 }, (_, i) => i + 1); // 1 to 10

interface SideScrollPickerProps {
  label: string;
  options: (string | number)[];
  selectedValue: string | number | undefined;
  onSelect: (value: string | number | undefined) => void;
  name: string; // for key generation
  disabled?: boolean;
  allowAny?: boolean; // Whether to include an "Any" option
}

const SideScrollPicker: React.FC<SideScrollPickerProps> = ({
  label,
  options,
  selectedValue,
  onSelect,
  name,
  disabled = false,
  allowAny = true,
}) => {
  return (
    <div className="mb-2"> {/* Reduced bottom margin for tighter packing */}
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <div className="flex overflow-x-auto space-x-1.5 pb-2"> {/* scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent */}
        {allowAny && (
          <button
            key={`${name}-any`}
            onClick={() => onSelect(undefined)}
            disabled={disabled}
            type="button"
            className={`px-2.5 py-1 border rounded-full text-xs whitespace-nowrap
                        ${selectedValue === undefined ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Any
          </button>
        )}
        {options.map(option => (
          <button
            key={`${name}-${option}`}
            onClick={() => onSelect(option)}
            disabled={disabled}
            type="button"
            className={`px-2.5 py-1 border rounded-full text-xs whitespace-nowrap
                        ${selectedValue === option ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};


const FilterSidebar = ({ genres, initialFilters, onFilterChange, isSearchActive }: FilterSidebarProps) => {
  const [currentFilters, setCurrentFilters] = useState<Filters>(initialFilters);
  
  const [activeSortProperty, setActiveSortProperty] = useState<string>(SORTABLE_PROPERTIES[0].key);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>(SORTABLE_PROPERTIES[0].defaultDir);

  useEffect(() => {
    setCurrentFilters(initialFilters);
    if (initialFilters.sortBy) {
      const parts = initialFilters.sortBy.split('.');
      const propKey = parts[0];
      const direction = parts[1] as 'asc' | 'desc';
      
      if (SORTABLE_PROPERTIES.some(p => p.key === propKey) && (direction === 'asc' || direction === 'desc')) {
        setActiveSortProperty(propKey);
        setActiveSortDirection(direction);
      } else {
        // Fallback to default if sortBy from URL is invalid
        const defaultSort = SORTABLE_PROPERTIES[0];
        setActiveSortProperty(defaultSort.key);
        setActiveSortDirection(defaultSort.defaultDir);
      }
    } else {
      // Default if no sortBy is provided
      const defaultSort = SORTABLE_PROPERTIES[0];
      setActiveSortProperty(defaultSort.key);
      setActiveSortDirection(defaultSort.defaultDir);
    }
  }, [initialFilters]);
  
  const updateSortInFilters = (property: string, direction: 'asc' | 'desc') => {
    const newSortByValue = `${property}.${direction}`;
    const newFilters = { ...currentFilters, sortBy: newSortByValue };
    setCurrentFilters(newFilters); // Update local full filter state
    onFilterChange(newFilters); // Propagate all filters up
  };

  const handleSortPropertyChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (isSearchActive) return;
    const newPropertyKey = event.target.value;
    const propConfig = SORTABLE_PROPERTIES.find(p => p.key === newPropertyKey) || SORTABLE_PROPERTIES[0];
    
    // When property changes, reset direction to its default
    const newDirection = propConfig.defaultDir;
    
    setActiveSortProperty(newPropertyKey);
    setActiveSortDirection(newDirection);
    updateSortInFilters(newPropertyKey, newDirection);
  };

  const handleSortDirectionToggle = () => {
    if (isSearchActive) return;
    const newDirection = activeSortDirection === 'desc' ? 'asc' : 'desc';
    setActiveSortDirection(newDirection);
    updateSortInFilters(activeSortProperty, newDirection);
  };

  // Generic handler for SideScrollPickers
  const handleFilterValueChange = (filterName: keyof Omit<Filters, 'sortBy'>, value: string | number | undefined) => {
    const newFilters = { 
      ...currentFilters, 
      sortBy: `${activeSortProperty}.${activeSortDirection}`, // Ensure sortBy is always present
      [filterName]: value 
    };
    setCurrentFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleGenreChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isSearchActive) return; 

    const genreId = e.target.value;
    const isChecked = e.target.checked;
    const currentSelectedGenres = currentFilters.withGenres || [];
    let newSelectedGenres: string[];

    if (isChecked) {
      newSelectedGenres = [...currentSelectedGenres, genreId];
    } else {
      newSelectedGenres = currentSelectedGenres.filter((id) => id !== genreId);
    }
    const newFilters = { ...currentFilters, withGenres: newSelectedGenres.length > 0 ? newSelectedGenres : undefined };
    setCurrentFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <aside className="w-full md:w-64 lg:w-72 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Filters</h3>

      {/* Sort By Dropdown + Toggle Button */}
      <div className={`mb-6 ${isSearchActive ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <label htmlFor="sortProperty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Sort By {isSearchActive && <span className="text-xs">(Disabled for search)</span>}
        </label>
        <div className="flex items-center space-x-2">
          <select
            id="sortProperty"
            name="sortProperty"
            value={activeSortProperty}
            onChange={handleSortPropertyChange}
            disabled={isSearchActive}
            className={`flex-grow mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white ${isSearchActive ? 'cursor-not-allowed' : ''}`}
          >
            {SORTABLE_PROPERTIES.map(prop => (
              <option key={prop.key} value={prop.key}>
                {prop.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleSortDirectionToggle}
            disabled={isSearchActive}
            aria-label={`Toggle sort direction, current is ${activeSortDirection === 'desc' ? 'descending' : 'ascending'}`}
            className={`mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm dark:bg-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isSearchActive ? 'cursor-not-allowed' : ''}`}
          >
            {activeSortDirection === 'desc' ? '▼' : '▲'}
          </button>
        </div>
      </div>
      
      {/* Release Year Range with SideScrollPicker */}
      <div className="mb-4"> {/* Reduced bottom margin */}
        <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Release Year Range
        </p>
        <SideScrollPicker
          label="From Year"
          name="primaryReleaseDateGte"
          options={yearOptions}
          selectedValue={currentFilters.primaryReleaseDateGte}
          onSelect={(value) => handleFilterValueChange('primaryReleaseDateGte', value as string | undefined)}
          // Year range is not disabled by isSearchActive in current logic
        />
        <SideScrollPicker
          label="To Year"
          name="primaryReleaseDateLte"
          options={yearOptions}
          selectedValue={currentFilters.primaryReleaseDateLte}
          onSelect={(value) => handleFilterValueChange('primaryReleaseDateLte', value as string | undefined)}
        />
      </div>

      {/* Rating Range (Vote Average) with SideScrollPicker */}
      <div className={`mb-4 ${isSearchActive ? 'opacity-50' : ''}`}> {/* Reduced bottom margin */}
        <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Rating Range (1-10) {isSearchActive && <span className="text-xs">(Disabled for search)</span>}
        </p>
        <SideScrollPicker
          label="Min Rating"
          name="voteAverageGte"
          options={ratingValues}
          selectedValue={currentFilters.voteAverageGte}
          onSelect={(value) => handleFilterValueChange('voteAverageGte', value as number | undefined)}
          disabled={isSearchActive}
        />
        <SideScrollPicker
          label="Max Rating"
          name="voteAverageLte"
          options={ratingValues}
          selectedValue={currentFilters.voteAverageLte}
          onSelect={(value) => handleFilterValueChange('voteAverageLte', value as number | undefined)}
          disabled={isSearchActive}
        />
      </div>
      
      {/* Genres */}
      <div className={`mb-4 ${isSearchActive ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Genres {isSearchActive && <span className="text-xs">(Disabled for search)</span>}
        </h4>
        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
          {genres.map(genre => (
            <div key={genre.id} className={`flex items-center ${isSearchActive ? 'cursor-not-allowed' : ''}`}>
              <input
                type="checkbox"
                id={`genre-${genre.id}`}
                name="withGenres"
                value={genre.id.toString()}
                checked={(currentFilters.withGenres || []).includes(genre.id.toString())}
                onChange={handleGenreChange}
                disabled={isSearchActive}
                className={`h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:focus:ring-offset-gray-800 ${isSearchActive ? 'cursor-not-allowed' : ''}`}
              />
              <label 
                htmlFor={`genre-${genre.id}`} 
                className={`ml-2 text-sm text-gray-600 dark:text-gray-300 ${isSearchActive ? 'cursor-not-allowed' : ''}`}
              >
                {genre.name}
              </label>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
