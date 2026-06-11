async function test() {
  const body = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    message: 'Hello, this is a test message.'
  };

  try {
    const res = await fetch('https://donauton-suite.de/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    console.log('Status:', res.status);
    console.log('Headers:', Object.fromEntries(res.headers.entries()));
    const text = await res.text();
    console.log('Response:', text);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
