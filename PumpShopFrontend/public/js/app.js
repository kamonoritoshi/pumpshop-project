var app = angular.module("pumpApp", ["ngRoute"]);

// ---- Notification Service ----
app.factory("NotificationService", function () {
  return {
    show: function (message, type = 'success') {
      const toastContainer = document.getElementById('toast-container');
      if (!toastContainer) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '1055';
        document.body.appendChild(container);
      }
      const toastElement = document.createElement('div');
      toastElement.className = `toast align-items-center text-bg-${type} border-0`;
      toastElement.setAttribute('role', 'alert');
      toastElement.setAttribute('aria-live', 'assertive');
      toastElement.setAttribute('aria-atomic', 'true');
      toastElement.innerHTML = `
              <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
              </div>`;
      document.getElementById('toast-container').appendChild(toastElement);
      const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
      toast.show();
      toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
    }
  };
});

// ---- AuthService ----
app.factory("AuthService", function ($window) {
  var TOKEN_KEY = 'pumpshop_token';
  var USER_KEY = 'pumpshop_user';
  return {
    saveSession: function (data) {
      $window.localStorage.setItem(TOKEN_KEY, data.token);
      $window.localStorage.setItem(USER_KEY, JSON.stringify({
        username: data.username,
        fullName: data.fullName,
        roles: data.roles
      }));
    },
    getToken: function () { 
      var t = $window.localStorage.getItem(TOKEN_KEY);
      return (t && t !== "undefined" && t !== "null") ? t : null;
    },
    getUser: function () {
      var u = $window.localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    },
    isLoggedIn: function () { return !!$window.localStorage.getItem(TOKEN_KEY); },
    logout: function () {
      $window.localStorage.removeItem(TOKEN_KEY);
      $window.localStorage.removeItem(USER_KEY);
    }
  };
});

// ---- JWT Interceptor ----
app.factory('AuthInterceptor', function (AuthService, $location, NotificationService, $q) {
  return {
    request: function (config) {
      var token = AuthService.getToken();
      if (token) {
        config.headers['Authorization'] = 'Bearer ' + token;
      }
      return config;
    },
    responseError: function (rejection) {
      if (rejection.status === 401 || rejection.status === 403) {
        if ($location.path() !== '/login' && AuthService.isLoggedIn()) {
          AuthService.logout();
          $location.path('/login');
          NotificationService.show("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.", "warning");
        }
      }
      return $q.reject(rejection);
    }
  };
});

// ---- CartService ----
app.factory("CartService", function ($rootScope) {
  var cart = JSON.parse(localStorage.getItem("cart")) || [];
  var service = {
    getCart: function () { return cart; },
    add: function (product) {
      var item = cart.find((i) => i.id === product.id);
      if (item) { item.quantityInCart += 1; }
      else {
        var newItem = angular.copy(product);
        newItem.quantityInCart = 1;
        cart.push(newItem);
      }
      this.save();
    },
    remove: function (id) {
      cart = cart.filter((i) => i.id !== id);
      this.save();
    },
    save: function () {
      localStorage.setItem("cart", JSON.stringify(cart));
      $rootScope.cartCount = this.count();
    },
    count: function () { return cart.reduce((total, item) => total + item.quantityInCart, 0); },
    amount: function () { return cart.reduce((total, item) => total + item.quantityInCart * item.price, 0); },
    clear: function () { cart = []; this.save(); }
  };
  $rootScope.cartCount = service.count();
  return service;
});

// ---- WishlistService ----
app.factory("WishlistService", function ($rootScope, $http, AuthService) {
  var wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  var service = {
    getWishlist: function () { return wishlist; },
    add: function (product) {
      if (!wishlist.some(p => p.id === product.id)) {
        wishlist.push(product);
        this.save();
        if (AuthService.isLoggedIn()) {
          $http.post("http://localhost:8080/api/v1/wishlist/" + product.id)
            .catch(err => console.error("Lỗi đồng bộ thêm yêu thích:", err));
        }
      }
    },
    remove: function (id) {
      wishlist = wishlist.filter(p => p.id !== id);
      this.save();
      if (AuthService.isLoggedIn()) {
        $http.delete("http://localhost:8080/api/v1/wishlist/" + id)
          .catch(err => console.error("Lỗi đồng bộ xóa yêu thích:", err));
      }
    },
    toggle: function (product) {
      if (this.has(product.id)) {
        this.remove(product.id);
        return false;
      } else {
        this.add(product);
        return true;
      }
    },
    has: function (id) {
      return wishlist.some(p => p.id === id);
    },
    save: function () {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      $rootScope.wishlistCount = this.count();
    },
    count: function () { return wishlist.length; },
    clear: function () { wishlist = []; this.save(); },
    sync: function () {
      if (!AuthService.isLoggedIn()) return;
      $http.get("http://localhost:8080/api/v1/wishlist").then(function (res) {
        var dbProducts = res.data.map(item => item.product);
        wishlist.forEach(function (localProduct) {
          if (!dbProducts.some(p => p.id === localProduct.id)) {
            $http.post("http://localhost:8080/api/v1/wishlist/" + localProduct.id)
              .catch(err => console.error("Lỗi đẩy sản phẩm lên DB khi sync:", err));
            dbProducts.push(localProduct);
          }
        });
        wishlist = dbProducts;
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        $rootScope.wishlistCount = wishlist.length;
      }).catch(function (err) {
        console.error("Lỗi đồng bộ danh sách yêu thích:", err);
      });
    }
  };
  $rootScope.wishlistCount = service.count();
  if (AuthService.isLoggedIn()) {
    service.sync();
  }
  return service;
});

// ---- Config ----
app.config(function ($routeProvider, $httpProvider) {
  var v = new Date().getTime();
  $routeProvider
    .when("/", { templateUrl: "views/home.html?v=" + v, controller: "HomeController" })
    .when("/products", { templateUrl: "views/products.html?v=" + v, controller: "ProductsController" })
    .when("/product/:id", { templateUrl: "views/product-detail.html?v=" + v, controller: "DetailController" })
    .when("/cart", { templateUrl: "views/cart.html?v=" + v, controller: "CartController" })
    .when("/checkout", { templateUrl: "views/checkout.html?v=" + v, controller: "CheckoutController" })
    .when("/lookup", { templateUrl: "views/lookup.html?v=" + v, controller: "LookupController" })
    .when("/login", { templateUrl: "views/login.html?v=" + v, controller: "LoginController" })
    .when("/register", { templateUrl: "views/register.html?v=" + v, controller: "RegisterController" })
    .when("/profile", { templateUrl: "views/profile.html?v=" + v, controller: "ProfileController", requireAuth: true })
    .when("/wishlist", { templateUrl: "views/wishlist.html?v=" + v, controller: "WishlistController" })
    .otherwise({ redirectTo: "/" });

  $httpProvider.interceptors.push('AuthInterceptor');
});

// ---- Run Block ----
app.run(function ($rootScope, $location, AuthService, WishlistService) {
  // Theme management
  $rootScope.isDarkMode = localStorage.getItem('theme') === 'dark';
  
  $rootScope.applyTheme = function() {
    if ($rootScope.isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  $rootScope.toggleTheme = function() {
    $rootScope.isDarkMode = !$rootScope.isDarkMode;
    $rootScope.applyTheme();
  };

  // Initialize theme
  $rootScope.applyTheme();

  $rootScope.$on('$routeChangeStart', function (event, next) {
    $rootScope.currentUser = AuthService.getUser();
    $rootScope.isLoggedIn = AuthService.isLoggedIn();
    if (next && next.requireAuth && !AuthService.isLoggedIn()) {
      event.preventDefault();
      $location.path('/login');
    }
  });
  $rootScope.logout = function () {
    AuthService.logout();
    WishlistService.clear();
    $rootScope.currentUser = null;
    $rootScope.isLoggedIn = false;
    $location.path('/');
  };
});

// ---- MainController ----
app.controller("MainController", function ($scope, $location, AuthService) {
  $scope.globalKw = "";
  
  $scope.globalSearch = function () {
    if ($scope.globalKw) {
      $location.path("/products").search({ kw: $scope.globalKw });
    } else {
      $location.path("/products").search({});
    }
  };

  $scope.isActive = function (viewLocation) {
    if (viewLocation === '/') {
      return $location.path() === '/';
    }
    return $location.path().indexOf(viewLocation) === 0;
  };

  // Sync global search input when URL changes
  $scope.$on('$routeChangeSuccess', function () {
    $scope.globalKw = $location.search().kw || "";
  });
});

// HomeController (Landing Page)
app.controller("HomeController", function ($scope, $http, $location, CartService, NotificationService, WishlistService) {
  $scope.categories = [];
  $scope.featuredProducts = [];
  $scope.consultationForm = { name: "", phone: "", message: "" };

  // Load root categories for landing page showcases
  $http.get("http://localhost:8080/api/v1/products/categories").then(res => {
    $scope.categories = res.data.slice(0, 4);
  }).catch(err => console.error("Lỗi lấy danh mục:", err));

  // Load featured products (top 4)
  $http.get("http://localhost:8080/api/v1/products", { params: { page: 0, size: 4 } }).then(res => {
    $scope.featuredProducts = res.data.content;
  }).catch(err => console.error("Lỗi lấy sản phẩm nổi bật:", err));

  $scope.submitConsultation = function () {
    if (!$scope.consultationForm.name || !$scope.consultationForm.phone) {
      NotificationService.show("Vui lòng điền đầy đủ họ tên và số điện thoại!", "warning");
      return;
    }
    NotificationService.show("Yêu cầu của bạn đã được tiếp nhận. Đội ngũ kỹ thuật sẽ gọi lại trong 15 phút!", "success");
    $scope.consultationForm = { name: "", phone: "", message: "" };
  };

  $scope.addToCart = function (product) {
    CartService.add(product);
    NotificationService.show("Đã thêm " + product.name + " vào giỏ hàng");
  };

  $scope.addToWishlist = function (product) {
    WishlistService.add(product);
    NotificationService.show("Đã thêm " + product.name + " vào danh sách yêu thích!", "info");
  };

  $scope.goToDetail = function (id) {
    if (!id) return;
    $location.path("/product/" + id.replace(/\//g, "_"));
  };

  $scope.goToCategory = function (categoryId) {
    $location.path("/products").search({ categoryId: categoryId });
  };
});

// ProductsController (Products Shop & Search Results)
app.controller("ProductsController", function ($scope, $http, $routeParams, $location, CartService, NotificationService, WishlistService) {
  $scope.categories = [];
  $scope.allBrands = [];
  $scope.kw = $routeParams.kw || "";
  
  $scope.filterData = {
    categoryId: $routeParams.categoryId ? parseInt($routeParams.categoryId) : null,
    brands: $routeParams.brand ? (angular.isArray($routeParams.brand) ? $routeParams.brand : [$routeParams.brand]) : [],
    minPower: $routeParams.minPower ? parseFloat($routeParams.minPower) : null,
    maxPower: $routeParams.maxPower ? parseFloat($routeParams.maxPower) : null,
    minHead: null,
    maxHead: null
  };

  $scope.expandedCategories = {};
  $scope.toggleCategory = function(id, event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    $scope.expandedCategories[id] = !$scope.expandedCategories[id];
  };

  // Load root categories for filter tree
  $http.get("http://localhost:8080/api/v1/products/categories").then(res => {
    $scope.categories = res.data;
    // Auto-expand category paths if active
    if ($scope.filterData.categoryId) {
      $scope.categories.forEach(cat => {
        if (cat.id === $scope.filterData.categoryId) {
          $scope.expandedCategories[cat.id] = true;
        } else if (cat.children && cat.children.some(sub => sub.id === $scope.filterData.categoryId)) {
          $scope.expandedCategories[cat.id] = true;
        }
      });
    }
  }).catch(err => console.error("Lỗi lấy danh mục:", err));

  // Load unique brands
  $http.get("http://localhost:8080/api/v1/products/brands").then(res => {
    $scope.allBrands = res.data;
  }).catch(err => console.error("Lỗi lấy thương hiệu:", err));

  $scope.toggleBrand = function(brand) {
    var idx = $scope.filterData.brands.indexOf(brand);
    if (idx > -1) $scope.filterData.brands.splice(idx, 1);
    else $scope.filterData.brands.push(brand);
    $scope.search();
  };

  $scope.pager = {
    page: 0,
    size: 9,
    count: 0,
    items: [],

    init() {
      // Build search parameters
      let params = {
        page: this.page,
        size: this.size,
        kw: $scope.kw || null,
        categoryId: $scope.filterData.categoryId || null,
        brand: ($scope.filterData.brands && $scope.filterData.brands.length > 0) ? $scope.filterData.brands : null,
        minPower: $scope.filterData.minPower || null,
        maxPower: $scope.filterData.maxPower || null,
        minHead: $scope.filterData.minHead || null,
        maxHead: $scope.filterData.maxHead || null
      };

      $http.get("http://localhost:8080/api/v1/products", { params: params }).then(res => {
        this.items = res.data.content;
        this.count = res.data.totalPages;
      }).catch(err => {
        console.error("Lỗi lấy dữ liệu:", err);
      });
    },

    next() { if (this.page < this.count - 1) { this.page++; this.init(); } },
    prev() { if (this.page > 0) { this.page--; this.init(); } },
    first() { this.page = 0; this.init(); },
    last() { this.page = this.count - 1; this.init(); }
  };

  $scope.pager.init();

  $scope.search = function () {
    $scope.pager.page = 0;
    $scope.pager.init();
    
    // Sync browser URL parameters so user can copy and bookmark the URL
    $location.search({
      kw: $scope.kw || null,
      categoryId: $scope.filterData.categoryId || null,
      brand: ($scope.filterData.brands && $scope.filterData.brands.length > 0) ? $scope.filterData.brands : null,
      minPower: $scope.filterData.minPower || null,
      maxPower: $scope.filterData.maxPower || null
    });
  };

  $scope.resetFilter = function() {
    $scope.kw = "";
    $scope.filterData = { categoryId: null, brands: [], minPower: null, maxPower: null, minHead: null, maxHead: null };
    $scope.search();
  };

  $scope.setCategory = function(id) {
    $scope.filterData.categoryId = id;
    $scope.search();
  };

  $scope.addToCart = function (product) {
    CartService.add(product);
    NotificationService.show("Đã thêm " + product.name + " vào giỏ hàng");
  };

  $scope.addToWishlist = function (product) {
    WishlistService.add(product);
    NotificationService.show("Đã thêm " + product.name + " vào danh sách yêu thích!", "info");
  };

  $scope.goToDetail = function (id) {
    if (!id) return;
    $location.path("/product/" + id.replace(/\//g, "_"));
  };
});

// DetailController
app.controller("DetailController", function ($scope, $http, $routeParams, $rootScope, CartService, NotificationService, WishlistService) {
  $http.get("http://localhost:8080/api/v1/products/" + $routeParams.id).then(function (response) {
    $scope.product = response.data;
    $rootScope.product = response.data;
    $scope.loadReviews();
  });

  $scope.reviews = [];
  $scope.reviewForm = { rating: 5, comment: '' };

  $scope.loadReviews = function () {
    $http.get("http://localhost:8080/api/v1/reviews/product/" + $routeParams.id).then(function (response) {
      $scope.reviews = response.data;
    });
  };

  $scope.sendReview = function () {
    var fileInput = document.getElementById('reviewImage');
    var file = fileInput.files[0];

    var formData = new FormData();
    var reviewData = {
      productId: $scope.product.id,
      rating: $scope.reviewForm.rating,
      comment: $scope.reviewForm.comment
    };

    formData.append("review", new Blob([JSON.stringify(reviewData)], { type: "application/json" }));
    if (file) {
      formData.append("image", file);
    }

    $http.post("http://localhost:8080/api/v1/reviews", formData, {
      transformRequest: angular.identity,
      headers: { 'Content-Type': undefined }
    }).then(function (response) {
      NotificationService.show("Cảm ơn bạn đã đánh giá!");
      $scope.reviewForm.comment = '';
      $scope.reviewForm.rating = 5;
      $scope.previewImage = null;
      if (fileInput) fileInput.value = '';
      $scope.loadReviews();
    }).catch(function (error) {
      NotificationService.show("Lỗi khi gửi đánh giá!", "danger");
    });
  };

  $scope.onFileSelect = function (element) {
    if (element.files && element.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        $scope.$apply(function () {
          $scope.previewImage = e.target.result;
        });
      };
      reader.readAsDataURL(element.files[0]);
    }
  };

  $scope.removeFile = function () {
    $scope.previewImage = null;
    var fileInput = document.getElementById('reviewImage');
    if (fileInput) fileInput.value = '';
  };

  $scope.openImage = function(imageUrl) {
    window.open('http://localhost:8080/uploads/reviews/' + imageUrl, '_blank');
  };

  $scope.$on("$destroy", () => { $rootScope.product = null; });

  $scope.addToCart = function (product) {
    CartService.add(product);
    NotificationService.show("Đã thêm vào giỏ hàng!");
  };

  $scope.addToWishlist = function (product) {
    WishlistService.add(product);
    NotificationService.show("Đã thêm vào danh sách yêu thích!", "info");
  };

  $scope.isInWishlist = function (productId) {
    return WishlistService.has(productId);
  };

  $scope.toggleWishlist = function (product) {
    var added = WishlistService.toggle(product);
    if (added) {
      NotificationService.show("Đã thêm vào danh sách yêu thích!", "info");
    } else {
      NotificationService.show("Đã xóa khỏi danh sách yêu thích!", "warning");
    }
  };
});

// CartController
app.controller("CartController", function ($scope, $rootScope, $location, CartService) {
  $scope.cart = CartService.getCart();
  $scope.updateTotals = function () {
    $scope.totalAmount = CartService.amount();
    $rootScope.cartCount = CartService.count();
  };
  $scope.increaseQty = function (item) { item.quantityInCart++; CartService.save(); $scope.updateTotals(); };
  $scope.decreaseQty = function (item) {
    if (item.quantityInCart > 1) { item.quantityInCart--; CartService.save(); $scope.updateTotals(); }
  };
  $scope.removeItem = function (id) {
    CartService.remove(id);
    $scope.cart = CartService.getCart();
    $scope.updateTotals();
  };
  $scope.goToCheckOut = () => $location.path("/checkout");
  $scope.updateTotals();
});

// CheckoutController
app.controller("CheckoutController", function ($scope, $http, $location, CartService, NotificationService, AuthService) {
  $scope.cart = CartService.getCart() || [];
  $scope.totalAmount = CartService.amount() || 0;
  $scope.order = { receiverName: "", receiverPhone: "", deliveryAddress: "", orderDetails: [] };

  // Auto-fill if logged in
  if (AuthService.isLoggedIn()) {
    $http.get("http://localhost:8080/api/v1/auth/me").then(res => {
      $scope.order.receiverName = res.data.fullName;
      $scope.order.receiverPhone = res.data.phone;
      $scope.order.deliveryAddress = res.data.address;
    }).catch(err => console.error("Lỗi lấy thông tin người dùng:", err));
  }

  $scope.confirmOrder = function () {
    if ($scope.cart.length === 0) {
      NotificationService.show("Giỏ hàng trống!", "warning");
      return;
    }

    $scope.isLoading = true;

    $scope.order.totalAmount = $scope.totalAmount;
    $scope.order.orderDetails = $scope.cart.map(item => ({
      product: { id: item.id },
      price: item.price,
      quantity: item.quantityInCart
    }));

    $http.post("http://localhost:8080/api/v1/orders", $scope.order)
      .then(function (res) {
        NotificationService.show("Đặt hàng thành công!");
        CartService.clear();
        $location.path("/");
      })
      .catch(function (error) {
        console.error("Lỗi đặt hàng:", error);
        NotificationService.show("Đặt hàng thất bại, vui lòng thử lại sau", "danger");
      })
      .finally(function () {
        $scope.isLoading = false;
      });
  };
});

// LookupController
app.controller("LookupController", function ($scope, $http, $routeParams, NotificationService) {
  $scope.lookupData = { id: $routeParams.id || '', phone: $routeParams.phone || '' };

  $scope.getStatusLabel = function (status) {
    const map = {
      'PENDING': 'Đang xử lý',
      'SHIPPING': 'Đang giao hàng',
      'COMPLETED': 'Đã hoàn thành',
      'CANCELLED': 'Đã hủy'
    };
    return map[status] || status || 'Đang chờ';
  };

  $scope.getStepIndex = function (status) {
    const map = {
      'PENDING': 1,
      'SHIPPING': 2,
      'COMPLETED': 3
    };
    return map[status] || 0;
  };

  $scope.lookupOrder = function () {
    if (!$scope.lookupData.id || !$scope.lookupData.phone) return;
    $scope.isLoading = true;
    $scope.errorMessage = null; // Clear previous error
    var url = `http://localhost:8080/api/v1/orders/lookup?id=${$scope.lookupData.id}&phone=${encodeURIComponent($scope.lookupData.phone)}`;
    $http.get(url).then(res => {
      $scope.orderResult = res.data;
    })
      .catch(err => {
        $scope.orderResult = null; // Clear previous result
        $scope.errorMessage = err.status === 404 ? 'Không tìm thấy đơn hàng.' : 'Lỗi kết nối máy chủ.';
        NotificationService.show($scope.errorMessage, "danger");
      })
      .finally(() => $scope.isLoading = false);
  };

  // Auto lookup if params are provided
  if ($scope.lookupData.id && $scope.lookupData.phone) {
    $scope.lookupOrder();
  }
});

// LoginController
app.controller('LoginController', function ($scope, $http, $location, AuthService, NotificationService, WishlistService) {
  // Load remembered username
  const savedUsername = localStorage.getItem('remembered_username');
  $scope.rememberMe = !!savedUsername;
  $scope.credentials = { username: savedUsername || '', password: '' };

  $scope.login = function () {
    $scope.isLoading = true;
    $http.post('http://localhost:8080/api/v1/auth/login', $scope.credentials)
      .then(res => {
        // Handle remember me
        if ($scope.rememberMe) {
          localStorage.setItem('remembered_username', $scope.credentials.username);
        } else {
          localStorage.removeItem('remembered_username');
        }

        AuthService.saveSession(res.data);
        WishlistService.sync(); // Sync wishlist immediately!
        NotificationService.show("Chào mừng " + res.data.fullName + " trở lại!");
        $location.path('/');
      })
      .catch(err => {
        const msg = (err.status === 401 || err.status === 403) ? 'Sai tài khoản hoặc mật khẩu.' : 'Lỗi hệ thống.';
        NotificationService.show(msg, "danger");
      })
      .finally(() => $scope.isLoading = false);
  };
});

// RegisterController
app.controller('RegisterController', function ($scope, $http, $location, NotificationService) {
  $scope.form = { username: '', password: '', confirmPassword: '' };
  $scope.register = function () {
    if ($scope.form.password !== $scope.form.confirmPassword) {
      NotificationService.show("Mật khẩu xác nhận không khớp!", "warning");
      return;
    }
    $scope.isLoading = true;
    $http.post('http://localhost:8080/api/v1/auth/register', $scope.form)
      .then(() => {
        NotificationService.show("Đăng ký thành công!", "success");
        $location.path('/login');
      })
      .catch(err => {
        const msg = (err.status === 409) ? 'Tên đăng nhập đã tồn tại.' : 'Lỗi đăng ký.';
        NotificationService.show(msg, "danger");
      })
      .finally(() => $scope.isLoading = false);
  };
});

// ProfileController
app.controller('ProfileController', function ($scope, $http, $location, AuthService, NotificationService) {
  $scope.activeSection = 'profile';
  $scope.userForm = {};
  $scope.passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' };
  $scope.orderHistory = [];

  $scope.loadProfile = function () {
    $http.get('http://localhost:8080/api/v1/auth/me')
      .then(res => {
        $scope.userForm = res.data;
      })
      .catch(err => {
        NotificationService.show("Lỗi tải thông tin tài khoản", "danger");
      });
  };

  $scope.updateInfo = function () {
    $scope.isLoading = true;
    $http.put('http://localhost:8080/api/v1/auth/profile', $scope.userForm)
      .then(res => {
        NotificationService.show(res.data.message);
        var user = AuthService.getUser();
        user.fullName = $scope.userForm.fullName;
        localStorage.setItem('pumpshop_user', JSON.stringify(user));
        $scope.loadProfile();
      })
      .catch(err => {
        NotificationService.show("Lỗi cập nhật thông tin", "danger");
      })
      .finally(() => $scope.isLoading = false);
  };

  $scope.changePassword = function () {
    if ($scope.passwordForm.newPassword !== $scope.passwordForm.confirmPassword) {
      NotificationService.show("Mật khẩu xác nhận không khớp", "warning");
      return;
    }

    $scope.isLoadingPass = true;
    $http.put('http://localhost:8080/api/v1/auth/change-password', {
      oldPassword: $scope.passwordForm.oldPassword,
      newPassword: $scope.passwordForm.newPassword
    })
      .then(res => {
        NotificationService.show(res.data.message);
        $scope.passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' };
      })
      .catch(err => {
        const msg = err.data && err.data.message ? err.data.message : "Lỗi đổi mật khẩu";
        NotificationService.show(msg, "danger");
      })
      .finally(() => $scope.isLoadingPass = false);
  };

  $scope.loadOrderHistory = function () {
    $scope.isOrdersLoading = true;
    $http.get('http://localhost:8080/api/v1/orders/my-history')
      .then(res => {
        $scope.orderHistory = res.data;
      })
      .catch(err => {
        NotificationService.show("Lỗi tải lịch sử đơn hàng", "danger");
      })
      .finally(() => $scope.isOrdersLoading = false);
  };

  $scope.viewOrderDetail = function (order) {
    // Redirect to lookup page with parameters
    $location.path('/lookup').search({
      id: order.id,
      phone: order.receiverPhone
    });
  };

  $scope.loadProfile();
});

// WishlistController
app.controller("WishlistController", function ($scope, $rootScope, $location, WishlistService, CartService, NotificationService) {
  $scope.wishlist = WishlistService.getWishlist();

  $scope.removeFromWishlist = function (id) {
    WishlistService.remove(id);
    $scope.wishlist = WishlistService.getWishlist();
    NotificationService.show("Đã xóa khỏi danh sách yêu thích!", "warning");
  };

  $scope.addToCart = function (product) {
    CartService.add(product);
    NotificationService.show("Đã thêm " + product.name + " vào giỏ hàng");
  };

  $scope.goToDetail = function (id) {
    if (!id) return;
    $location.path("/product/" + id.replace(/\//g, "_"));
  };
});