export type Language = "ar" | "en";

export type WorkspaceView = "catalog" | "tracker" | "planner";

export type ServiceCategoryId =
  | "all"
  | "government"
  | "vehicles-finance"
  | "education-career"
  | "digital-personal";

export interface ServiceOption {
  id: string;
  labelAr: string;
  labelEn: string;
  priceDelta: number;
}

export interface MakanakService {
  id: string;
  category: Exclude<ServiceCategoryId, "all">;
  nameAr: string;
  nameEn: string;
  summaryAr: string;
  summaryEn: string;
  priceSar: number;
  turnaroundAr: string;
  turnaroundEn: string;
  iconKey: string;
  accentHex: string;
  requirementsAr: string[];
  requirementsEn: string[];
  stepsAr: string[];
  stepsEn: string[];
  options?: ServiceOption[];
}

export interface BasketItem {
  service: MakanakService;
  quantity: number;
  selectedOptionLabel?: string;
  unitPriceSar: number;
  notes?: string;
}

export interface TrackedOrder {
  orderId: string;
  customerName: string;
  mobile: string;
  city: string;
  contactMethod: "whatsapp" | "phone";
  notes?: string;
  items: {
    serviceId: string;
    serviceNameAr: string;
    serviceNameEn: string;
    quantity: number;
    unitPriceSar: number;
    selectedOptionLabel?: string;
  }[];
  totalSar: number;
  status: "received" | "in_progress" | "completed";
  createdAt: string;
}
