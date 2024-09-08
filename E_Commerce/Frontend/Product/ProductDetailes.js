async function getAllProduct() {
  const productId = localStorage.getItem("products");
  const url = `https://localhost:7222/api/Product/${productId}`;

  try {
    let request = await fetch(url);
    let data = await request.json();
    let cards = document.getElementById("productCard");

    let priceHTML = "";
    if (data.discount && data.discount > 0) {
      let discountedPrice = data.price - data.price * (data.discount / 100);
      priceHTML = `
           <p class="product-price" style="color: red; ">
    <span style="text-decoration: line-through; font-size: 1.5rem">${
      data.price
    }$</span> 
    <span style="font-size: 1.3rem; color: black !important;">${discountedPrice.toFixed(
      2
    )}$ </span>
    <span style="font-size: 1.3rem;"  class="discount-badge" > ${
      data.discount
    }% off</span>
</p>

            `;
    } else {
      priceHTML = `<p class="product-price">${data.price}$</p>`;
    }

    cards.innerHTML = `
            <div class="col-md-5">
                <div class="single-product-img">
                    <img src="${data.image}" alt="${data.productName}">
                </div>
            </div>
            <div class="col-md-7">
                <div class="single-product-content">
                    <h3>${data.productName}</h3>
                    ${priceHTML} <!-- Display discount or regular price here -->
                    <p>${data.description}</p>
                    <div class="product-rating" id="rating-${data.id}">
                        <!-- Rating will be inserted here -->
                    </div>
                    <div class="single-product-form">
                        <form>
                            <input type="number" id="quantity" value="1">
                        </form>
                        <a href="cart.html" class="cart-btn"><i class="fas fa-shopping-cart"></i> Add to Cart</a>
                        <p><strong>Category: ${data.categoryName}</strong></p>
                    </div>
                    <h4>Share:</h4>
                    <ul class="product-share">
                        <li><a href="#" onclick="shareToFacebook(${data.id})"><i class="fab fa-facebook-f"></i></a></li>
                        <!-- Add other share buttons if needed -->
                    </ul>
                    <a href="Product.html" class="back-to-shopping" style="color: #ff8c00;"><i class="fas fa-arrow-left"></i> Back to Shopping</a>
                </div>
            </div>
        `;

    fetchAverageRating(data.id);
  } catch (error) {
    console.error("Error fetching product data:", error);
  }
}

async function fetchComments(productId) {
  let url = `https://localhost:7222/Reviews/${productId}`;

  try {
    let response = await fetch(url);
    if (!response.ok)
      throw new Error(`Failed to fetch comments: ${response.statusText}`);

    let comments = await response.json();

    // Ensure commentsSection exists
    let commentsSection = document.getElementById("commentsSection");
    if (!commentsSection) {
      console.error("Comments section element not found");
      return;
    }

    // Clear existing content
    commentsSection.innerHTML = "";

    // Create HTML content
    comments.forEach((comment) => {
      let cardHTML = `
          <div class="media-block">
    <div class="media-body">
        <div class="mar-btm">
<a href="#" class="user-link">${comment.user}</a>
        </div>
        <p>${comment.comment}</p>
        <div class="pad-ver">
          
        </div>
        <hr>
    </div>
</div>

            `;
      commentsSection.innerHTML += cardHTML;
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
  }
}

fetchComments();

// Call fetchComments when the page loads
document.addEventListener("DOMContentLoaded", function () {
  const productId = localStorage.getItem("products");
  if (productId) {
    fetchComments(productId);
  }
});

function shareToFacebook(productId) {
  const url = `https://localhost:7222/api/Product/${productId}`;
  const facebookShareURL = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    url
  )}`;
  window.open(
    facebookShareURL,
    "facebook-share-dialog",
    "width=800,height=600"
  );
}

async function fetchAverageRating(productId) {
  let url = `https://localhost:7222/api/Product/average-rating/${productId}`;
  let response = await fetch(url);
  let data = await response.json();

  let averageRating =
    data && data.averageRating != null ? data.averageRating : 5;
  let ratingContainer = document.getElementById(`rating-${productId}`);
  ratingContainer.innerHTML = `<i class="fas fa-star"> Rating: ${averageRating.toFixed(
    2
  )}</i>`;
}

const ratingInputs = document.getElementsByName("rate");

ratingInputs.forEach((star) => {
  star.addEventListener("click", async function () {
    const rating = this.value;
    const userId = 6; // Example user ID
    // const userId = localStorage.getItem('userId'); // this for logged in user
    const productId = localStorage.getItem("products");

    // Prepare the data to be sent for rating
    const ratingData = {
      productId: productId,
      userId: userId,
      rating: rating,
    };

    try {
      const response = await fetch("https://localhost:7222/SubmitReview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ratingData),
      });

      // Check the response status
      if (response.ok) {
        const responseData = await response.json();
        console.log("Rating submitted successfully", responseData);
        alert("Your rating has been submitted!");
      } else {
        console.error("Failed to submit rating", response.statusText);
        alert("You have already rated this product");
      }
    } catch (error) {
      console.error("Error submitting rating", error);
    }
  });
});

document
  .getElementById("submitComment")
  .addEventListener("click", async function () {
    const commentInput = document.getElementById("comment");
    const comment = commentInput.value;

    const userId = 1;
    // const userId = localStorage.getItem('UserId'); // this for logged in user
    const productId = localStorage.getItem("products");

    const commentData = {
      productId: productId,
      userId: userId,
      comment: comment,
    };

    try {
      const response = await fetch("https://localhost:7222/api/Product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentData),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("Comment submitted successfully", responseData);

        commentInput.value = "";
        alert("Your comment has been shared!");
      } else {
        console.error("Failed to submit comment", response.statusText);
      }
    } catch (error) {
      console.error("Error submitting comment", error);
    }
  });

getAllProduct();
