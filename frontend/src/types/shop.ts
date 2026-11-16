
export interface FoodItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
}

export interface Shop {
  id: number;
  name: string;
  description: string | null;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  items: FoodItem[];
}
