const apiKey = '4895c6fcd4a70f83ca94fb3dd99f76f7';
const searchInput = document.getElementById('search-bar');
const movieGrid = document.getElementById('movie-grid');
const modal = document.getElementById('movie-modal');
const modalContent = document.getElementById('modal-content');

// Fetch movie data from TMDb API
async function fetchMovies(query) {
    try {
        const encodedQuery = encodeURIComponent(query);
        const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodedQuery}&page=1`;
        const response = await fetch(url);
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error fetching movies:', error);
        return [];
    }
}

// Display movie results in a grid
function displayMovies(movies) {
    movieGrid.innerHTML = '';
    if (movies.length === 0) {
        movieGrid.innerHTML = '<p>No movies found. Try a different query.</p>';
        return;
    }

    movies.forEach(movie => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>Release date: ${movie.release_date || 'Not specified'}</p>
        `;
        card.addEventListener('click', () => displayMovieDetails(movie));
        movieGrid.appendChild(card);
    });
}

// Show movie details in a modal
async function displayMovieDetails(movie) {
    try {
        const url = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
        const isInWatchlist = watchlist.some(item => item.id === movie.id);

        modalContent.innerHTML = `
            <h2>${data.title}</h2>
            <img src="https://image.tmdb.org/t/p/w500${data.poster_path}" alt="${data.title}">
            <p><strong>Synopsis:</strong> ${data.overview}</p>
            <p><strong>Rating:</strong> ${data.vote_average}</p>
            <p><strong>Runtime:</strong> ${data.runtime} minutes</p>
            <button id="watchlist-btn">${isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}</button>
        `;

        // Toggle watchlist status
        const watchlistButton = document.getElementById('watchlist-btn');
        watchlistButton.addEventListener('click', () => {
            toggleWatchlist(movie);
            displayMovieDetails(movie);
        });

        modal.style.display = 'flex';
    } catch (error) {
        console.error('Error fetching movie details:', error);
    }
}

// Toggle a movie in the watchlist
function toggleWatchlist(movie) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

    // Check if movie is already in the watchlist
    const isInWatchlist = watchlist.some(item => item.id === movie.id);

    if (isInWatchlist) {
        watchlist = watchlist.filter(item => item.id !== movie.id);
        alert('Movie removed from Watchlist');
    } else {
        watchlist.push(movie);
        alert('Movie added to Watchlist');
    }

    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    displayWatchlist();
}

// Display watchlist movies
function displayWatchlist() {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    const watchlistGrid = document.getElementById('watchlist-grid');
    
    watchlistGrid.innerHTML = '';

    if (watchlist.length === 0) {
        watchlistGrid.innerHTML = '<p>No movies in watchlist.</p>';
        return;
    }

    watchlist.forEach(movie => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>Release date: ${movie.release_date || 'Not specified'}</p>
        `;
        card.addEventListener('click', () => displayMovieDetails(movie));
        watchlistGrid.appendChild(card);
    });
}

// Close the modal
function closeModal() {
    modal.style.display = 'none';
}

// Search movies as the user types
searchInput.addEventListener('input', async () => {
    const query = searchInput.value;
    const movies = await fetchMovies(query);
    displayMovies(movies);
});

// Display watchlist when the page loads
displayWatchlist();
