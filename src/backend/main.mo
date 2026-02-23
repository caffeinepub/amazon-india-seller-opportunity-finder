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

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type ProductId = Text;

  public type Product = {
    id : ProductId;
    title : Text;
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
    title : Text;
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

    let id = productRequest.title.concat(Time.now().toText());

    let product : Product = {
      id;
      title = productRequest.title;
      category = productRequest.category;
      subcategory = productRequest.subcategory;
      price = productRequest.price;
      mrp = productRequest.mrp;
      rating = productRequest.rating;
      reviewCount = productRequest.reviewCount;
      bsr = productRequest.bsr;
      estimatedMonthlySales = productRequest.estimatedMonthlySales;
      brand = productRequest.brand;
      sellerType = productRequest.sellerType;
      availableStock = productRequest.availableStock;
      margin = productRequest.margin;
      lastModified = Time.now();
      images = productRequest.images;
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

  public query func searchProducts(filters : ProductSearchFilters) : async ProductSearchResult {
    // No authorization check - available to all users including guests
    // This allows potential customers to explore products before signing up

    if (allFiltersDefault(filters)) {
      return #success(getSeedProducts());
    };

    let filteredProducts = getSeedProducts().filter(
      func(p) {
        let categoryMatch = applyCategory(p, filters.category);
        let subcategoryMatch = applySubcategory(p, filters.subcategory);
        let priceRangeMatch = applyPriceRange(p, filters.priceRange);
        let ratingThresholdMatch = applyRatingThreshold(p, filters.ratingThreshold);
        let reviewCountMatch = applyReviewCountMax(p, filters.reviewCountMax);
        let bsrRangeMatch = applyBSRRange(p, filters.bsrRange);
        let monthlyRevenueMatch = applyMonthlyRevenueRange(p, filters.monthlyRevenueRange);
        let marginThresholdMatch = applyMarginThreshold(p, filters.highMarginThreshold);

        categoryMatch and subcategoryMatch and priceRangeMatch and ratingThresholdMatch and reviewCountMatch and bsrRangeMatch and monthlyRevenueMatch and marginThresholdMatch;
      }
    );

    #success(filteredProducts);
  };

  func getSeedProducts() : [Product] {
    [
      {
        id = "1";
        title = "Wireless Headphones";
        category = "Electronics";
        subcategory = "Audio";
        price = 199.99;
        mrp = 249.99;
        rating = 4.5;
        reviewCount = 1200;
        bsr = 800;
        estimatedMonthlySales = 500;
        brand = "SoundCore";
        sellerType = #fba;
        availableStock = 300;
        margin = 0.25;
        lastModified = Time.now();
        images = [];
      },
      {
        id = "2";
        title = "Stainless Steel Water Bottle";
        category = "Home & Kitchen";
        subcategory = "Drinkware";
        price = 29.99;
        mrp = 39.99;
        rating = 4.7;
        reviewCount = 900;
        bsr = 1500;
        estimatedMonthlySales = 800;
        brand = "EcoSip";
        sellerType = #easyShip;
        availableStock = 450;
        margin = 0.32;
        lastModified = Time.now();
        images = [];
      },
      {
        id = "3";
        title = "Yoga Mat";
        category = "Sports";
        subcategory = "Yoga";
        price = 49.99;
        mrp = 59.99;
        rating = 4.6;
        reviewCount = 1100;
        bsr = 1000;
        estimatedMonthlySales = 650;
        brand = "FlexFit";
        sellerType = #fba;
        availableStock = 200;
        margin = 0.28;
        lastModified = Time.now();
        images = [];
      },
      {
        id = "4";
        title = "Bluetooth Speaker";
        category = "Electronics";
        subcategory = "Audio";
        price = 89.99;
        mrp = 119.99;
        rating = 4.4;
        reviewCount = 850;
        bsr = 900;
        estimatedMonthlySales = 400;
        brand = "SoundWave";
        sellerType = #easyShip;
        availableStock = 250;
        margin = 0.27;
        lastModified = Time.now();
        images = [];
      },
      {
        id = "5";
        title = "Insulated Lunch Box";
        category = "Home & Kitchen";
        subcategory = "Food Storage";
        price = 34.99;
        mrp = 49.99;
        rating = 4.5;
        reviewCount = 700;
        bsr = 1400;
        estimatedMonthlySales = 600;
        brand = "FreshKeep";
        sellerType = #fba;
        availableStock = 300;
        margin = 0.3;
        lastModified = Time.now();
        images = [];
      },
      {
        id = "6";
        title = "Resistance Bands";
        category = "Sports";
        subcategory = "Fitness";
        price = 19.99;
        mrp = 29.99;
        rating = 4.7;
        reviewCount = 950;
        bsr = 1100;
        estimatedMonthlySales = 700;
        brand = "FlexFit";
        sellerType = #easyShip;
        availableStock = 400;
        margin = 0.35;
        lastModified = Time.now();
        images = [];
      },
      {
        id = "7";
        title = "Smart LED Bulb";
        category = "Electronics";
        subcategory = "Lighting";
        price = 39.99;
        mrp = 54.99;
        rating = 4.3;
        reviewCount = 800;
        bsr = 1200;
        estimatedMonthlySales = 450;
        brand = "BrightLife";
        sellerType = #fba;
        availableStock = 300;
        margin = 0.29;
        lastModified = Time.now();
        images = [];
      },
      {
        id = "8";
        title = "Eco-Friendly Straws";
        category = "Home & Kitchen";
        subcategory = "Drinkware";
        price = 14.99;
        mrp = 19.99;
        rating = 4.6;
        reviewCount = 600;
        bsr = 1600;
        estimatedMonthlySales = 350;
        brand = "EcoSip";
        sellerType = #sellerFulfilled;
        availableStock = 150;
        margin = 0.36;
        lastModified = Time.now();
        images = [];
      },
      {
        id = "9";
        title = "Exercise Ball";
        category = "Sports";
        subcategory = "Fitness";
        price = 29.99;
        mrp = 39.99;
        rating = 4.5;
        reviewCount = 650;
        bsr = 1300;
        estimatedMonthlySales = 500;
        brand = "FlexFit";
        sellerType = #easyShip;
        availableStock = 200;
        margin = 0.31;
        lastModified = Time.now();
        images = [];
      },
      {
        id = "10";
        title = "USB-C Charger";
        category = "Electronics";
        subcategory = "Mobile Accessories";
        price = 24.99;
        mrp = 34.99;
        rating = 4.4;
        reviewCount = 400;
        bsr = 800;
        estimatedMonthlySales = 350;
        brand = "PowerPro";
        sellerType = #fba;
        availableStock = 120;
        margin = 0.28;
        lastModified = Time.now();
        images = [];
      },
      {
        id = "11";
        title = "Collapsible Food Containers";
        category = "Home & Kitchen";
        subcategory = "Food Storage";
        price = 29.99;
        mrp = 39.99;
        rating = 4.6;
        reviewCount = 700;
        bsr = 1250;
        estimatedMonthlySales = 400;
        brand = "FreshKeep";
        sellerType = #fba;
        availableStock = 250;
        margin = 0.32;
        lastModified = Time.now();
        images = [];
      },
      {
        id = "12";
        title = "Adjustable Dumbbells";
        category = "Sports";
        subcategory = "Fitness";
        price = 89.99;
        mrp = 119.99;
        rating = 4.4;
        reviewCount = 650;
        bsr = 950;
        estimatedMonthlySales = 250;
        brand = "FlexFit";
        sellerType = #easyShip;
        availableStock = 120;
        margin = 0.27;
        lastModified = Time.now();
        images = [];
      },
      {
        id = "13";
        title = "Waterproof Bluetooth Speaker";
        category = "Electronics";
        subcategory = "Audio";
        price = 69.99;
        mrp = 99.99;
        rating = 4.7;
        reviewCount = 1200;
        bsr = 1350;
        estimatedMonthlySales = 700;
        brand = "SoundWave";
        sellerType = #fba;
        availableStock = 400;
        margin = 0.36;
        lastModified = Time.now();
        images = [];
      },
      {
        id = "14";
        title = "Smart Water Bottle";
        category = "Home & Kitchen";
        subcategory = "Drinkware";
        price = 54.99;
        mrp = 79.99;
        rating = 4.5;
        reviewCount = 400;
        bsr = 700;
        estimatedMonthlySales = 350;
        brand = "EcoSip";
        sellerType = #fba;
        availableStock = 120;
        margin = 0.27;
        lastModified = Time.now();
        images = [];
      },
      {
        id = "15";
        title = "Wireless Earbuds";
        category = "Electronics";
        subcategory = "Audio";
        price = 129.99;
        mrp = 199.99;
        rating = 4.6;
        reviewCount = 950;
        bsr = 1050;
        estimatedMonthlySales = 600;
        brand = "SoundCore";
        sellerType = #easyShip;
        availableStock = 320;
        margin = 0.32;
        lastModified = Time.now();
        images = [];
      },
      {
        id = "16";
        title = "Travel Lunch Box";
        category = "Home & Kitchen";
        subcategory = "Food Storage";
        price = 44.99;
        mrp = 64.99;
        rating = 4.7;
        reviewCount = 1200;
        bsr = 1400;
        estimatedMonthlySales = 650;
        brand = "FreshKeep";
        sellerType = #easyShip;
        availableStock = 420;
        margin = 0.36;
        lastModified = Time.now();
        images = [];
      },
      {
        id = "17";
        title = "Digital Yoga Mat";
        category = "Sports";
        subcategory = "Yoga";
        price = 149.99;
        mrp = 199.99;
        rating = 4.6;
        reviewCount = 1200;
        bsr = 950;
        estimatedMonthlySales = 450;
        brand = "FlexFit";
        sellerType = #easyShip;
        availableStock = 140;
        margin = 0.29;
        lastModified = Time.now();
        images = [];
      },
      {
        id = "18";
        title = "Solar Power Bank";
        category = "Electronics";
        subcategory = "Mobile Accessories";
        price = 49.99;
        mrp = 69.99;
        rating = 4.4;
        reviewCount = 650;
        bsr = 1200;
        estimatedMonthlySales = 550;
        brand = "PowerPro";
        sellerType = #fba;
        availableStock = 240;
        margin = 0.31;
        lastModified = Time.now();
        images = [];
      },
      {
        id = "19";
        title = "Eco Stainless Steel Bottles";
        category = "Home & Kitchen";
        subcategory = "Drinkware";
        price = 39.99;
        mrp = 54.99;
        rating = 4.5;
        reviewCount = 500;
        bsr = 1350;
        estimatedMonthlySales = 500;
        brand = "EcoSip";
        sellerType = #easyShip;
        availableStock = 200;
        margin = 0.34;
        lastModified = Time.now();
        images = [];
      },
      {
        id = "20";
        title = "Bluetooth Weighted Jump Rope";
        category = "Sports";
        subcategory = "Fitness";
        price = 44.99;
        mrp = 59.99;
        rating = 4.8;
        reviewCount = 1300;
        bsr = 1000;
        estimatedMonthlySales = 800;
        brand = "FlexFit";
        sellerType = #fba;
        availableStock = 420;
        margin = 0.36;
        lastModified = Time.now();
        images = [];
      },
    ];
  };

  func allFiltersDefault(filters : ProductSearchFilters) : Bool {
    filters.category == null and
    filters.subcategory == null and
    filters.priceRange == null and
    filters.ratingThreshold == null and
    filters.reviewCountMax == null and
    filters.bsrRange == null and
    filters.monthlyRevenueRange == null and
    not filters.lightweightPreference and
    not filters.nonBrandedFriendly and
    not filters.lowFBACount and
    not filters.highReviewGrowth and
    not filters.highMarginThreshold
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
