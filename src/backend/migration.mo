import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type ProductId = Text;

  type SellerType = {
    #fba;
    #easyShip;
    #sellerFulfilled;
  };

  type UserProfile = {
    name : Text;
    email : Text;
    subscriptionTier : {
      #free;
      #pro;
      #premium;
    };
    savedProductLists : [Text];
    alertPreferences : [Text];
  };

  type OldProduct = {
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
    images : [Storage.ExternalBlob]; // Now typed as ExternalBlob array
  };

  type NewProduct = {
    id : ProductId;
    productName : Text; // title --> productName
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

  type OldActor = {
    products : Map.Map<ProductId, OldProduct>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  type NewActor = {
    products : Map.Map<ProductId, NewProduct>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  func mapProduct(_id : Text, oldProduct : OldProduct) : NewProduct {
    {
      oldProduct with
      productName = oldProduct.title; // Rename title to productName
      asin = ""; // Add empty ASIN field
    };
  };

  // Main migration function
  public func run(old : OldActor) : NewActor {
    let newProducts = old.products.map<ProductId, OldProduct, NewProduct>(mapProduct);
    { old with products = newProducts };
  };
};
