// Firebase configuration - REPLACE WITH YOUR OWN
const firebaseConfig = {
    apiKey: "AIzaSyAAeCnftvLiKJcj04iFuv6OWovtnv_r2TE",
    authDomain: "fir-lab-49901.firebaseapp.com",
    projectId: "fir-lab-49901",
    storageBucket: "fir-lab-49901.firebasestorage.app",
    messagingSenderId: "145493212453",
    appId: "1:145493212453:web:b93743eab8dde5c0beeecc",
    measurementId: "G-J4KWKT4Z5L"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  
  const productsGrid = document.getElementById('products-grid');
  const loadingState = document.getElementById('loading-state');
  const emptyState = document.getElementById('empty-state');
  
  const categoryFilter = document.getElementById('category-filter');
  const sizeFilter = document.getElementById('size-filter');
  const sortFilter = document.getElementById('sort-filter');
  
  const searchInput = document.getElementById('searchInput');
  const productCount = document.getElementById('productCount');
  const cartCount = document.getElementById('cartCount');
  
  // State
  let products = [];
  let filteredProducts = [];
  let cart = []; 
let currentUserUID = null; // Current user ko track karne ke liye

// Firebase Auth Listener: User login hai ya nahi check karega
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        currentUserUID = user.uid;
        
        // 1. Navbar me user ka Logo (Pehla Letter) dikhana
        const userAvatarLogo = document.getElementById("user-avatar-logo");
        if (userAvatarLogo) {
            const nameStr = user.displayName ? user.displayName : user.email;
            // Naam ya email ka sirf pehla akshar (letter) nikal kar bada (Capital) kar dega
            userAvatarLogo.innerText = nameStr.charAt(0).toUpperCase(); 
        }
        // 2. User ka personal cart Firebase se nikalna
        db.collection('users').doc(user.uid).collection('cart').get()
            .then((snapshot) => {
                cart = []; // Purana local cart clear karo
                snapshot.forEach(doc => {
                    cart.push({ cartItemId: doc.id, ...doc.data() });
                });
                updateCartCount(); // Badge update karo
            })
            .catch(err => console.error("Error fetching cart:", err));

    } else {
        // Agar user logged in nahi hai, toh local cart empty rakho
        currentUserUID = null;
        cart = [];
        updateCartCount();
        
        // Optional: User ko bina login shop na karne dena ho toh niche wali line uncomment karein
        // window.location.href = "login.html";
    }
});
  
  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
      fetchProducts();
      setupEventListeners();
      updateCartCount(); // Fix applied here: Calling the newly defined function
  });
  
  // Fetch products from Firestore
  async function fetchProducts() {
      try {
          loadingState.style.display = 'block';
          productsGrid.style.display = 'none';
          emptyState.style.display = 'none';
  
          const querySnapshot = await db.collection('products').get();
          products = [];
  
          querySnapshot.forEach((doc) => {
              const data = doc.data();
              products.push({
                  id: doc.id,
                  ...data
              });
          });
  
          if (products.length === 0) {
              showEmptyState();
          } else {
              applyFilters();
          }
      } catch (error) {
          console.error('Error fetching products:', error);
          showEmptyState();
      } finally {
          loadingState.style.display = 'none';
      }
  }
  
  // Apply filters and sorting
  function applyFilters() {
      if (products.length === 0) return;
  
      let filtered = [...products];
      const search = searchInput.value.toLowerCase().trim();
  
      if (search) {
          filtered = filtered.filter(product =>
              product.name.toLowerCase().includes(search)
          );
      }
  
      // Category filter
      const category = categoryFilter.value;
      if (category) {
          filtered = filtered.filter(product => product.category === category);
      }
  
      // Size filter
      const size = sizeFilter.value;
      if (size) {
          filtered = filtered.filter(product =>
              Array.isArray(product.size) ? product.size.includes(size) : product.size === size
          );
      }
  
      // Sort
      const sortBy = sortFilter.value;
      switch (sortBy) {
          case 'price-low':
              filtered.sort((a, b) => a.price - b.price);
              break;
          case 'price-high':
              filtered.sort((a, b) => b.price - a.price);
              break;
          case 'newest':
              break;
          case 'name':
              filtered.sort((a, b) => a.name.localeCompare(b.name));
              break;
          default:
              break;
      }
  
      filteredProducts = filtered;
      renderProducts();
  }
  
  // Render products to the grid
  function renderProducts() {
      if (filteredProducts.length === 0) {
          showEmptyState();
          return;
      }
      
      if(productCount) productCount.textContent = `${filteredProducts.length} Products`;
  
      productsGrid.innerHTML = '';
      filteredProducts.forEach(product => {
          const productCard = createProductCard(product);
          productsGrid.appendChild(productCard);
      });
  
      productsGrid.style.display = 'grid';
      emptyState.style.display = 'none';
  }
  
  // UPDATED: Create product card element to match new minimal UI
// UPDATED: Create product card element with PC Arrows
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = product.id;
    card.dataset.name = product.name;
    card.dataset.price = product.price;
    
    // Grab up to 4 images
    const images = product.imageUrls && product.imageUrls.length > 0 
        ? product.imageUrls.slice(0, 4) 
        : ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60'];
        
    card.dataset.image = images[0]; 

    const formattedPrice = Number(product.price).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    // Slider generation
    let sliderHtml = '<div class="image-slider" style="width: 100%; height: 100%;">';
    images.forEach(img => {
        sliderHtml += `<img src="${img}" alt="${product.name}" class="product-image" style="width: 100%; height: 100%; object-fit: cover; aspect-ratio: 3/4;">`;
    });
    sliderHtml += '</div>';

    // PC slider arrows with high z-index
    const arrowsHtml = images.length > 1 
        ? `
        <button class="slider-arrow prev-arrow" title="Previous Image" style="position: absolute; top: 50%; left: 8px; transform: translateY(-50%); z-index: 10;">❮</button>
        <button class="slider-arrow next-arrow" title="Next Image" style="position: absolute; top: 50%; right: 8px; transform: translateY(-50%); z-index: 10;">❯</button>
        ` 
        : '';

    card.innerHTML = `
        <div class="product-image-container" style="position: relative; overflow: hidden; aspect-ratio: 3/4;">
            ${sliderHtml}
            
            ${arrowsHtml}
            
            <button class="add-to-cart-overlay add-to-cart" title="Add to Cart" style="position: absolute; bottom: 10px; right: 10px; z-index: 10;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><line x1="12" y1="10" x2="12" y2="16"></line><line x1="9" y1="13" x2="15" y2="13"></line></svg>
            </button>
        </div>
        <div class="product-info" style="padding-top: 10px;">
            <a href="product.html?id=${product.id}" style="text-decoration:none; color:inherit; position: relative; z-index: 5;">
                <h3 class="product-name">${product.name}</h3>
            </a>
            <div class="product-pricing">
                <span class="product-price">Rs. ${formattedPrice}</span>
            </div>
        </div>
    `;

    return card;
}
  
  function showToast(message) {
      const toast = document.getElementById("toast");
      if(toast) {
          toast.textContent = message;
          toast.classList.add("show");
          setTimeout(() => {
              toast.classList.remove("show");
          }, 2000);
      }
  }
  
  // FIX APPLIED: Defined updateCartCount function
  function updateCartCount() {
      if(cartCount) {
          cartCount.textContent = cart.length;
      }
  }
  
  // Show empty state
  function showEmptyState() {
      productsGrid.style.display = 'none';
      emptyState.style.display = 'block';
  }
  
  // Event listeners
  // Event listeners setup
// Event listeners setup
function setupEventListeners() {
    categoryFilter.addEventListener('change', applyFilters);
    sizeFilter.addEventListener('change', applyFilters);
    sortFilter.addEventListener('change', applyFilters);
    searchInput.addEventListener('input', applyFilters);
    // Mobile menu toggle logic
    const menuBtn = document.querySelector('.menu-icon');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileDrawer = document.getElementById('mobile-menu-drawer');
    const mobileOverlay = document.getElementById('mobile-menu-overlay');

    function toggleMenu() {
        if (mobileDrawer && mobileOverlay) {
            mobileDrawer.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
        }
    }

    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);
    if (mobileOverlay) mobileOverlay.addEventListener('click', toggleMenu); // Bahar click karne pe close hoga

    // Menu link click karne par menu apne aap band ho jaye
    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', toggleMenu);
    });

    // Products grid click handler (Arrows, Cart, aur Product Page Redirect sab yahan handle hoga)
    productsGrid.addEventListener('click', (e) => {

        // --- 1. PC Slider Arrows Logic ---
        if (e.target.closest('.next-arrow')) {
            e.preventDefault();
            e.stopPropagation();
            const container = e.target.closest('.product-image-container').querySelector('.image-slider');
            container.scrollBy({ left: container.offsetWidth, behavior: 'smooth' });
            return;
        }

        if (e.target.closest('.prev-arrow')) {
            e.preventDefault();
            e.stopPropagation();
            const container = e.target.closest('.product-image-container').querySelector('.image-slider');
            container.scrollBy({ left: -container.offsetWidth, behavior: 'smooth' });
            return;
        }

        // --- 2. Add to Cart Button Check (Agar cart icon par click ho toh redirect mat karo) ---
        if (e.target.closest('.add-to-cart, .add-to-cart-overlay')) {
            return; // Yeh modal logic ko chalne dega
        }

        // --- 3. Product Page Redirect Logic (Image/Name par click karne par) ---
        const card = e.target.closest('.product-card');
        if (card) {
            const productId = card.dataset.id;
            if (productId) {
                window.location.href = `product.html?id=${productId}`;
            }
        }
    });
}

// QUICK ADD MODAL LOGIC
// =====================================

let currentModalProduct = null;
let selectedSize = null;

const modalOverlay = document.getElementById('quick-add-modal');
const closeModalBtn = document.getElementById('close-modal');
const confirmAddBtn = document.getElementById('modal-add-to-cart');
const sizeOptionsContainer = document.getElementById('modal-sizes');

// 1. Grid Click Listener (Ye modal open karega)
document.getElementById('products-grid').addEventListener('click', (e) => {
    // Arrows already handled in setupEventListeners — ignore here
    if (e.target.closest('.prev-arrow') || e.target.closest('.next-arrow')) return;

    // Check agar click 'add to cart' icon par hua hai
    const addToCartIcon = e.target.closest('.add-to-cart, .add-to-cart-overlay');
    
    if (addToCartIcon) {
        e.preventDefault();
        const card = addToCartIcon.closest('.product-card');
        
        // Product data nikalna
        currentModalProduct = {
            id: card.dataset.id,
            name: card.dataset.name,
            price: Number(card.dataset.price),
            image: card.dataset.image || card.querySelector('img').src
        };
        
        selectedSize = null; // Size reset karein
        
        // UI Update karein
        document.getElementById('modal-img').src = currentModalProduct.image;
        document.getElementById('modal-title').textContent = currentModalProduct.name;
        document.getElementById('modal-price').textContent = `Rs. ${currentModalProduct.price.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;

        // Sizes Generate karein
        const sizes = ['S', 'M', 'L', 'XL'];
        sizeOptionsContainer.innerHTML = '';
        sizes.forEach(size => {
            const btn = document.createElement('button');
            btn.className = 'size-btn';
            btn.textContent = size;
            btn.onclick = () => {
                document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedSize = size;
            };
            sizeOptionsContainer.appendChild(btn);
        });

        // Modal dikhayein
        modalOverlay.classList.add('active');
    }
});

// 2. Modal Close Logic
function closeModal() {
    modalOverlay.classList.remove('active');
}
if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if(modalOverlay) modalOverlay.addEventListener('click', (e) => {
    if(e.target === modalOverlay) closeModal(); // Background pe click karne se close
});

// 3. Final Add to Cart Button Logic (Modal ke andar)
// 3. Final Add to Cart Button Logic (Modal ke andar)
if(confirmAddBtn) {
    confirmAddBtn.addEventListener('click', () => {
        if (!selectedSize) {
            if(typeof showToast === 'function') showToast("Please select a size first");
            else alert("Please select a size first!");
            return;
        }

        // Security check: Bina login add to cart mana karo
        if (!currentUserUID) {
            if(typeof showToast === 'function') showToast("Please login to add items to cart!");
            setTimeout(() => window.location.href = "login.html", 1500);
            return;
        }

        // Unique ID banayein (Product ID + Size)
        const cartItemId = `${currentModalProduct.id}-${selectedSize}`;
        
        // Item data prepare karein
        const cartItemData = {
    productId: currentModalProduct.id,
    size: selectedSize,
    quantity: firebase.firestore.FieldValue.increment(1)
};

        // LocalStorage ki jagah Firebase Database me save karein
        db.collection('users').doc(currentUserUID).collection('cart').doc(cartItemId)
            .set(cartItemData, { merge: true })
            .then(() => {
                // UI update karne ke liye local array update karein
                const existingProduct = cart.find(item => item.cartItemId === cartItemId);
                if (existingProduct) {
                    existingProduct.quantity += 1;
                } else {
                    cartItemData.quantity = 1; // UI ke liye temporarily 1 set karein
                    cart.push({ cartItemId: cartItemId, ...cartItemData });
                }
                
                if(typeof updateCartCount === 'function') updateCartCount();
                if(typeof showToast === 'function') showToast(`${currentModalProduct.name} (${selectedSize}) saved to your account!`);
                
                closeModal();
            })
            .catch((error) => {
                console.error("Error adding to cart: ", error);
                if(typeof showToast === 'function') showToast("Error saving to cart!");
            });
    });
}

        // Unique ID banayein (Product ID + Size) taaki sizes mix na ho
        const cartItemId = `${currentModalProduct.id}-${selectedSize}`;
        const existingProduct = cart.find(item => item.cartItemId === cartItemId);

        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push({
                cartItemId: cartItemId,
                id: currentModalProduct.id,
                name: currentModalProduct.name,
                price: currentModalProduct.price,
                image: currentModalProduct.image,
                size: selectedSize,
                quantity: 1
            });
        }

        // Cart LocalStorage me save karein aur UI update karein
        localStorage.setItem("cart", JSON.stringify(cart));
        
        if(typeof updateCartCount === 'function') updateCartCount();
        if(typeof showToast === 'function') showToast(`${currentModalProduct.name} (Size: ${selectedSize}) added to cart`);
        
        closeModal();
    ;

// ==========================================
// REDIRECT TO PRODUCT PAGE (Clicking on Product)
// ==========================================
document.addEventListener('click', function(e) {
    // Check karo ki jahan click hua hai, kya wo product-card ke andar hai?
    const card = e.target.closest('.product-card');
    
    // Agar product card par click nahi hua, toh aage badho
    if (!card) return; 

    // Check karo ki kahin user ne "Add to Cart" ya "Slider Arrow" par toh click nahi kiya?
    const isCartBtn = e.target.closest('.add-to-cart, .add-to-cart-overlay');
    const isArrow = e.target.closest('.slider-arrow, .prev-arrow, .next-arrow');

    // Agar cart ya arrow par click nahi hua hai, iska matlab image/naam par click hua hai
    if (!isCartBtn && !isArrow) {
        e.preventDefault();
        
        // Product ki ID nikalo aur naye page par bhej do
        const productId = card.dataset.id;
        if (productId) {
            window.location.href = `product.html?id=${productId}`;
        }
    }
});

// ==========================================
// FIX: DIRECT ADD TO CART & MODAL CLICK LOGIC
// ==========================================
// document.addEventListener('click', function(e) {
//     // 1. Grid me add to cart icon par click karne se Modal open hoga
//     const cartIcon = e.target.closest('.add-to-cart-overlay, .add-to-cart');
//     if (cartIcon) {
//         e.preventDefault();
//         const card = cartIcon.closest('.product-card');
//         if(card) openModal(card);
//     }

//     // 2. Modal ke andar 'Add to cart' button par click karne se cart me add hoga
//     const confirmBtn = e.target.closest('#confirm-add-to-cart, #modal-add-to-cart, .btn-full-width');
//     if (confirmBtn) {
//         if (!selectedSize) {
//             showToast("Please select a size first!");
//             return;
//         }
        
//         const cartItemId = `${currentModalProduct.id}-${selectedSize}`;
//         const existingProduct = cart.find(item => item.cartItemId === cartItemId);
        
//         if (existingProduct) {
//             existingProduct.quantity += 1;
//         } else {
//             cart.push({
//                 cartItemId: cartItemId,
//                 id: currentModalProduct.id,
//                 name: currentModalProduct.name,
//                 price: currentModalProduct.price,
//                 image: currentModalProduct.image,
//                 size: selectedSize, 
//                 quantity: 1
//             });
//         }
        
//         localStorage.setItem("cart", JSON.stringify(cart));
//         updateCartCount();
        
//         // Modal close aur Toast
//         const modalOverlay = document.getElementById('quick-add-modal');
//         if(modalOverlay) modalOverlay.classList.remove('active');
//         showToast(`${currentModalProduct.name} (${selectedSize}) added to cart`);
//     }
// });