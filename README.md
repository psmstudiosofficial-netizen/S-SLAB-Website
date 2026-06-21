# SLAB Fashion E-Commerce Website

A modern, responsive fashion e-commerce website built with HTML, CSS, JavaScript, and Firebase authentication. The website showcases a clothing collection including hoodies, oversized t-shirts, and pants/jeans.

## 📋 Overview

SLAB is a fashion-focused e-commerce platform that allows users to browse and purchase clothing items. The website features a clean, modern design with responsive layouts that work across different device sizes.

## ✨ Features

- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop devices
- **User Authentication**: Secure login and registration system using Firebase
- **Product Showcase**: Attractive product displays with image carousels
- **Modern UI**: Clean, contemporary design with smooth animations
- **Social Media Integration**: Links to various social media platforms
- **Video Background**: Engaging hero section with auto-playing video
- **Typed.js Animation**: Dynamic text animations in the header

## 🛠️ Technologies Used

- **Frontend**:
  - HTML5
  - CSS3 (with Bootstrap 5.3.3)
  - JavaScript (Vanilla JS)
  - [Bootstrap](https://getbootstrap.com/) - CSS Framework
  - [Typed.js](https://mattboldt.com/demos/typed-js/) - Text animation library
  - [Material Design Icons](https://pictogrammers.com/library/mdi/) - Icon set
  - [Animate.css](https://animate.style/) - CSS animations
  - [jQuery](https://jquery.com/) - JavaScript library
  - [Google Fonts](https://fonts.google.com/) - Montserrat & Nunito typefaces

- **Backend & Services**:
  - [Firebase](https://firebase.google.com/) - Authentication & Database
    - Firebase Authentication (Email/Password)
    - Firebase Firestore (User data storage)

## 📁 Project Structure

```
baba-tilu-main/
├── index.html          # Landing page (public view)
├── shop.html           # Shop/inventory page
├── about.html          # About the creator
├── login.html          # User login page
├── register.html       # User registration page
├── admin.html          # Admin panel
├── assets/
│   ├── css/
│   │   ├── bootstrap.min.css     # Bootstrap framework
│   │   ├── materialdesignicons.min.css  # Material Design Icons
│   │   ├── animate.min.css       # Animation library
│   │   ├── shop.css              # Shop-specific styles
│   │   └── style.css             # Custom styles
│   ├── js/
│   │   ├── jquery.min.js         # jQuery library
│   │   └── typed.js              # Typed.js for text animations
│   ├── video/
│   │   └── blackt.mp4            # Background video
│   └── imgs of cloths/           # Product images
│       ├── Various clothing item images
│       └── LALA.png              # Banner advertisement
├── .hintrc                 # HTMLHint configuration
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- For Firebase functionality: A Firebase project with Authentication and Firestore enabled

### Installation

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd baba-tilu-main
   ```

2. **Firebase Setup**:
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com/)
   - Enable Authentication (Email/Password provider)
   - Enable Firestore Database
   - Get your Firebase configuration from Project Settings > General > Your apps
   - Update the `firebaseConfig` object in:
     - `register.html` (lines 60-68)
     - `login.html` (lines 62-70)
     - `shop.js` (lines 2-10)
     - `admin.html` (lines 142-150)

3. **Run the website**:
   - Simply open `index.html` in your web browser to view the landing page
   - Use `login.html` or `register.html` to access the authenticated sections

## 📱 Responsive Breakpoints

The website uses Bootstrap's responsive grid system with the following breakpoints:
- Extra small devices (<576px): Mobile phones
- Small devices (≥576px): Landscape phones
- Medium devices (≥768px): Tablets
- Large devices (≥992px): Laptops/Desktops
- Extra large devices (≥1200px): Large screens

## 👨‍💻 Creator

This project was created by **Sujal**, a video editor and content creator passionate about visual storytelling and helping brands grow through eye-catching edits.

## 📄 License

This project is for educational purposes. The footer indicates that content is copyright-protected and property of Lab Hennes & Mauritz AB (H&M Group).

## 🙏 Acknowledgments

- Bootstrap team for the excellent CSS framework
- Firebase team for the authentication and database services
- Matt Boldt for Typed.js
- Various open-source contributors for the libraries used

## ⚠️ Known Issues & Errors

- **Firebase Configuration Placeholder**: The Firebase config keys in `shop.js`, `login.html`, `register.html`, and `admin.html` are placeholders. You must replace them with your own Firebase project credentials to enable authentication and Firestore operations. Using the placeholder will result in authentication errors and failed data fetch.
- **Firestore Database Setup**: Ensure you have created a Firestore database and a collection named `products` with appropriate fields (name, category, mrp, price, size, description, imageUrls). Without this, the shop page will show an empty state.
- **Firestore Security Rules**: For testing, set Firestore rules to allow read/write access (or properly configure authentication rules). Overly restrictive rules will cause permission errors.
- **Missing Product Images**: The product images are not included in the repository. You need to upload images via the admin panel or add image URLs to Firestore documents.
- **Admin Panel**: The admin.html relies on Cloudinary for image uploads (requires Cloudinary account and upload preset). Configure Cloudinary accordingly.
- **Admin Pages**: Additional admin pages (admin-customers.html, admin-dashboard.html, admin-login.html, admin-orders.html, admin-products.html, admin-settings.html) are present but may require further development for full functionality.

---
*Built with ❤️ for fashion enthusiasts*