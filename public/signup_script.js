document.getElementById('signupForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log(name);
    try {
      const response = await fetch('/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({name : name, email : email, password : password}),
      });
      if (response.ok) {
        console.log('User added successfully');
        window.location.href = '/login';
        
      } else {
        const errorResponse = await response.json();
        console.error('Error adding user');
        const errorMessage = document.getElementById('errorMessage');
        console.log(errorResponse.catchError.detail);
        errorMessage.textContent = errorResponse.catchError.detail;
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle other errors
    }
  });