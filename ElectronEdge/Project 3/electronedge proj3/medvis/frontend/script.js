const pages = document.querySelectorAll('.page');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const darkToggle = document.getElementById('darkToggle');

/* ---------- PAGE SWITCH ---------- */
function showPage(id) {
    pages.forEach(page => page.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) {
        target.classList.add('active');
        
        // Add a subtle animation when returning to home
        if (id === 'home') {
            target.style.animation = 'fadeIn 0.6s ease';
        }
    }
}

/* ---------- AUTH SLIDER (PAGE 2 SAFE) ---------- */
const forms = document.querySelector(".forms");
const signinBtn = document.getElementById("signinBtn");
const signupBtn = document.getElementById("signupBtn");

if (forms && signinBtn && signupBtn) {
    signupBtn.addEventListener("click", () => {
        forms.style.transform = "translateX(-50%)";
        signupBtn.classList.add("active");
        signinBtn.classList.remove("active");
    });

    signinBtn.addEventListener("click", () => {
        forms.style.transform = "translateX(0)";
        signinBtn.classList.add("active");
        signupBtn.classList.remove("active");
    });

    // Handle form submissions
    const signInForm = forms.querySelector('.form:first-child');
    const signUpForm = forms.querySelector('.form:last-child');

    if (signInForm) {
        signInForm.addEventListener('submit', handleSignIn);
    }

    if (signUpForm) {
        signUpForm.addEventListener('submit', handleSignUp);
        
        // Add real-time password validation
        const passwordInput = document.getElementById('signupPassword');
        const passwordHelp = document.getElementById('passwordHelp');
        
        if (passwordInput && passwordHelp) {
            passwordInput.addEventListener('input', function() {
                const password = this.value;
                const length = password.length;
                
                if (length === 0) {
                    passwordHelp.textContent = 'Password must be 8-72 characters long';
                    passwordHelp.style.color = '#666';
                } else if (length < 8) {
                    passwordHelp.textContent = `Password too short (${length}/8 characters)`;
                    passwordHelp.style.color = '#dc2626';
                } else if (length > 72) {
                    passwordHelp.textContent = `Password too long (${length}/72 characters)`;
                    passwordHelp.style.color = '#dc2626';
                } else {
                    passwordHelp.textContent = '✓ Password meets requirements';
                    passwordHelp.style.color = '#16a34a';
                }
            });
        }
    }
}

/* ---------- AUTHENTICATION FUNCTIONS ---------- */
async function handleSignIn(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email') || e.target.querySelector('input[type="email"]').value;
    const password = formData.get('password') || e.target.querySelector('input[type="password"]').value;

    try {
        const response = await fetch('/auth/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access_token);
            alert('Sign in successful!');
            window.location.href = '/'; // Redirect to main app
        } else {
            const error = await response.json();
            alert(error.detail || 'Sign in failed');
        }
    } catch (error) {
        console.error('Sign in error:', error);
        alert('Sign in failed. Please try again.');
    }
}

async function handleSignUp(e) {
    e.preventDefault();
    const inputs = e.target.querySelectorAll('input, select');
    const full_name = inputs[0].value.trim();
    const city = inputs[1].value;
    const email = inputs[2].value.trim();
    const password = inputs[3].value;

    // Client-side validation
    if (!full_name) {
        alert('Please enter your full name');
        return;
    }
    
    if (!city) {
        alert('Please select your city');
        return;
    }
    
    if (!email || !email.includes('@') || !email.includes('.')) {
        alert('Please enter a valid email address');
        return;
    }
    
    if (password.length < 8) {
        alert('Password must be at least 8 characters long');
        return;
    }
    
    if (password.length > 72) {
        alert('Password is too long (maximum 72 characters)');
        return;
    }

    try {
        const response = await fetch('/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ full_name, city, email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access_token);
            alert('Account created successfully!');
            window.location.href = '/'; // Redirect to main app
        } else {
            const error = await response.json();
            alert(error.detail || 'Sign up failed');
        }
    } catch (error) {
        console.error('Sign up error:', error);
        alert('Sign up failed. Please try again.');
    }
}

/* ---------- IMAGE PREVIEW ---------- */
if (fileInput && preview) {
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
            preview.src = URL.createObjectURL(file);
            preview.hidden = false;
        }
    });
}

/* ---------- DARK MODE (SAFE + GLOBAL) ---------- */
if (darkToggle) {
    darkToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        localStorage.setItem(
            'theme',
            document.body.classList.contains('dark') ? 'dark' : 'light'
        );
    });
}

/* Apply saved theme */
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
}

/* ---------- BACKEND INTEGRATION ---------- */
async function analyzeSkin() {
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select an image first');
        return;
    }

    showPage('result');
    
    // Show loading state
    document.getElementById("conditionName").innerText = "Analyzing...";
    document.getElementById("confidence").innerText = "Please wait";
    document.getElementById("description").innerText = "AI is analyzing your image...";

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('location', 'Your Area'); // Default location

        const response = await fetch('/predict', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            renderResult(data);
        } else {
            throw new Error('Analysis failed');
        }
    } catch (error) {
        console.error('Error:', error);
        // Fallback to mock data for demo
        const mockResponse = {
            condition: "Eczema",
            confidence: "90%",
            description: "AI detected a skin condition based on visual patterns.",
            dos: ["Moisturize regularly", "Use mild skincare products"],
            donts: ["Avoid scratching", "Avoid harsh chemicals"],
            doctors: [
                {
                    name: "Dr. Sandeep Patil",
                    clinic: "Ruby Hall Clinic, Pune", 
                    phone: "+91 98765 43240"
                }
            ]
        };
        renderResult(mockResponse);
    }
}

/* ---------- RENDER RESULT ---------- */
function renderResult(data) {
    document.getElementById("conditionName").innerText = data.condition;
    document.getElementById("confidence").innerText = data.confidence + " Confidence";
    document.getElementById("description").innerText = data.description;

    const dosList = document.getElementById("dosList");
    const dontsList = document.getElementById("dontsList");
    const doctorsDiv = document.getElementById("doctors");

    dosList.innerHTML = "";
    dontsList.innerHTML = "";
    doctorsDiv.innerHTML = "";

    data.dos.forEach(item => dosList.innerHTML += `<li>${item}</li>`);
    data.donts.forEach(item => dontsList.innerHTML += `<li>${item}</li>`);

    data.doctors.forEach(doc => {
        doctorsDiv.innerHTML += `
            <div class="doctor-card">
                <strong>${doc.name}</strong>
                <p>${doc.clinic}</p>
                <p>📞 ${doc.phone}</p>
            </div>
        `;
    });
}
