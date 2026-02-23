import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import List "mo:core/List";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Timer "mo:core/Timer";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

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
    bsr : Nat; // Best Seller Rank
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

  public type AdvancedFilters = {
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

  // User Profile Management Functions
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

  // Product Management Functions
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

  public shared ({ caller }) func searchProductsByCategory(category : Text) : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search products");
    };
    products.values().toArray().filter(
      func(product : Product) : Bool {
        product.category.toLower() == category.toLower();
      }
    );
  };

  public shared ({ caller }) func searchProductsByFilters(filters : AdvancedFilters) : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search products");
    };

    products.values().toArray().filter(
      func(product : Product) : Bool {
        applyPriceRange(product, filters.priceRange) and
        applyRatingThreshold(product, filters.ratingThreshold) and
        applyReviewCountMax(product, filters.reviewCountMax) and
        applyBSRRange(product, filters.bsrRange) and
        applyMarginThreshold(product, filters.highMarginThreshold)
      }
    );
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
      case (?threshold) { product.rating <= threshold };
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

  func applyMarginThreshold(product : Product, highMarginThreshold : Bool) : Bool {
    if (not highMarginThreshold) { true } else { product.margin >= 0.3 };
  };

  public shared ({ caller }) func getOpportunityScore(productId : Text) : async OpportunityScore {
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

    // Implementation would store keyword research data
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

  public shared ({ caller }) func getAllProducts() : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view all products");
    };
    products.values().toArray();
  };

  public query ({ caller }) func getOpportunities(category : Text) : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view opportunities");
    };
    products.values().toArray().filter(
      func(product : Product) : Bool {
        product.category.toLower() == category.toLower();
      }
    );
  };

  func processProductUpdates() : async () {
    let currentTime = Time.now();
    let _outdatedProducts = products.values().toArray().filter(
      func(product : Product) : Bool {
        currentTime - product.lastModified > 24 * 60 * 60 * 1000000000
      }
    );
    // Process updates for outdated products
  };

  // System initialization
  system func timer(setGlobalTimer : Nat64 -> ()) : async () {
    let next = Nat64.fromIntWrap(Time.now()) + 3_600_000_000_000; // 1 hour
    setGlobalTimer(next);
    await processProductUpdates();
  };
};
