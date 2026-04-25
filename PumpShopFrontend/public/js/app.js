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
    getToken: function () { return $window.localStorage.getItem(TOKEN_KEY); },
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
        AuthService.logout();
        $location.path('/login');
        NotificationService.show("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.", "warning");
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

// ---- Config ----
app.config(function ($routeProvider, $httpProvider) {
  $routeProvider
    .when("/", { templateUrl: "views/home.html", controller: "HomeController" })
    .when("/product/:id", { templateUrl: "views/product-detail.html", controller: "DetailController" })
    .when("/cart", { templateUrl: "views/cart.html", controller: "CartController" })
    .when("/checkout", { templateUrl: "views/checkout.html", controller: "CheckoutController", requireAuth: true })
    .when("/lookup", { templateUrl: "views/lookup.html", controller: "LookupController" })
    .when("/login", { templateUrl: "views/login.html", controller: "LoginController" })
    .when("/register", { templateUrl: "views/register.html", controller: "RegisterController" })
    .otherwise({ redirectTo: "/" });

  $httpProvider.interceptors.push('AuthInterceptor');
});

// ---- Run Block ----
app.run(function ($rootScope, $location, AuthService) {
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
    $rootScope.currentUser = null;
    $rootScope.isLoggedIn = false;
    $location.path('/');
  };
});

// HomeController
app.controller("HomeController", function ($scope, $http, $location, CartService, NotificationService) {
  $scope.products = [];
  $scope.kw = "";
  $scope.pager = {
    page: 0,
    size: 8,
    count: 0,
    items: [],

    init() {
      var url = `http://localhost:8080/api/v1/products?page=${this.page}&size=${this.size}&kw=${$scope.kw}`;
      $http.get(url).then(res => {
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

// DetailController
app.controller("DetailController", function ($scope, $http, $routeParams, $rootScope, CartService, NotificationService) {
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
    var reviewData = {
      productId: $routeParams.id,
      rating: $scope.reviewForm.rating,
      comment: $scope.reviewForm.comment
    };

    $http.post("http://localhost:8080/api/v1/reviews", reviewData).then(function (response) {
      NotificationService.show("Cảm ơn bạn đã đánh giá!");
      $scope.reviewForm.comment = '';
      $scope.loadReviews();
    }).catch(function (error) {
      NotificationService.show("Lỗi khi gửi đánh giá!", "danger");
    });
  };

  $scope.$on("$destroy", () => { $rootScope.product = null; });

  $scope.addToCart = function (product) {
    CartService.add(product);
    NotificationService.show("Đã thêm vào giỏ hàng!");
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
app.controller("CheckoutController", function ($scope, $http, $location, CartService, NotificationService) {
  $scope.cart = CartService.getCart() || [];
  $scope.totalAmount = CartService.amount() || 0;
  $scope.order = { receiverName: "", receiverPhone: "", deliveryAddress: "", orderDetails: [] };

  $scope.confirmOrder = function () {
    if ($scope.cart.length === 0) {
      NotificationService.show("Giỏ hàng trống!", "warning");
      return;
    }
    $scope.order.totalAmount = $scope.totalAmount;
    $scope.order.orderDetails = $scope.cart.map(item => ({
      product: { id: item.id },
      price: item.price,
      quantity: item.quantityInCart
    }));

    $http.post("http://localhost:8080/api/v1/orders", $scope.order).then(function (res) {
      NotificationService.show("Đặt hàng thành công! Mã đơn: " + res.data.id, "success");
      CartService.clear();
      $location.path("/");
    }).catch(() => NotificationService.show("Lỗi khi xử lý đơn hàng!", "danger"));
  };
});

// LookupController
app.controller("LookupController", function ($scope, $http, NotificationService) {
  $scope.lookupData = { id: '', phone: '' };
  $scope.lookupOrder = function () {
    if (!$scope.lookupData.id || !$scope.lookupData.phone) return;
    $scope.isLoading = true;
    var url = `http://localhost:8080/api/v1/orders/lookup?id=${$scope.lookupData.id}&phone=${encodeURIComponent($scope.lookupData.phone)}`;
    $http.get(url).then(res => { $scope.orderResult = res.data; })
      .catch(err => {
        $scope.errorMessage = err.status === 404 ? 'Không tìm thấy đơn hàng.' : 'Lỗi kết nối máy chủ.';
        NotificationService.show($scope.errorMessage, "danger");
      })
      .finally(() => $scope.isLoading = false);
  };
});

// LoginController
app.controller('LoginController', function ($scope, $http, $location, AuthService, NotificationService) {
  $scope.credentials = { username: '', password: '' };
  $scope.login = function () {
    $scope.isLoading = true;
    $http.post('http://localhost:8080/api/v1/auth/login', $scope.credentials)
      .then(res => {
        AuthService.saveSession(res.data);
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