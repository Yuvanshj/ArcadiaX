document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const gameCards = document.querySelectorAll('.game-card');

    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        gameCards.forEach(card => {
            const titleElement = card.querySelector('.game-title');
            if (titleElement) {
                const title = titleElement.innerText.toLowerCase();
                
                if (title.includes(query)) {
                    card.style.display = ''; 
                } else {
                    card.style.display = 'none'; 
                }
            }
        });
    });
});
