import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Iter "mo:core/Iter";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type ProductId = Text;

  public type Product = {
    id : ProductId;
    productName : Text;
    asin : Text; // ASIN field (10-character alphanumeric Amazon identifier)
    category : Text;
    subcategory : Text;
    price : Float;
    mrp : Float;
    rating : Float;
    reviewCount : Nat;
    bsr : Nat;
    estimatedMonthlySales : Nat;
    brand : Text;
    sellerType : SellerType;
    availableStock : Nat;
    margin : Float;
    lastModified : Time.Time;
    images : [Storage.ExternalBlob];
  };

  public type SellerType = {
    #fba;
    #easyShip;
    #sellerFulfilled;
  };

  public type OpportunityScore = {
    score : Float;
    demandScore : Float;
    competitionScore : Float;
    growthScore : Float;
    marginScore : Float;
  };

  public type ProductAddRequest = {
    productName : Text; // Updated to productName
    asin : Text; // ASIN field
    category : Text;
    subcategory : Text;
    price : Float;
    mrp : Float;
    rating : Float;
    reviewCount : Nat;
    bsr : Nat;
    estimatedMonthlySales : Nat;
    brand : Text;
    sellerType : SellerType;
    availableStock : Nat;
    margin : Float;
    images : [Storage.ExternalBlob];
  };

  public type ProductSearchFilters = {
    category : ?Text;
    subcategory : ?Text;
    priceRange : ?(Float, Float);
    ratingThreshold : ?Float;
    reviewCountMax : ?Nat;
    bsrRange : ?(Nat, Nat);
    monthlyRevenueRange : ?(Float, Float);
    lightweightPreference : Bool;
    nonBrandedFriendly : Bool;
    lowFBACount : Bool;
    highReviewGrowth : Bool;
    highMarginThreshold : Bool;
  };

  public type OpportunityScoreFilters = {
    minScore : Float;
    category : ?Text;
  };

  public type KeywordResearch = {
    searchVolumeEstimate : Nat;
    keywordDifficultyScore : Float;
    cpcEstimate : Float;
    twelve_month_trend : [Float];
    longTailSuggestions : [Text];
  };

  public type TrendDetection = {
    reviewGrowthSpike : Bool;
    priceIncreaseTrend : Bool;
    seasonalDemandPattern : Bool;
    risingStar : Bool;
  };

  public type ProfitCalculator = {
    amazonReferralFees : Float;
    fbaFees : Float;
    gstConsideration : Float;
    shippingCost : Float;
    packagingCost : Float;
    adsBudget : Float;
    netProfitPerUnit : Float;
    roiPercentage : Float;
    breakEvenAcos : Float;
  };

  public type SellerAnalysis = {
    averagePrice : Float;
    averageRating : Float;
    averageReviews : Nat;
    listingQualityScore : Float;
    weaknessDetection : [Text];
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    subscriptionTier : SubscriptionTier;
    savedProductLists : [Text];
    alertPreferences : [Text];
  };

  public type SubscriptionTier = {
    #free;
    #pro;
    #premium;
  };

  let products = Map.empty<ProductId, Product>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addProduct(productRequest : ProductAddRequest) : async ProductId {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };

    let id = productRequest.productName.concat(Time.now().toText());

    let product : Product = {
      id;
      productName = productRequest.productName : Text;
      asin = productRequest.asin : Text;
      category = productRequest.category : Text;
      subcategory = productRequest.subcategory : Text;
      price = productRequest.price : Float;
      mrp = productRequest.mrp : Float;
      rating = productRequest.rating : Float;
      reviewCount = productRequest.reviewCount : Nat;
      bsr = productRequest.bsr : Nat;
      estimatedMonthlySales = productRequest.estimatedMonthlySales : Nat;
      brand = productRequest.brand : Text;
      sellerType = productRequest.sellerType : SellerType;
      availableStock = productRequest.availableStock : Nat;
      margin = productRequest.margin : Float;
      lastModified = Time.now();
      images = productRequest.images : [Storage.ExternalBlob];
    };

    products.add(id, product);
    id;
  };

  public query ({ caller }) func getProduct(id : ProductId) : async Product {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view products");
    };
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public type ProductSearchResult = {
    #success : [Product];
    #error : Text;
  };

  func calculateMargin(cost : Float, price : Float) : Float {
    let totalFees = price * 0.15 + price * 0.15;
    let netProfit = price - cost - totalFees;
    if (price != 0.0) {
      let marginPercentage = (netProfit / price) * 100.0;
      let roundedMargin = marginPercentage.toInt().toFloat();
      roundedMargin / 100.0;
    } else {
      0.0;
    };
  };

  func getElectronicsProducts() : [Product] {
    [
      {
        id = "1";
        productName = "USB-C Fast Charger";
        asin = "B012345678";
        category = "Electronics";
        subcategory = "Mobile Accessories";
        price = 49.99;
        mrp = 69.99;
        rating = 4.4;
        reviewCount = 350;
        bsr = 1200;
        estimatedMonthlySales = 500;
        brand = "TechConnect";
        sellerType = #fba;
        availableStock = 300;
        margin = calculateMargin(25.0, 49.99);
        lastModified = Time.now();
        images = [];
      },
      {
        id = "2";
        productName = "Wireless Bluetooth Headphones";
        asin = "B076854654";
        category = "Electronics";
        subcategory = "Audio";
        price = 149.99;
        mrp = 199.99;
        rating = 4.6;
        reviewCount = 850;
        bsr = 900;
        estimatedMonthlySales = 700;
        brand = "SoundMax";
        sellerType = #fba;
        availableStock = 400;
        margin = calculateMargin(60.0, 149.99);
        lastModified = Time.now();
        images = [];
      },
      {
        id = "3";
        productName = "Smart LED Bulb (Pack of 2)";
        asin = "B079178468";
        category = "Electronics";
        subcategory = "Lighting";
        price = 29.99;
        mrp = 39.99;
        rating = 4.3;
        reviewCount = 150;
        bsr = 1800;
        estimatedMonthlySales = 450;
        brand = "BrightLife";
        sellerType = #easyShip;
        availableStock = 200;
        margin = calculateMargin(10.0, 29.99);
        lastModified = Time.now();
        images = [];
      },
      {
        id = "4";
        productName = "Bluetooth Speaker";
        asin = "B797986468";
        category = "Electronics";
        subcategory = "Audio";
        price = 99.99;
        mrp = 129.99;
        rating = 4.5;
        reviewCount = 600;
        bsr = 1000;
        estimatedMonthlySales = 550;
        brand = "SoundWave";
        sellerType = #fba;
        availableStock = 320;
        margin = calculateMargin(39.99, 99.99);
        lastModified = Time.now();
        images = [];
      },
      {
        id = "5";
        productName = "Wireless Earbuds";
        asin = "B079764638";
        category = "Electronics";
        subcategory = "Audio";
        price = 179.99;
        mrp = 249.99;
        rating = 4.7;
        reviewCount = 950;
        bsr = 850;
        estimatedMonthlySales = 800;
        brand = "SoundCore";
        sellerType = #fba;
        availableStock = 400;
        margin = calculateMargin(85.0, 179.99);
        lastModified = Time.now();
        images = [];
      },
      {
        id = "6";
        productName = "Car Phone Mount";
        asin = "B013934678";
        category = "Electronics";
        subcategory = "Mobile Accessories";
        price = 19.99;
        mrp = 29.99;
        rating = 4.1;
        reviewCount = 120;
        bsr = 2200;
        estimatedMonthlySales = 300;
        brand = "TechConnect";
        sellerType = #sellerFulfilled;
        availableStock = 150;
        margin = calculateMargin(9.99, 19.99);
        lastModified = Time.now();
        images = [];
      },
      {
        id = "7";
        productName = "Solar Power Bank";
        asin = "B079598568";
        category = "Electronics";
        subcategory = "Mobile Accessories";
        price = 69.99;
        mrp = 89.99;
        rating = 4.3;
        reviewCount = 200;
        bsr = 1500;
        estimatedMonthlySales = 400;
        brand = "PowerPro";
        sellerType = #fba;
        availableStock = 200;
        margin = calculateMargin(29.99, 69.99);
        lastModified = Time.now();
        images = [];
      },
      {
        id = "8";
        productName = "Laptop Stand";
        asin = "B541324568";
        category = "Electronics";
        subcategory = "Computer Accessories";
        price = 39.99;
        mrp = 59.99;
        rating = 4.4;
        reviewCount = 250;
        bsr = 1400;
        estimatedMonthlySales = 350;
        brand = "TechConnect";
        sellerType = #easyShip;
        availableStock = 180;
        margin = calculateMargin(18.99, 39.99);
        lastModified = Time.now();
        images = [];
      },
      {
        id = "9";
        productName = "Wireless Mouse";
        asin = "B075786482";
        category = "Electronics";
        subcategory = "Computer Accessories";
        price = 24.99;
        mrp = 34.99;
        rating = 4.5;
        reviewCount = 380;
        bsr = 1100;
        estimatedMonthlySales = 520;
        brand = "TechConnect";
        sellerType = #fba;
        availableStock = 280;
        margin = calculateMargin(12.99, 24.99);
        lastModified = Time.now();
        images = [];
      },
      {
        id = "10";
        productName = "Noise Cancelling Headphones";
        asin = "B059459462";
        category = "Electronics";
        subcategory = "Audio";
        price = 229.99;
        mrp = 299.99;
        rating = 4.8;
        reviewCount = 720;
        bsr = 800;
        estimatedMonthlySales = 600;
        brand = "SoundMax";
        sellerType = #easyShip;
        availableStock = 300;
        margin = calculateMargin(110.0, 229.99);
        lastModified = Time.now();
        images = [];
      },
    ];
  };

  func getHomeKitchenProducts() : [Product] {
    [
      {
        id = "17";
        productName = "Stainless Steel Water Bottle";
        asin = "B084654915";
        category = "Home & Kitchen";
        subcategory = "Drinkware";
        price = 29.99;
        mrp = 39.99;
        rating = 4.7;
        reviewCount = 400;
        bsr = 950;
        estimatedMonthlySales = 700;
        brand = "EcoSip";
        sellerType = #easyShip;
        availableStock = 450;
        margin = calculateMargin(12.99, 29.99);
        lastModified = Time.now();
        images = [];
      },
      {
        id = "18";
        productName = "Insulated Lunch Box";
        asin = "B074532189";
        category = "Home & Kitchen";
        subcategory = "Food Storage";
        price = 34.99;
        mrp = 49.99;
        rating = 4.5;
        reviewCount = 250;
        bsr = 1200;
        estimatedMonthlySales = 600;
        brand = "FreshKeep";
        sellerType = #fba;
        availableStock = 300;
        margin = calculateMargin(14.99, 34.99);
        lastModified = Time.now();
        images = [];
      },
      {
        id = "19";
        productName = "Collapsible Food Containers";
        asin = "B093178454";
        category = "Home & Kitchen";
        subcategory = "Food Storage";
        price = 29.99;
        mrp = 39.99;
        rating = 4.6;
        reviewCount = 130;
        bsr = 1450;
        estimatedMonthlySales = 400;
        brand = "FreshKeep";
        sellerType = #easyShip;
        availableStock = 250;
        margin = calculateMargin(8.99, 29.99);
        lastModified = Time.now();
        images = [];
      },
      {
        id = "20";
        productName = "Bamboo Serving Tray";
        asin = "B095317845";
        category = "Home & Kitchen";
        subcategory = "Serveware";
        price = 24.99;
        mrp = 34.99;
        rating = 4.3;
        reviewCount = 90;
        bsr = 1800;
        estimatedMonthlySales = 300;
        brand = "EcoSip";
        sellerType = #sellerFulfilled;
        availableStock = 120;
        margin = calculateMargin(7.99, 24.99);
        lastModified = Time.now();
        images = [];
      },
    ];
  };

  func allFiltersDefault(filters : ProductSearchFilters) : Bool {
    if (
      filters.category != null or
      filters.subcategory != null or
      filters.priceRange != null or
      filters.ratingThreshold != null or
      filters.reviewCountMax != null or
      filters.bsrRange != null or
      filters.monthlyRevenueRange != null
    ) {
      return false;
    };

    not filters.lightweightPreference and
    not filters.nonBrandedFriendly and
    not filters.lowFBACount and
    not filters.highReviewGrowth and
    not filters.highMarginThreshold;
  };

  func applyCategory(product : Product, category : ?Text) : Bool {
    switch (category) {
      case (null) { true };
      case (?cat) { product.category.toLower() == cat.toLower() };
    };
  };

  func applySubcategory(product : Product, subcategory : ?Text) : Bool {
    switch (subcategory) {
      case (null) { true };
      case (?subcat) { product.subcategory.toLower() == subcat.toLower() };
    };
  };

  func applyPriceRange(product : Product, priceRange : ?(Float, Float)) : Bool {
    switch (priceRange) {
      case (null) { true };
      case (?(min, max)) {
        product.price >= min and product.price <= max
      };
    };
  };

  func applyRatingThreshold(product : Product, ratingThreshold : ?Float) : Bool {
    switch (ratingThreshold) {
      case (null) { true };
      case (?threshold) { product.rating >= threshold };
    };
  };

  func applyReviewCountMax(product : Product, reviewCountMax : ?Nat) : Bool {
    switch (reviewCountMax) {
      case (null) { true };
      case (?max) { product.reviewCount <= max };
    };
  };

  func applyBSRRange(product : Product, bsrRange : ?(Nat, Nat)) : Bool {
    switch (bsrRange) {
      case (null) { true };
      case (?(min, max)) {
        product.bsr >= min and product.bsr <= max
      };
    };
  };

  func applyMonthlyRevenueRange(product : Product, monthlyRevenueRange : ?(Float, Float)) : Bool {
    switch (monthlyRevenueRange) {
      case (null) { true };
      case (?(min, max)) {
        let monthlyRevenue = product.price * product.estimatedMonthlySales.toFloat();
        monthlyRevenue >= min and monthlyRevenue <= max
      };
    };
  };

  func applyMarginThreshold(product : Product, highMarginThreshold : Bool) : Bool {
    if (not highMarginThreshold) { true } else { product.margin >= 0.3 };
  };

  func filterProducts(products : [Product], filters : ProductSearchFilters) : [Product] {
    let resultList = List.empty<Product>();

    for (product in products.values()) {
      if (
        applyCategory(product, filters.category) and
        applySubcategory(product, filters.subcategory) and
        applyPriceRange(product, filters.priceRange) and
        applyRatingThreshold(product, filters.ratingThreshold) and
        applyReviewCountMax(product, filters.reviewCountMax) and
        applyBSRRange(product, filters.bsrRange) and
        applyMonthlyRevenueRange(product, filters.monthlyRevenueRange) and
        applyMarginThreshold(product, filters.highMarginThreshold)
      ) {
        resultList.add(product);
      };
    };

    resultList.toArray();
  };

  public query ({ caller }) func searchProducts(filters : ProductSearchFilters) : async ProductSearchResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search products");
    };

    let electronicsProducts = getElectronicsProducts();
    let homeKitchenProducts = getHomeKitchenProducts();

    let allProducts = electronicsProducts.concat(homeKitchenProducts);

    let finalProducts = filterProducts(allProducts, filters);

    #success(finalProducts);
  };

  public query ({ caller }) func getOpportunityScore(productId : Text) : async OpportunityScore {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view opportunity scores");
    };
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { calculateOpportunityScore(product) };
    };
  };

  func calculateOpportunityScore(product : Product) : OpportunityScore {
    let demandScore = calculateDemandScore(product);
    let competitionScore = calculateCompetitionScore(product);
    let growthScore = calculateGrowthScore(product);
    let marginScore = calculateMarginPotential(product);

    let opportunityScore = (demandScore * growthScore * marginScore) / (competitionScore + 1);

    {
      score = opportunityScore;
      demandScore;
      competitionScore;
      growthScore;
      marginScore;
    };
  };

  func calculateDemandScore(product : Product) : Float {
    let bsrScore = if (product.bsr < 1000) { 10.0 } else if (product.bsr < 5000) { 8.0 } else if (product.bsr < 10000) {
      6.0;
    } else { 4.0 };

    let reviewScore = if (product.reviewCount > 1000) { 10.0 } else if (product.reviewCount > 500) {
      8.0;
    } else if (product.reviewCount > 100) { 6.0 } else { 4.0 };

    let salesScore = if (product.estimatedMonthlySales > 1000) { 10.0 } else if (product.estimatedMonthlySales > 500) {
      8.0;
    } else if (product.estimatedMonthlySales > 100) { 6.0 } else { 4.0 };

    (bsrScore + reviewScore + salesScore) / 3.0;
  };

  func calculateCompetitionScore(product : Product) : Float {
    let sellerScore = switch (product.sellerType) {
      case (#fba) { 8.0 };
      case (#easyShip) { 10.0 };
      case (#sellerFulfilled) { 6.0 };
    };

    let brandScore = if (product.brand.size() == 0) { 10.0 } else { 5.0 };

    let reviewScore = if (product.reviewCount < 100) { 10.0 } else if (product.reviewCount < 500) {
      8.0;
    } else if (product.reviewCount < 1000) { 6.0 } else { 4.0 };

    let priceScore = if (product.price < 1000.0) { 10.0 } else if (product.price < 5000.0) {
      8.0;
    } else if (product.price < 10000.0) { 6.0 } else { 4.0 };

    (sellerScore + brandScore + reviewScore + priceScore) / 4.0;
  };

  func calculateGrowthScore(product : Product) : Float {
    let priceScore = if (product.price < 1000.0) { 10.0 } else if (product.price < 5000.0) { 8.0 } else if (product.price < 10000.0) {
      6.0;
    } else { 4.0 };

    let reviewScore = if (product.reviewCount < 100) { 10.0 } else if (product.reviewCount < 500) {
      8.0;
    } else if (product.reviewCount < 1000) { 6.0 } else { 4.0 };

    let salesScore = if (product.estimatedMonthlySales > 1000) { 10.0 } else if (product.estimatedMonthlySales > 500) {
      8.0;
    } else if (product.estimatedMonthlySales > 100) { 6.0 } else { 4.0 };

    (priceScore + reviewScore + salesScore) / 3.0;
  };

  func calculateMarginPotential(product : Product) : Float {
    if (product.margin >= 30.0) { 10.0 } else if (product.margin >= 20.0) {
      8.0;
    } else if (product.margin >= 10.0) { 6.0 } else { 4.0 };
  };

  public type KeywordResearchRequest = {
    searchVolumeEstimate : ?Nat;
    keywordDifficultyScore : ?Float;
    cpcEstimate : ?Float;
    longTailSuggestions : ?[Text];
  };

  public shared ({ caller }) func saveKeywordResearch(request : KeywordResearchRequest) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save keyword research");
    };

    ignore request;
  };

  public type ProductTrend = {
    reviewGrowthSpike : Bool;
    priceIncreaseTrend : Bool;
    seasonalDemandPattern : Bool;
    risingStar : Bool;
  };

  public shared ({ caller }) func saveProductTrends(productId : Text, trend : ProductTrend) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save product trends");
    };

    ignore productId;
    ignore trend;
  };

  public type SellerAnalysisRequest = {
    averagePrice : ?Float;
    averageRating : ?Float;
    averageReviews : ?Nat;
    listingQualityScore : ?Float;
    weaknessDetection : ?[Text];
  };

  public shared ({ caller }) func saveSellerAnalysis(request : SellerAnalysisRequest) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save seller analysis");
    };

    ignore request;
  };

  public shared ({ caller }) func forceProductUpdate() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can force product update");
    };
    await processProductUpdates();
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view all products");
    };
    products.values().toArray();
  };

  public query ({ caller }) func getOpportunityScoreFiltered(filters : OpportunityScoreFilters) : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view opportunities");
    };

    products.values().toArray().filter(
      func(product : Product) : Bool {
        applyOpportunityFilters(product, filters);
      }
    );
  };

  func applyOpportunityFilters(product : Product, filters : OpportunityScoreFilters) : Bool {
    let score = calculateOpportunityScore(product).score;
    if (score < filters.minScore) { return false };
    switch (filters.category) {
      case (null) { true };
      case (?cat) {
        product.category.toLower() == cat.toLower();
      };
    };
  };

  func processProductUpdates() : async () {
    let currentTime = Time.now();
    let _outdatedProducts = products.values().toArray().filter(
      func(product : Product) : Bool {
        currentTime - product.lastModified > 24 * 60 * 60 * 1000000000
      }
    );
  };

  system func timer(setGlobalTimer : Nat64 -> ()) : async () {
    let next = Nat64.fromIntWrap(Time.now()) + 3_600_000_000_000;
    setGlobalTimer(next);
    await processProductUpdates();
  };
};

