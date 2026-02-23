import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  public type OldProduct = {
    id : Text;
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
    sellerType : {
      #fba;
      #easyShip;
      #sellerFulfilled;
    };
    availableStock : Nat;
    margin : Float;
    lastModified : Time.Time;
    images : [Storage.ExternalBlob];
  };

  public type OldOpportunityScore = {
    score : Float;
    demandScore : Float;
    competitionScore : Float;
    growthScore : Float;
    marginScore : Float;
  };

  public type OldActor = {
    products : Map.Map<Text, OldProduct>;
    userProfiles : Map.Map<Principal, {
      name : Text;
      email : Text;
      subscriptionTier : {
        #free;
        #pro;
        #premium;
      };
      savedProductLists : [Text];
      alertPreferences : [Text];
    }>;
  };

  public type NewActor = OldActor;

  public func run(old : OldActor) : NewActor {
    old;
  };
};
