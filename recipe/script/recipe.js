const apiKey = '7f48eb97bf4b4a8db500fda40b1a73ba'; 
const searchInput = document.getElementById('search-bar');
const recipeGrid = document.getElementById('recipe-grid');
const modal = document.getElementById('recipe-modal');
const modalContent = document.getElementById('modal-content');

// Function to fetch recipes
async function fetchRecipes(query) {
    try {
        const encodedQuery = encodeURIComponent(query);
        const url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodedQuery}&number=10&apiKey=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error fetching recipes:', error);
        return [];
    }
}

// Display recipes on the page
function displayRecipes(recipes) {
    recipeGrid.innerHTML = '';
    if (recipes.length === 0) {
        recipeGrid.innerHTML = '<p>No recipes found. Try a different query.</p>';
        return;
    }

    recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
            <p>Preparation time: ${recipe.readyInMinutes || 'Not specified'} minutes</p>
        `;
        card.addEventListener('click', () => displayRecipeDetails(recipe));

        recipeGrid.appendChild(card);
    });
}

// Function to toggle recipes in favorites
function toggleFavorite(recipe) {
    let favoritesList = JSON.parse(localStorage.getItem('favorites')) || [];

    // Check if the recipe is already in favorites
    const isFavorite = favoritesList.some(fav => fav.id === recipe.id);

    if (isFavorite) {
        // If the recipe is already in favorites, remove it
        favoritesList = favoritesList.filter(fav => fav.id !== recipe.id);
        alert('Recipe removed from favorites');
    } else {
        // If the recipe is not in favorites, add it
        favoritesList.push(recipe);
        alert('Recipe added to favorites');
    }

    // Save the updated list in localStorage
    localStorage.setItem('favorites', JSON.stringify(favoritesList));
    displayFavorites();
}

// Display favorite recipes
function displayFavorites() {
    const favoritesList = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoritesGrid = document.getElementById('favorites-grid');
    
    favoritesGrid.innerHTML = '';

    if (favoritesList.length === 0) {
        favoritesGrid.innerHTML = '<p>No recipes in favorites.</p>';
        return;
    }

    favoritesList.forEach(recipe => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
            <p>Preparation time: ${recipe.readyInMinutes || 'Not specified'} minutes</p>
        `;
        card.addEventListener('click', () => displayRecipeDetails(recipe));

        favoritesGrid.appendChild(card);
    });
}

// Display recipe details in the modal
async function displayRecipeDetails(recipe) {
    try {
        const url = `https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        const favoritesList = JSON.parse(localStorage.getItem('favorites')) || [];
        const isFavorite = favoritesList.some(fav => fav.id === recipe.id);

        modalContent.innerHTML = `
            <h2>${data.title}</h2>
            <img src="${data.image}" alt="${data.title}">
            <p><strong>Preparation time:</strong> ${data.readyInMinutes} minutes</p>
            <p><strong>Ingredients:</strong></p>
            <ul>
                ${data.extendedIngredients.map(ingredient => `<li>${ingredient.original}</li>`).join('')}
            </ul>
            <p><strong>Instructions:</strong></p>
            <p>${data.instructions || 'Instructions not provided.'}</p>
            <button id="favorite-btn">${isFavorite ? 'Remove from favorites' : 'Add to favorites'}</button>
        `;

        // Add event listener to the favorite button in the modal
        const favoriteButton = document.getElementById('favorite-btn');
        favoriteButton.addEventListener('click', () => {
            toggleFavorite(recipe);
            // Reload modal with updated button state
            displayRecipeDetails(recipe);
        });

        modal.style.display = 'flex';
    } catch (error) {
        console.error('Error fetching recipe details:', error);
    }
}

// Close the modal
function closeModal() {
    modal.style.display = 'none';
}

// Search recipes as the user types
searchInput.addEventListener('input', async () => {
    const query = searchInput.value;
    const recipes = await fetchRecipes(query);
    displayRecipes(recipes);
});

// Initially display favorite recipes
displayFavorites();
