export interface Bottle {
    id: number;
    name: string;
    brand: string | null;
    flavor_profile: string | null;
    spirit_type_id: number;
    spirit_type?: { id: number; name: string };
    capacity_ml: number;
    image_url: string | null;
    barcode: string | null;
  }
