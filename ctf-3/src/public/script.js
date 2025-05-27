document.addEventListener('DOMContentLoaded', () => {
    const huntButton = document.getElementById('huntButton');
    const resultBox = document.getElementById('result');
    const duck = document.getElementById('duck');
    const duckTypeSelect = document.getElementById('duckType');
    let score = 0;

    // Duck movement animation
    function moveDuck() {
        const randomX = Math.random() * (window.innerWidth - 200);
        const randomY = Math.random() * (window.innerHeight - 200);
        duck.style.left = `${randomX}px`;
        duck.style.top = `${randomY}px`;
    }

    // Initial duck position
    moveDuck();

    // Move duck every 2 seconds
    setInterval(moveDuck, 2000);

    huntButton.addEventListener('click', async () => {
        const selectedDuck = duckTypeSelect.value;
        
        if (!selectedDuck) {
            resultBox.style.display = 'block';
            resultBox.innerHTML = `
                <h3>⚠️ Warning!</h3>
                <p>Please select a duck character first!</p>
            `;
            return;
        }

        try {
            const response = await fetch('/api/hunt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ duckType: selectedDuck })
            });

            const data = await response.json();

            if (response.ok) {
                // Show success animation
                duck.style.animation = 'none';
                duck.style.transform = 'scale(0.5)';
                duck.style.opacity = '0';
                
                // Show result
                resultBox.style.display = 'block';
                resultBox.innerHTML = `
                    <h3>🎯 Bullseye!</h3>
                    <p>${data.message}</p>
                `;
                
                // Update score
                score += 100;
                
                // Reset duck after 1 second
                setTimeout(() => {
                    duck.style.animation = 'bounce 2s infinite ease-in-out';
                    duck.style.transform = 'none';
                    duck.style.opacity = '1';
                }, 1000);
            } else {
                resultBox.style.display = 'block';
                resultBox.innerHTML = `
                    <h3>😢 Missed!</h3>
                    <p>${data.error || 'Try again!'}</p>
                `;
            }
        } catch (error) {
            console.log(error)
            resultBox.style.display = 'block';
            resultBox.innerHTML = `
                <h3>❌ Error!</h3>
                <p>Something went wrong. Are you logged in?</p>
            `;
        }
    });
}); 