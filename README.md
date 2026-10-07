#  TextCraftAI

**TextCraftAI** is an AI-powered web application designed to help users **reformulate and translate text** quickly and easily.

The project combines a simple and intuitive frontend with AI-powered processing through the **Groq API** and **Netlify Functions**.

---

##  Features

*  AI-powered text reformulation
*  Text translation
*  Fast AI processing
*  Clean and responsive user interface
* Serverless backend with Netlify Functions
*  API key handled through environment configuration
*  Lightweight frontend built with HTML, CSS and JavaScript

---

##  Technologies

* **HTML5**
* **CSS3**
* **JavaScript**
* **Groq API**
* **Netlify Functions**
* **Netlify**
* **Git & GitHub**

---

##  Project Structure

```text
TextCraftAI/
│
├── index.html
├── style.css
├── script.js
├── package.json
├── netlify.toml
│
├── netlify/
│   └── functions/
│       ├── reformulate.js
│       └── translate.js
│
└── .gitignore
```

---

##  How It Works

TextCraftAI uses a frontend interface where the user enters text and selects the desired operation.

The application communicates with serverless Netlify Functions, which handle the AI-related requests and communicate with the Groq API.

```text
User
  ↓
TextCraftAI Interface
  ↓
Netlify Function
  ↓
Groq API
  ↓
AI Processing
  ↓
Result displayed to the user
```

---

##  Environment Variables

The Groq API key should **never be committed to GitHub**.

Configure the API key as an environment variable in your local/deployment environment.

Example:

```env
GROQ_API_KEY=your_groq_api_key
```

Make sure `.env` files remain excluded from Git using `.gitignore`.

---

##  Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/fadwadhmaid/TextCraftAI.git
cd TextCraftAI
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure your environment

Create a `.env` file and add your Groq API key.

```env
GROQ_API_KEY=your_groq_api_key
```

### 4. Run the project

Use Netlify CLI to run the application locally with the serverless functions:

```bash
netlify dev
```

---

##  Deployment

The project is designed to work with **Netlify** and its serverless functions.

The `netlify.toml` file contains the project configuration and the functions are located in:

```text
netlify/functions/
```

---

##  Project Goals

TextCraftAI was created to explore the integration of **AI APIs into modern web applications** while keeping the application lightweight and easy to use.

The project demonstrates:

* API integration
* Serverless architecture
* Frontend development
* Asynchronous JavaScript
* AI-powered text processing
* Secure API key management
* Deployment with Netlify

---

##  Future Improvements

Potential future improvements include:

* User authentication
* Saved text history
* More writing styles
* More translation languages
* Custom AI prompts
* Copy and export options
* Improved AI response handling
* Usage statistics

---

##  Author

**Fadwa Dhmaid**

Software Engineer | AI & Web Developer

GitHub: [@fadwadhmaid](https://github.com/fadwadhmaid)

---

##  License

This project is available for educational and portfolio purposes.
