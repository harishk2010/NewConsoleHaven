




const addToWishlist = async (id) => {

    const proName = document.getElementById('name' + id).value
    document.getElementById('click' + id).innerHTML =
        `<a aria-label="Add To Wishlist"
    class="wish action-btn hover-up" href="#"><i class="fa-solid fa-heart"></i></a>`

    let response = await fetch(`/add_to_wishlist?id=${id}`, {
        headers: {
            "Content-Type": "application/json"
        },
    })

    let data = await response.json()
    console.log(data)
    if (data) {
        alertify.set('notifier', 'position', 'bottom-center');
        alertify.success(`${proName} Added to wishlist`)
        //.then(()=> window.location.reload())
    }
}


/// remove from wishlist  ////////////


const removeFromWishlist = async (id) => {
    const proName = document.getElementById('name' + id).value

    document.getElementById('click' + id).innerHTML =
        `<a aria-label="Add To Wishlist" class="wish action-btn hover-up" href="#"><i class="fi-rs-heart"></i></a>`

    let response = await fetch(`/remove_from_wishlist?id=${id}`, {
        headers: {
            "Content-Type": "application/json"
        },
    })

    let data = await response.json()
    console.log(data)
    if (data) {
        alertify.set('notifier', 'position', 'bottom-center');
        alertify.success(`${proName} Removed from wishlist`)
    }
}

    let currentPage = 1;
    let currentSort = '';
    let currentCategory = '';
    let searchQuery = '';
    let limit = 6;

    const fetchProducts = () => {
        $.ajax({
            url: '/search',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                searchQuery,
                sortOption: currentSort,
                categoryFilter: currentCategory,
                page: currentPage,
                limit,
            }),
            success: (data) => {
                console.log(data)


                updateProductList(data.products);
                updatePagination(data.totalProducts);
                updateProductCount(data.totalProducts);
            },
            error: (error) => {
                console.error('Error fetching products:', error);
            },
        });
    };

    const updateProductList = (products) => {
        const productList = $('#productList');
        productList.empty();

        if (products.length === 0) {
            productList.html('<h2 class="m-5">No product available</h2>');
            return;
        }

        //count.innerHTML=products.length
        //  totall-product.html('<h2 class="m-5">No product available</h2>');


        products.forEach((product) => {
            const productHtml = `
            <div class="col-lg-4 col-md-4 col-12 col-sm-6">
                <div class="product-cart-wrap mb-30">
                    <div class="product-img-action-wrap">
                        <div class="product-img product-img-zoom">
                            <a href="/productDetails/${product._id}">
                                <img class="default-img" src="/images/products/${product.image[0]}" alt="">
                                <img class="hover-img" src="/images/products/${product.image[1]}" alt="">
                            </a>
                        </div>
                        <div class="product-action-1">
                            <a aria-label="Quick view" class="action-btn hover-up"
                               href="/productDetails/${product._id}" data-bs-target="#quickViewModal">
                                <i class="fi-rs-search"></i></a>
                            <a data-id="${product._id}" aria-label="Add To Wishlist"
                                                    class="wish action-btn hover-up" href="#"><i
                                                        class="fi-rs-heart"></i></a>
                            
                        </div>
                        <div class="product-badges product-badges-position product-badges-mrg">
                            <span class="hot">Hot</span>
                        </div>
                    </div>
                    <div class="product-content-wrap">
                        <div class="product-category">
                            <a href="shop-grid-right.html">${product.category.category}</a>
                        </div>
                        <h2><a href="/productDetails/${product._id}">${product.name}</a>
                        </h2>
                        <div class="rating-result" title="90%">
                            <span><span>90%</span></span>
                        </div>
                        <div class="product-price">
                            <span>₹${product.price}</span>
                            <span class="old-price">₹245.8</span>
                        </div>
                        <div class="product-action-1 show">
                                            <span>
                                                <a data-id="${product._id}" aria-label="Add To Wishlist"
                                                    class="wish action-btn hover-up" href="#"><i
                                                        class="fi-rs-heart"></i></a>
                                            </span>
                                           
                                        </div>
                    </div>
                </div>
            </div>
        `;
            productList.append(productHtml);
        });
    };
    // count.innerHTML=totalProducts

$(document).ready(function () {
    const userId = ""; 

    $('#productList').on('click', '.wish.action-btn', function (event) {
        event.preventDefault();
        var $button = $(this);
        var id = $button.data('id');

        $.ajax({
            type: 'POST',
            url: '/addtowishlist',
            contentType: 'application/json',
            data: JSON.stringify({ id: id, userId: userId }),
            success: function (productDdata) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Product Successfully added to Wishlist!!!',
                    icon: 'success',
                    confirmButtonText: 'Cool'
                })//.then(() => window.location.reload());
            },
            error: function (xhr, status, error) {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to add product to Wishlist!!!',
                    icon: 'error',
                    confirmButtonText: 'Cool'
                });
                console.error(error);
            }
        });
    });
});

    const updatePagination = (totalProducts) => {
        const paginationList = $('#paginationList');
        paginationList.empty();
        const totalPages = Math.ceil(totalProducts / limit);

        for (let i = 1; i <= totalPages; i++) {
            const activeClass = i === currentPage ? 'active' : '';
            const pageItem = `<li class="page-item ${activeClass}">
            <a class="page-link" href="javascript:goToPage(${i});">${i}</a>
        </li>`;
            paginationList.append(pageItem);
        }
    };
    const updateProductCount = (totalProducts) => {
        $('#count').text(totalProducts);
    };
    const goToPage = (page) => {
        currentPage = page;
        fetchProducts();
    };

    const searchProducts = () => {
        searchQuery = $('#searchInput').val();
        //currentPage = 1;
        fetchProducts();
    };

    const sortLowToHigh = () => {
        currentSort = 'priceAsc';
       // currentPage = 1;
        fetchProducts();
    };

    const sortHighToLow = () => {
        currentSort = 'priceDesc';
       // currentPage = 1;
        fetchProducts();
    };

    const sortAZ = () => {
        currentSort = 'nameAsc';
       // currentPage = 1;
        fetchProducts();
    };

    const sortZA = () => {
        currentSort = 'nameDesc';
      //  currentPage = 1;
        fetchProducts();
    };

    const newArrivals = () => {
        currentSort = 'newArrivals';
        //currentPage = 1;
        fetchProducts();
    };

    const popularity = () => {
        currentSort = 'popularity';
        //currentPage = 1;
        fetchProducts();
    };

    const filterByCategory = (categoryId) => {
        currentCategory = categoryId;
       // currentPage = 1;
        fetchProducts();
    };
    const limits = (ct) => {
        limit = ct;
        currentPage = 1;

        fetchProducts();
    }
    const clearfilter = () => {
        currentPage = 1;
        currentSort = '';
        currentCategory = '';
        searchQuery = '';
        limit = 6;
        fetchProducts()
    }


    // $('#searchButton').on('change', searchProducts);

    fetchProducts();






