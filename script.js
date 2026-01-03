// Initialize Supabase client
const SUPABASE_URL = 'https://mxvvgrvtnbdnazzzffmt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dnZncnZ0bmJkbmF6enpmZm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjU2NjUsImV4cCI6MjA4MjcwMTY2NX0.GBZNLWqLFQCPCCtExAsThma15gyOrWldO3T0rR3vNHE';
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById('waitlist-form');
const emailInput = document.getElementById('email');
const submitBtn = document.getElementById('submit-btn');
const btnText = submitBtn.querySelector('span');
const loader = submitBtn.querySelector('.loader');
const messageEl = document.getElementById('message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();

    if (!validateEmail(email)) {
        showMessage('Please enter a valid email address.', 'error');
        return;
    }

    setLoading(true);
    showMessage('', ''); // Clear previous messages

    try {
        const { data, error } = await client
            .from('waitlist')
            .insert([{ email: email }]);

        if (error) {
            // Handle unique constraint violation specifically if possible, 
            // but standard error message usually suffices or we check code
            if (error.code === '23505') { // Unique violation
                showMessage("You're already on the waitlist!", 'success'); // Treat as success to user
            } else {
                console.error('Error adding to waitlist:', error);
                showMessage('Something went wrong. Please try again.', 'error');
            }
        } else {
            showMessage("You're in! We'll notify you soon.", 'success');
            form.reset();
        }
    } catch (err) {
        console.error('Unexpected error:', err);
        showMessage('An unexpected error occurred.', 'error');
    } finally {
        setLoading(false);
    }
});

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    if (isLoading) {
        btnText.classList.add('hidden');
        loader.classList.remove('hidden');
    } else {
        btnText.classList.remove('hidden');
        loader.classList.add('hidden');
    }
}

function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = 'message visible ' + type;

    // Auto-hide error messages after a few seconds
    if (type === 'error') {
        setTimeout(() => {
            messageEl.classList.remove('visible');
        }, 5000);
    }
}
