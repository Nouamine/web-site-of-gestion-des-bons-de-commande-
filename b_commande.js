document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('orderForm');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const orderData = {
            codeClient: document.getElementById('code_client').value,
            prixUnite: document.getElementById('prix_unite').value,
            quantite: document.getElementById('quantite').value,
            size: document.getElementById('size').value
        };

        try {
            const response = await fetch('http://localhost:3004/submit-order', {  // Update this URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();
            if (response.ok) {
                alert('Order saved successfully');
            } else {
                alert('Failed to save order: ' + result.message);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Error submitting form');
        }
    });
});