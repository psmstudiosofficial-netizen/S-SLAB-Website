// ============================================================
// 1. FIREBASE CONFIGURATION (Apni keys match kar lena)
// ============================================================
const firebaseConfig = {
    apiKey: "AIzaSyAAeCnftvLiKJcj04iFuv6OWovtnv_r2TE",
    authDomain: "fir-lab-49901.firebaseapp.com",
    projectId: "fir-lab-49901",
    storageBucket: "fir-lab-49901.firebasestorage.app",
    messagingSenderId: "145493212453",
    appId: "1:145493212453:web:b93743eab8dde5c0beeecc",
    measurementId: "G-J4KWKT4Z5L"
};
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// ============================================================
// 2. STATE VARIABLES
// ============================================================
let currentProduct = null;
let selectedSize = null;
let cart = []; 
let currentUserUID = null; // User ko pehchanne ke liye

// ============================================================
// 3. PAGE INITIALIZATION & AUTH CHECK
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    
    // Check if user is logged in
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            currentUserUID = user.uid;
            // Fetch user's cart from Firebase
            db.collection('users').doc(user.uid).collection('cart').get()
                .then(snapshot => {
                    cart = [];
                    snapshot.forEach(doc => cart.push({ cartItemId: doc.id, ...doc.data() }));
                    updateCartBadge();
                });
        } else {
            currentUserUID = null;
            cart = [];
            updateCartBadge();
        }
    });

    // URL se product ki ID nikalna
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        fetchProductData(productId);
    } else {
        alert("Product not found! Redirecting to shop...");
        window.location.href = 'shop.html';
    }

    // Sticky Bottom Cart Bar Scroll Logic
    window.addEventListener('scroll', () => {
        const stickyBar = document.getElementById('stickyBar');
        const mainAddBtn = document.getElementById('mainAddToCart');
        if (mainAddBtn && stickyBar) {
            if (mainAddBtn.getBoundingClientRect().bottom < 0) {
                stickyBar.classList.add('visible');
            } else {
                stickyBar.classList.remove('visible');
            }
        }
    });
});

// ============================================================
// 4. FETCH PRODUCT DATA
// ============================================================
async function fetchProductData(id) {
    try {
        const doc = await db.collection('products').doc(id).get();
        if (doc.exists) {
            currentProduct = { id: doc.id, ...doc.data() };
            renderProductPage();
            fetchRelatedProducts(); // Niche similar products dikhane ke liye
        } else {
            alert("Product no longer available.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// ============================================================
/// ============================================================
// 5. RENDER PRODUCT DETAILS ON SCREEN
// ============================================================
function renderProductPage() {
    // A. Titles and Prices
    document.getElementById('breadProduct').textContent = currentProduct.name;
    document.getElementById('productTitle').textContent = currentProduct.name;
    document.getElementById('stickyName').textContent = currentProduct.name;

    const price = Number(currentProduct.price) || 0;
    const mrp = Number(currentProduct.mrp) || 0;
    
    document.getElementById('productPrice').textContent = `Rs. ${price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    document.getElementById('stickyPrice').textContent = `Rs. ${price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    if (mrp > price) {
        document.getElementById('productMrp').textContent = `Rs. ${mrp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        document.getElementById('productMrp').classList.add('visible');
        document.getElementById('discountBadge').textContent = `${Math.round(((mrp - price) / mrp) * 100)}% OFF`;
        document.getElementById('discountBadge').classList.add('visible');
    }

    // B. Images Slider
    const galleryTrack = document.getElementById('galleryTrack');
    const images = (currentProduct.imageUrls && currentProduct.imageUrls.length > 0) ? currentProduct.imageUrls : ['https://via.placeholder.com/600x800'];
    
    galleryTrack.innerHTML = '';
    images.forEach(url => {
        galleryTrack.innerHTML += `<div class="gallery-slide"><img src="${url}" alt="${currentProduct.name}" style="width: 100%; object-fit: cover;"></div>`;
    });
    
    // Yahan hum arrows ko CSS se control karenge
    const prevArrow = document.querySelector('.prev-arrow');
    const nextArrow = document.querySelector('.next-arrow');
    
    // Agar image 1 se zyada hain tabhi block dikhao, warna none
    if(prevArrow && nextArrow) {
        if(images.length > 1) {
            prevArrow.style.display = 'flex';
            nextArrow.style.display = 'flex';
        } else {
            prevArrow.style.display = 'none';
            nextArrow.style.display = 'none';
        }
    }

    document.getElementById('stickyThumb').src = images[0];
    document.getElementById('totalSlides').textContent = images.length;
    
    galleryTrack.addEventListener('scroll', () => {
        const slideWidth = galleryTrack.clientWidth;
        document.getElementById('currentSlide').textContent = Math.round(galleryTrack.scrollLeft / slideWidth) + 1;
    });

    // C. Sizes Setup (String ho ya Array dono handle karega)
    let availableSizes = ["S", "M", "L", "XL"];
    if (currentProduct.size) {
        if (Array.isArray(currentProduct.size)) availableSizes = currentProduct.size;
        else if (typeof currentProduct.size === 'string') availableSizes = currentProduct.size.split(',').map(s => s.trim());
    }

    const sizePillsContainer = document.getElementById('sizePills');
    sizePillsContainer.innerHTML = '';
    availableSizes.forEach(size => {
        sizePillsContainer.innerHTML += `<button class="size-pill">${size}</button>`;
    });
}

// ============================================================
// 6. FETCH SIMILAR PRODUCTS (Complete the Look)
// ============================================================
async function fetchRelatedProducts() {
    try {
        const snapshot = await db.collection('products').limit(5).get();
        const grid = document.getElementById('relatedProductsGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        let count = 0;
        
        snapshot.forEach(doc => {
            if (doc.id === currentProduct.id || count >= 4) return;
            count++;
            const data = doc.data();
            const img = data.imageUrls ? data.imageUrls[0] : 'https://via.placeholder.com/400';
            const price = Number(data.price) || 0;
            
            grid.innerHTML += `
                <a href="product.html?id=${doc.id}" class="related-card">
                    <img src="${img}" alt="${data.name}" class="related-img">
                    <p class="related-name">${data.name}</p>
                    <p class="related-price">Rs. ${price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </a>
            `;
        });
    } catch(error) {
        console.error("Error fetching related products:", error);
    }
}

// ============================================================
// 7. ALL CLICK EVENTS (Delegation Method)
// ============================================================
document.addEventListener('click', function(e) {
    
    // A. Desktop Image Slider Arrows
    const isArrow = e.target.closest('.slider-arrow');
    if (isArrow) {
        const galleryTrack = document.getElementById('galleryTrack');
        const slideWidth = galleryTrack.clientWidth;
        if (isArrow.classList.contains('prev-arrow')) {
            galleryTrack.scrollBy({ left: -slideWidth, behavior: 'smooth' });
        } else {
            galleryTrack.scrollBy({ left: slideWidth, behavior: 'smooth' });
        }
    }

    // B. Accordion Open/Close
    const accTrigger = e.target.closest('.accordion-trigger');
    if (accTrigger) {
        const isExpanded = accTrigger.getAttribute('aria-expanded') === 'true';
        accTrigger.setAttribute('aria-expanded', !isExpanded);
        document.getElementById(accTrigger.getAttribute('data-target') + '-body').classList.toggle('open');
    }

    // C. Select Size
    const sizePill = e.target.closest('.size-pill');
    if (sizePill) {
        document.querySelectorAll('.size-pill').forEach(b => b.classList.remove('selected'));
        sizePill.classList.add('selected');
        selectedSize = sizePill.textContent;
        document.getElementById('stickySize').textContent = `Size: ${selectedSize}`;
        document.getElementById('sizeError').classList.remove('visible');
    }

    // D. Add To Cart Button
    const atcBtn = e.target.closest('#mainAddToCart, #stickyAddBtn');
    if (atcBtn) {
        if (!selectedSize) {
            document.getElementById('sizeError').classList.add('visible');
            document.querySelector('.size-section').scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        // Agar user login nahi hai, toh login page par bhejo
        if (!currentUserUID) {
            if(typeof showToast === 'function') showToast("Please login to add items to cart!");
            setTimeout(() => window.location.href = "login.html", 1500);
            return;
        }

        const cartItemId = `${currentProduct.id}-${selectedSize}`;
        const cartItemData = {
            id: currentProduct.id,
            name: currentProduct.name,
            price: Number(currentProduct.price),
            image: currentProduct.imageUrls?.[0] || '',
            size: selectedSize,
            quantity: firebase.firestore.FieldValue.increment(1)
        };

        // Firebase me save karein
        db.collection('users').doc(currentUserUID).collection('cart').doc(cartItemId)
            .set(cartItemData, { merge: true })
            .then(() => {
                const existingItem = cart.find(item => item.cartItemId === cartItemId);
                if (existingItem) existingItem.quantity += 1;
                else {
                    cartItemData.quantity = 1;
                    cart.push({ cartItemId: cartItemId, ...cartItemData });
                }
                
                updateCartBadge();
                if(typeof showToast === 'function') showToast(`${currentProduct.name} (${selectedSize}) added!`);
            })
            .catch(error => console.error("Error adding to cart:", error));
    }

    // E. Buy Now Button
    const buyNowBtn = e.target.closest('#buyNowBtn');
    if (buyNowBtn) {
        if (!selectedSize) {
            document.getElementById('sizeError').classList.add('visible');
            document.querySelector('.size-section').scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        if (!currentUserUID) {
            if(typeof showToast === 'function') showToast("Please login to buy items!");
            setTimeout(() => window.location.href = "login.html", 1500);
            return;
        }

        const cartItemId = `${currentProduct.id}-${selectedSize}`;
        const cartItemData = {
            id: currentProduct.id,
            name: currentProduct.name,
            price: Number(currentProduct.price),
            image: currentProduct.imageUrls?.[0] || '',
            size: selectedSize,
            quantity: firebase.firestore.FieldValue.increment(1)
        };

        // Button ka text temporary change kar do loading feel ke liye
        buyNowBtn.innerHTML = "Processing...";

        // 3. Save to Firebase and Redirect to Checkout immediately
        db.collection('users').doc(currentUserUID).collection('cart').doc(cartItemId)
            .set(cartItemData, { merge: true })
            .then(() => {
                window.location.href = "checkout.html";
            })
            .catch(error => {
                console.error("Error with Buy Now:", error);
                buyNowBtn.innerHTML = "Buy Now"; // Reset on error
                if(typeof showToast === 'function') showToast("Error processing request.");
            });
    }
}); // <-- THIS CLOSING BRACKET IS CRITICAL
// ============================================================
// 8. UTILITY FUNCTIONS (Badge & Toast)
// ============================================================
function updateCartBadge() {
    const badge = document.getElementById('cartCount');
    if (badge) {
        let total = 0; cart.forEach(item => total += item.quantity);
        badge.textContent = total;
    }
}

let toastTimeout;
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message; 
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
}
