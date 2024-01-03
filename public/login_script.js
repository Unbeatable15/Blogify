document.getElementById('signupForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block';
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email : email, password : password}),
      });
      
      if (response.ok) {
        console.log('Log In successfully');
        window.location.href = '/';
        
      } else {
        const errorResponse = await response.json();
        console.error('Error adding user');
        const errorMessage = document.getElementById('errorMessage');
        console.log(errorResponse);
        errorMessage.textContent = errorResponse;
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle other errors
    }finally {
      // Hide loading indicator when the operation is completed (successful or failed)
      loadingIndicator.style.display = 'none';
    }
  });