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

// ==========================================
// 2. STATE VARIABLES
// ==========================================
const cartItemsContainer = document.getElementById("cartItems");
let cart = [];
let currentUserUID = null;

// ==========================================
// 3. CHECK USER LOGIN & FETCH CART
// ==========================================
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        currentUserUID = user.uid;
        fetchCartData();
    } else {
        // Agar user login nahi hai toh login page par bhejo
        window.location.href = "login.html";
    }
});

// ==========================================
// 3. SECURE FETCH CART (Price main database se aayega)
// ==========================================
async function fetchCartData() {
    if (!currentUserUID) return;

    try {
        // 1. User ka cart fetch karo (jisme sirf productId aur size hai)
        const snapshot = await db.collection('users').doc(currentUserUID).collection('cart').get();
        
        // 2. Promise.all lagayenge taaki saare products ek saath jaldi load ho jayein
        const cartPromises = snapshot.docs.map(async (doc) => {
            let cartItem = doc.data(); 
            cartItem.cartItemId = doc.id;
            
            // 3. SECURE FETCH: Asli price, naam aur photo Products database se nikalo
            if (cartItem.productId) {
                const productDoc = await db.collection('products').doc(cartItem.productId).get();
                
                if (productDoc.exists) {
                    const productData = productDoc.data();
                    cartItem.name = productData.name;
                    cartItem.price = Number(productData.price); // Asli bhav
                    
                    // Image handle karna (kyunki aapke products me imageUrls ka array hai)
                    cartItem.image = (productData.imageUrls && productData.imageUrls.length > 0) 
                                        ? productData.imageUrls[0] 
                                        : productData.image; 
                } else {
                    cartItem.name = "Product Unavailable";
                    cartItem.price = 0;
                }
            }
            return cartItem;
        });

        // 4. Jab saare products ka data mil jaye, tab render karo
        cart = await Promise.all(cartPromises);
        renderCart();
        
    } catch (err) {
        console.error("Error securely fetching cart: ", err);
        cartItemsContainer.innerHTML = "<p style='text-align:center;'>Error loading cart items.</p>";
    }
}

// ==========================================
// 4. RENDER CART ON SCREEN
// ==========================================
function renderCart() {
    let total = 0;
    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<p style='text-align:center; padding:40px; font-weight:bold;'>Your cart is empty.</p>";
        updateTotal(0);
        return;
    }

    cart.forEach((item) => {
        total += (item.price || 0) * (item.quantity || 1);

        const div = document.createElement("div");
        div.className = "cart-item";
        
        // Data-index ki jagah data-id lagaya hai Firebase ke liye
        div.innerHTML = `
            <img src="${item.image || ''}" alt="${item.name}">
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-price">₹${item.price || 0}</div>
                <div class="item-size">Size: ${item.size || "N/A"}</div>
                
                <div class="quantity-box">
                    <button class="qty-btn decrease-btn" data-id="${item.cartItemId}">-</button>
                    <span class="qty-value">${item.quantity || 1}</span>
                    <button class="qty-btn increase-btn" data-id="${item.cartItemId}">+</button>
                </div>
            </div>
            <button class="remove-btn" data-id="${item.cartItemId}">Remove</button>
        `;
        cartItemsContainer.appendChild(div);
    });

    updateTotal(total);
}

function updateTotal(amount) {
    const cartTotal = document.getElementById("cartTotal");
    const grandTotal = document.getElementById("grandTotal");
    
    if (cartTotal) cartTotal.textContent = `₹${amount}`;
    if (grandTotal) grandTotal.textContent = `₹${amount}`;
}

// ==========================================
// 5. HANDLE CLICK EVENTS (REMOVE, +, -)
// ==========================================
cartItemsContainer.addEventListener("click", (e) => {
    
    // A. REMOVE ITEM
    const removeBtn = e.target.closest(".remove-btn");
    if (removeBtn) {
        const itemId = removeBtn.dataset.id;
        db.collection('users').doc(currentUserUID).collection('cart').doc(itemId).delete()
        .then(() => fetchCartData()); // UI refresh
        return;
    }

    // B. INCREASE QUANTITY (+)
    const increaseBtn = e.target.closest(".increase-btn");
    if (increaseBtn) {
        const itemId = increaseBtn.dataset.id;
        db.collection('users').doc(currentUserUID).collection('cart').doc(itemId).update({
            quantity: firebase.firestore.FieldValue.increment(1)
        }).then(() => fetchCartData());
        return;
    }

    // C. DECREASE QUANTITY (-)
    const decreaseBtn = e.target.closest(".decrease-btn");
    if (decreaseBtn) {
        const itemId = decreaseBtn.dataset.id;
        const currentItem = cart.find(c => c.cartItemId === itemId);
        
        if (currentItem && currentItem.quantity > 1) {
            db.collection('users').doc(currentUserUID).collection('cart').doc(itemId).update({
                quantity: firebase.firestore.FieldValue.increment(-1)
            }).then(() => fetchCartData());
        } else {
            // Agar quantity 1 hai aur minus dabaya, toh item delete ho jayega
            db.collection('users').doc(currentUserUID).collection('cart').doc(itemId).delete()
            .then(() => fetchCartData());
        }
    }
});