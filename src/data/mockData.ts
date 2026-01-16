import { Shop, Product } from '@/types';

export const shops: Shop[] = [
  {
    id: 'shop_1',
    name: 'రాజు కిరాణా స్టోర్',
    type: 'కిరాణా',
    typeEnglish: 'Grocery',
    isOpen: true,
  },
  {
    id: 'shop_2',
    name: 'లక్ష్మి హోటల్',
    type: 'హోటల్',
    typeEnglish: 'Restaurant',
    isOpen: true,
  },
  {
    id: 'shop_3',
    name: 'వెంకట మెడికల్స్',
    type: 'మెడికల్',
    typeEnglish: 'Medical',
    isOpen: false,
  },
];

export const products: Record<string, Product[]> = {
  shop_1: [
    { id: 'p1_1', shopId: 'shop_1', name: 'బియ్యం (1 కేజీ)', price: 55, inStock: true, unit: 'కేజీ' },
    { id: 'p1_2', shopId: 'shop_1', name: 'పప్పు (500 గ్రా)', price: 85, inStock: true, unit: '500గ్రా' },
    { id: 'p1_3', shopId: 'shop_1', name: 'నూనె (1 లీ)', price: 145, inStock: true, unit: 'లీటర్' },
    { id: 'p1_4', shopId: 'shop_1', name: 'చక్కెర (1 కేజీ)', price: 45, inStock: true, unit: 'కేజీ' },
    { id: 'p1_5', shopId: 'shop_1', name: 'ఉప్పు (1 కేజీ)', price: 25, inStock: true, unit: 'కేజీ' },
    { id: 'p1_6', shopId: 'shop_1', name: 'మిర్చి పొడి (100 గ్రా)', price: 35, inStock: false, unit: '100గ్రా' },
    { id: 'p1_7', shopId: 'shop_1', name: 'పసుపు (50 గ్రా)', price: 20, inStock: true, unit: '50గ్రా' },
    { id: 'p1_8', shopId: 'shop_1', name: 'టీ పొడి (250 గ్రా)', price: 120, inStock: true, unit: '250గ్రా' },
  ],
  shop_2: [
    { id: 'p2_1', shopId: 'shop_2', name: 'ఇడ్లీ (4 పీసెస్)', price: 30, inStock: true },
    { id: 'p2_2', shopId: 'shop_2', name: 'దోస', price: 35, inStock: true },
    { id: 'p2_3', shopId: 'shop_2', name: 'వడ (2 పీసెస్)', price: 25, inStock: true },
    { id: 'p2_4', shopId: 'shop_2', name: 'పూరీ (4 పీసెస్)', price: 40, inStock: true },
    { id: 'p2_5', shopId: 'shop_2', name: 'చాయ్', price: 10, inStock: true },
    { id: 'p2_6', shopId: 'shop_2', name: 'బిర్యానీ', price: 120, inStock: false },
    { id: 'p2_7', shopId: 'shop_2', name: 'అన్నం + సాంబార్', price: 50, inStock: true },
  ],
  shop_3: [
    { id: 'p3_1', shopId: 'shop_3', name: 'పారాసిటమాల్', price: 15, inStock: true },
    { id: 'p3_2', shopId: 'shop_3', name: 'ORS పొడి', price: 25, inStock: true },
    { id: 'p3_3', shopId: 'shop_3', name: 'బ్యాండేజ్', price: 30, inStock: true },
  ],
};

export function getShopById(id: string): Shop | undefined {
  return shops.find(shop => shop.id === id);
}

export function getProductsByShopId(shopId: string): Product[] {
  return products[shopId] || [];
}
