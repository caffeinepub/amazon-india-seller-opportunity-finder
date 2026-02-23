import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Iter "mo:core/Iter";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Migration "migration";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

(with migration = Migration.run)
actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type ProductId = Text;

  public type Product = {
    id : ProductId;
    productName : Text;
    asin : Text;
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
    productName : Text;
    asin : Text;
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
        id = "E001";
        productName = "boAt Airdopes 141 Bluetooth Truly Wireless in Ear Earbuds";
        asin = "B09B8MPT6T";
        category = "Electronics";
        subcategory = "Audio";
        price = 1499.0;
        mrp = 2999.0;
        rating = 4.2;
        reviewCount = 85000;
        bsr = 1;
        estimatedMonthlySales = 5000;
        brand = "boAt";
        sellerType = #fba;
        availableStock = 10000;
        margin = calculateMargin(700.0, 1499.0);
        lastModified = Time.now();
        images = [];
      },
      {
        id = "E002";
        productName = "Safari Thorium 55 Cms Hardsided Check-in Luggage";
        asin = "B07N9R8HRL";
        category = "Home & Kitchen";
        subcategory = "Luggage";
        price = 2199.0;
        mrp = 3499.0;
        rating = 4.4;
        reviewCount = 12000;
        bsr = 3;
        estimatedMonthlySales = 800;
        brand = "Safari";
        sellerType = #easyShip;
        availableStock = 5000;
        margin = calculateMargin(1000.0, 2199.0);
        lastModified = Time.now();
        images = [];
      },
      {
        id = "E003";
        productName = "Mi 10000mAH Li-Polymer Power Bank 3i with 18W Fast Charging";
        asin = "B08JHQS98L";
        category = "Electronics";
        subcategory = "Mobile Accessories";
        price = 999.0;
        mrp = 1499.0;
        rating = 4.3;
        reviewCount = 120000;
        bsr = 5;
        estimatedMonthlySales = 15000;
        brand = "Mi";
        sellerType = #fba;
        availableStock = 30000;
        margin = calculateMargin(600.0, 999.0);
        lastModified = Time.now();
        images = [];
      },
      {
        id = "E004";
        productName = "Philips HD4928/01 2100-Watt Induction Cooktop";
        asin = "B071XKTR3X";
        category = "Home & Kitchen";
        subcategory = "Appliances";
        price = 2499.0;
        mrp = 3995.0;
        rating = 4.2;
        reviewCount = 47000;
        bsr = 7;
        estimatedMonthlySales = 2000;
        brand = "Philips";
        sellerType = #fba;
        availableStock = 6000;
        margin = calculateMargin(1400.0, 2499.0);
        lastModified = Time.now();
        images = [];
      },
      {
        id = "E005";
        productName = "Sony MDR-ZX110A On-Ear Stereo Headphones";
        asin = "B00M1NEUKK";
        category = "Electronics";
        subcategory = "Audio";
        price = 599.0;
        mrp = 1390.0;
        rating = 4.1;
        reviewCount = 60000;
        bsr = 10;
        estimatedMonthlySales = 8000;
        brand = "Sony";
        sellerType = #fba;
        availableStock = 12000;
        margin = calculateMargin(200.0, 599.0);
        lastModified = Time.now();
        images = [];
      },
      {
        id = "E006";
        productName = "Pigeon by Stovekraft Amaze Plus Electric Kettle (1.5 L)";
        asin = "B07Z2M7H6Y";
        category = "Home & Kitchen";
        subcategory = "Appliances";
        price = 479.0;
        mrp = 1665.0;
        rating = 4.2;
        reviewCount = 13000;
        bsr = 12;
        estimatedMonthlySales = 2500;
        brand = "Pidilite";
        sellerType = #easyShip;
        availableStock = 8000;
        margin = calculateMargin(200.0, 479.0);
        lastModified = Time.now();
        images = [];
      },
      {
        id = "E007";
        productName = "Philips GC1905 1440-Watt Steam Iron with Spray";
        asin = "B0086ZTQ3W";
        category = "Home & Kitchen";
        subcategory = "Appliances";
        price = 1699.0;
        mrp = 2595.0;
        rating = 4.3;
        reviewCount = 2920;
        bsr = 15;
        estimatedMonthlySales = 1500;
        brand = "Philips";
        sellerType = #fba;
        availableStock = 4000;
        margin = calculateMargin(800.0, 1699.0);
        lastModified = Time.now();
        images = [];
      },
      {
        id = "E008";
        productName = "HP 100 Wired USB Mouse with 1600 DPI Optical Sensor";
        asin = "B08DRZTNRJ";
        category = "Electronics";
        subcategory = "Computer Accessories";
        price = 249.0;
        mrp = 540.0;
        rating = 4.4;
        reviewCount = 87000;
        bsr = 22;
        estimatedMonthlySales = 20000;
        brand = "HP";
        sellerType = #fba;
        availableStock = 35000;
        margin = calculateMargin(100.0, 249.0);
        lastModified = Time.now();
        images = [];
      },
    ];
  };

  func getHomeKitchenProducts() : [Product] {
    [
      {
        id = "4";
        productName = "Borosil Glass Food Storage Container Set 500ml - Pack of 4";
        asin = "B07SMPNHTW";
        category = "Home & Kitchen";
        subcategory = "Food Storage";
        price = 299.0;
        mrp = 499.0;
        rating = 4.5;
        reviewCount = 25000;
        bsr = 32;
        estimatedMonthlySales = 5000;
        brand = "Borosil";
        sellerType = #fba;
        availableStock = 10000;
        margin = calculateMargin(120.0, 299.0);
        lastModified = Time.now();
        images = [];
      },
      {
        id = "5";
        productName = "Milton Thermosteel Flip Lid Flask, 350ml, Silver";
        asin = "B072VVMFFQ";
        category = "Home & Kitchen";
        subcategory = "Drinkware";
        price = 349.0;
        mrp = 599.0;
        rating = 4.3;
        reviewCount = 14560;
        bsr = 16;
        estimatedMonthlySales = 4800;
        brand = "Milton";
        sellerType = #fba;
        availableStock = 12000;
        margin = calculateMargin(150.0, 349.0);
        lastModified = Time.now();
        images = [];
      },
      {
        id = "6";
        productName = "Solimo Non-Stick Fry Pan (20 cm), Induction & Gas Compatible";
        asin = "B076W53H4S";
        category = "Home & Kitchen";
        subcategory = "Kitchen";
        price = 269.0;
        mrp = 595.0;
        rating = 4.4;
        reviewCount = 11200;
        bsr = 20;
        estimatedMonthlySales = 3000;
        brand = "Amazon Brand - Solimo";
        sellerType = #fba;
        availableStock = 7000;
        margin = calculateMargin(100.0, 269.0);
        lastModified = Time.now();
        images = [];
      },
      {
        id = "7";
        productName = "Pigeon Stainless Steel Knife Set (Set of 6)";
        asin = "B07DX3CQJX";
        category = "Home & Kitchen";
        subcategory = "Kitchen";
        price = 189.0;
        mrp = 299.0;
        rating = 4.2;
        reviewCount = 9300;
        bsr = 25;
        estimatedMonthlySales = 2500;
        brand = "Pigeon";
        sellerType = #fba;
        availableStock = 6000;
        margin = calculateMargin(80.0, 189.0);
        lastModified = Time.now();
        images = [];
      },
      {
        id = "8";
        productName = "Amazon Brand - Solimo Plastic Storage Container Set";
        asin = "B07S62T6G8";
        category = "Home & Kitchen";
        subcategory = "Food Storage";
        price = 229.0;
        mrp = 399.0;
        rating = 4.3;
        reviewCount = 12828;
        bsr = 18;
        estimatedMonthlySales = 4000;
        brand = "Amazon Brand - Solimo";
        sellerType = #fba;
        availableStock = 8500;
        margin = calculateMargin(90.0, 229.0);
        lastModified = Time.now();
        images = [];
      },
      {
        id = "9";
        productName = "Checkered Beans Ethnic Cropped Top";
        asin = "B09TJK9ZJM";
        category = "Fashion";
        subcategory = "Apparel";
        price = 499.0;
        mrp = 1499.0;
        rating = 4.0;
        reviewCount = 1800;
        bsr = 50;
        estimatedMonthlySales = 1200;
        brand = "Checkered Beans";
        sellerType = #easyShip;
        availableStock = 3200;
        margin = calculateMargin(200.0, 499.0);
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

  func isValidASIN(asin : Text) : Bool {
    asin.size() == 10;
  };

  func isValidProductName(productName : Text) : Bool {
    productName.size() > 0;
  };

  func isValidPrice(price : Float) : Bool {
    price > 0.0 and price < 100000.0;
  };

  func validateProductData(product : Product) : Bool {
    isValidProductName(product.productName) and
    isValidASIN(product.asin) and
    isValidPrice(product.price);
  };

  func logValidationError(product : Product) {
    if (not isValidProductName(product.productName)) {
      Runtime.trap("Invalid productName for product ID: " # product.id);
    };
    if (not isValidASIN(product.asin)) {
      Runtime.trap("Invalid ASIN for product ID: " # product.id);
    };
    if (not isValidPrice(product.price)) {
      Runtime.trap("Invalid price for product ID: " # product.id);
    };
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

    for (product in allProducts.values()) {
      if (not validateProductData(product)) {
        logValidationError(product);
      };
    };

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
