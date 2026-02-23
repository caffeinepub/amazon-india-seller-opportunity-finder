import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Product {
    id: ProductId;
    bsr: bigint;
    mrp: number;
    title: string;
    subcategory: string;
    estimatedMonthlySales: bigint;
    lastModified: Time;
    sellerType: SellerType;
    availableStock: bigint;
    category: string;
    brand: string;
    margin: number;
    rating: number;
    price: number;
    reviewCount: bigint;
    images: Array<ExternalBlob>;
}
export type ProductSearchResult = {
    __kind__: "error";
    error: string;
} | {
    __kind__: "success";
    success: Array<Product>;
};
export interface ProductTrend {
    risingStar: boolean;
    reviewGrowthSpike: boolean;
    priceIncreaseTrend: boolean;
    seasonalDemandPattern: boolean;
}
export type Time = bigint;
export interface ProductSearchFilters {
    lowFBACount: boolean;
    subcategory?: string;
    nonBrandedFriendly: boolean;
    ratingThreshold?: number;
    priceRange?: [number, number];
    monthlyRevenueRange?: [number, number];
    highMarginThreshold: boolean;
    bsrRange?: [bigint, bigint];
    lightweightPreference: boolean;
    category?: string;
    reviewCountMax?: bigint;
    highReviewGrowth: boolean;
}
export interface SellerAnalysisRequest {
    averagePrice?: number;
    averageReviews?: bigint;
    averageRating?: number;
    weaknessDetection?: Array<string>;
    listingQualityScore?: number;
}
export interface ProductAddRequest {
    bsr: bigint;
    mrp: number;
    title: string;
    subcategory: string;
    estimatedMonthlySales: bigint;
    sellerType: SellerType;
    availableStock: bigint;
    category: string;
    brand: string;
    margin: number;
    rating: number;
    price: number;
    reviewCount: bigint;
    images: Array<ExternalBlob>;
}
export interface OpportunityScoreFilters {
    minScore: number;
    category?: string;
}
export interface OpportunityScore {
    growthScore: number;
    competitionScore: number;
    score: number;
    demandScore: number;
    marginScore: number;
}
export interface KeywordResearchRequest {
    searchVolumeEstimate?: bigint;
    keywordDifficultyScore?: number;
    longTailSuggestions?: Array<string>;
    cpcEstimate?: number;
}
export type ProductId = string;
export interface UserProfile {
    name: string;
    subscriptionTier: SubscriptionTier;
    alertPreferences: Array<string>;
    savedProductLists: Array<string>;
    email: string;
}
export enum SellerType {
    fba = "fba",
    easyShip = "easyShip",
    sellerFulfilled = "sellerFulfilled"
}
export enum SubscriptionTier {
    pro = "pro",
    premium = "premium",
    free = "free"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(productRequest: ProductAddRequest): Promise<ProductId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    forceProductUpdate(): Promise<void>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getOpportunityScore(productId: string): Promise<OpportunityScore>;
    getOpportunityScoreFiltered(filters: OpportunityScoreFilters): Promise<Array<Product>>;
    getProduct(id: ProductId): Promise<Product>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveKeywordResearch(request: KeywordResearchRequest): Promise<void>;
    saveProductTrends(productId: string, trend: ProductTrend): Promise<void>;
    saveSellerAnalysis(request: SellerAnalysisRequest): Promise<void>;
    searchProducts(filters: ProductSearchFilters): Promise<ProductSearchResult>;
}
