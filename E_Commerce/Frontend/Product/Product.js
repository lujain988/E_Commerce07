const itemsPerPage = 6;
let currentPage = 1;
let allProducts = [];
let filteredProducts = [];
let selectedCategory = "All"; 
let minPrice = 0;
let maxPrice = Infinity;

// Load CategoryId from localStorage
const CategoryId = localStorage.getItem("CategoryId");

// Function to fetch all products
async function GetAllProduct(category = "All") {
  let url = `https://localhost:7222/api/Product/${category}`; // Make sure the API endpoint handles the category parameter properly
  try {
    let request = await fetch(url);
    if (!request.ok) {
      throw new Error(`HTTP error! Status: ${request.status}`);
    }
    allProducts = await request.json();

    // Initialize filteredProducts
    filteredProducts = [...allProducts];

    // Apply initial category and price filter
    applyFilters();
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

// Function to render the current page of products
function renderPage(page) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageProducts = filteredProducts.slice(startIndex, endIndex);

  let cards = document.getElementById("conteainer");
  cards.innerHTML = "";

  pageProducts.forEach((product) => {
    let imageUrl = `${product.image}`;
    let cardHTML = `
      <div class="col-lg-4 col-md-6 text-center">
        <div class="single-product-item">
          <div class="product-image">
            <a onclick="saveToLocalStorage(${product.id})"><img src="${imageUrl}" alt=""></a>
          </div>
          <h3>${product.productName}</h3>
          <p class="product-price">${product.price}$</p>
          <div class="product-rating" id="rating-${product.id}">
            <!-- Rating will be inserted here -->
          </div>
          <a href="cart.html" class="cart-btn"><i class="fas fa-shopping-cart"></i> Add to Cart</a>
          <br>
          <a href="#" onclick="saveToLocalStorage(${product.id})" class="see-more-btn" style="color: #ff8c00;">
            <i class="fas fa-chevron-right"></i> See More
          </a>
        </div>
      </div>
    `;
    cards.innerHTML += cardHTML;

    fetchAverageRating(product.id);
  });

  updatePaginationControls();
}

// Function to update pagination controls
function updatePaginationControls() {
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  let pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  let paginationHTML = `
    <ul>
      <li ${currentPage === 1 ? 'class="disabled"' : ""}><a href="#" onclick="changePage(${currentPage - 1})">Prev</a></li>
  `;

  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `
      <li ${i === currentPage ? 'class="active"' : ""}><a href="#" onclick="changePage(${i})">${i}</a></li>
    `;
  }

  paginationHTML += `
      <li ${currentPage === totalPages ? 'class="disabled"' : ""}><a href="#" onclick="changePage(${currentPage + 1})">Next</a></li>
    </ul>
  `;

  pagination.innerHTML = paginationHTML;
}

// Function to handle page change
function changePage(page) {
  if (page < 1 || page > Math.ceil(filteredProducts.length / itemsPerPage)) return;
  currentPage = page;
  renderPage(currentPage);
}

// Function to handle category click
function handleCategoryClick(category) {
  selectedCategory = category;
  applyFilters();

  let listItems = document.querySelectorAll("#Addfilter li");
  listItems.forEach((item) => item.classList.remove("active"));

  let activeItem = document.querySelector(`[data-filter="${category}"]`);
  if (activeItem) {
    activeItem.classList.add("active");
  }
}

// Function to apply filters
async function applyFilters() {
  console.log("Applying filters:", selectedCategory, minPrice, maxPrice);

  let url = `https://localhost:7222/filterOnCategory?category=${encodeURIComponent(selectedCategory)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    filteredProducts = await response.json();
  } catch (error) {
    console.error("Error fetching filtered products by category:", error);
  }

  // Apply price filter
  filteredProducts = filteredProducts.filter(
    (product) => product.price >= minPrice && product.price <= maxPrice
  );

  currentPage = 1; // Reset to the first page
  renderPage(currentPage);
}



// Function to fetch average rating
async function fetchAverageRating(productId) {
  let url = `https://localhost:7222/api/Product/average-rating/${productId}`;
  try {
    let response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    let data = await response.json();

    let averageRating = data && data.averageRating != null ? data.averageRating : 5;
    let ratingContainer = document.getElementById(`rating-${productId}`);
    ratingContainer.innerHTML = `<i class="fas fa-star"> Rating: ${averageRating}</i>`;
  } catch (error) {
    console.error("Error fetching average rating:", error);
  }
}



// Function to get categories
async function getCategories() {
  const url = `https://localhost:7222/getCategories`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();

    let list = document.getElementById("Addfilter");
    list.innerHTML = "";

    list.innerHTML += `<li class="active" data-filter="All" onclick="handleCategoryClick('All')">All</li>`;

    data.forEach((item) => {
      list.innerHTML += `<li data-filter="${item.categoryName}" onclick="handleCategoryClick('${item.categoryName}')">${item.categoryName}</li>`;
    });

    console.log(data);
  
}

// Function to handle filter button click
function handleFilterButtonClick() {
  minPrice = parseFloat(document.getElementById("minPrice").value) || 0;
  maxPrice = parseFloat(document.getElementById("maxPrice").value) || Infinity;

  console.log("Filter button clicked:", minPrice, maxPrice);

  applyFilters();
}

// Add event listener to filter button
document
  .getElementById("filterButton")
  .addEventListener("click", handleFilterButtonClick);

// Function to save product ID to localStorage
function saveToLocalStorage(id) {
  localStorage.setItem("products", id);
  window.location.href = "ProductDetailes.html";
}

// Initial calls to setup the page
document.addEventListener('DOMContentLoaded', () => {
  getCategories(); // Fetch categories and set up the filters
  GetAllProduct(); // Fetch all products with default category
});
