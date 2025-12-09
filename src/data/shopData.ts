export interface Product {
  id: string;
  name: string;
  category: 'supplements' | 'accessories' | 'merchandise' | 'nutrition';
  price: number;
  rating: number;
  imageUrl: string;
  description: string;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export const categories: Category[] = [
  { id: 'supplements', name: 'Supplements', icon: '💊', count: 8 },
  { id: 'accessories', name: 'Accessories', icon: '🏋️', count: 7 },
  { id: 'merchandise', name: 'Merchandise', icon: '👕', count: 6 },
  { id: 'nutrition', name: 'Nutrition', icon: '🥜', count: 5 },
];

export const products: Product[] = [
  // Supplements
  {
    id: '1',
    name: 'Whey Protein Isolate',
    category: 'supplements',
    price: 49.99,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=300&h=300&fit=crop',
    description: 'Premium whey protein isolate for muscle recovery',
    tags: ['protein', 'muscle', 'recovery'],
  },
  {
    id: '2',
    name: 'Creatine Monohydrate',
    category: 'supplements',
    price: 29.99,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=300&h=300&fit=crop',
    description: 'Pure creatine for strength and power',
    tags: ['strength', 'power', 'muscle'],
  },
  {
    id: '3',
    name: 'Pre-Workout Energy',
    category: 'supplements',
    price: 39.99,
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=300&h=300&fit=crop',
    description: 'Explosive energy for intense workouts',
    tags: ['energy', 'focus', 'pump'],
  },
  {
    id: '4',
    name: 'BCAA Recovery',
    category: 'supplements',
    price: 34.99,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1609096458733-95b38583ac4e?w=300&h=300&fit=crop',
    description: 'Branch chain amino acids for recovery',
    tags: ['recovery', 'amino', 'endurance'],
  },
  // Accessories
  {
    id: '5',
    name: 'Lifting Gloves Pro',
    category: 'accessories',
    price: 24.99,
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&h=300&fit=crop',
    description: 'Premium leather lifting gloves with wrist support',
    tags: ['gloves', 'grip', 'protection'],
  },
  {
    id: '6',
    name: 'Resistance Bands Set',
    category: 'accessories',
    price: 19.99,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=300&h=300&fit=crop',
    description: 'Set of 5 resistance bands for home workouts',
    tags: ['bands', 'stretch', 'mobility'],
  },
  {
    id: '7',
    name: 'Premium Shaker Bottle',
    category: 'accessories',
    price: 14.99,
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=300&h=300&fit=crop',
    description: 'Leak-proof shaker with mixing ball',
    tags: ['shaker', 'bottle', 'mixing'],
  },
  {
    id: '8',
    name: 'Foam Roller',
    category: 'accessories',
    price: 29.99,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=300&h=300&fit=crop',
    description: 'High-density foam roller for muscle recovery',
    tags: ['recovery', 'mobility', 'massage'],
  },
  // Merchandise
  {
    id: '9',
    name: 'Gym T-Shirt',
    category: 'merchandise',
    price: 29.99,
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
    description: 'Breathable cotton blend workout t-shirt',
    tags: ['tshirt', 'cotton', 'comfort'],
  },
  {
    id: '10',
    name: 'Premium Hoodie',
    category: 'merchandise',
    price: 54.99,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop',
    description: 'Warm and stylish gym hoodie',
    tags: ['hoodie', 'warm', 'style'],
  },
  {
    id: '11',
    name: 'Training Joggers',
    category: 'merchandise',
    price: 44.99,
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=300&h=300&fit=crop',
    description: 'Comfortable joggers for training and casual wear',
    tags: ['joggers', 'comfort', 'training'],
  },
  {
    id: '12',
    name: 'Gym Towel',
    category: 'merchandise',
    price: 12.99,
    rating: 4.4,
    imageUrl: 'https://images.unsplash.com/photo-1585237672814-8f85a8118bf6?w=300&h=300&fit=crop',
    description: 'Quick-dry microfiber gym towel',
    tags: ['towel', 'quick-dry', 'essential'],
  },
  // Nutrition
  {
    id: '13',
    name: 'Protein Bars (12 Pack)',
    category: 'nutrition',
    price: 34.99,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&h=300&fit=crop',
    description: 'High-protein, low-sugar snack bars',
    tags: ['protein', 'snack', 'convenient'],
  },
  {
    id: '14',
    name: 'Natural Peanut Butter',
    category: 'nutrition',
    price: 12.99,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1600189261867-30e5ffe7b8da?w=300&h=300&fit=crop',
    description: '100% natural peanut butter, no added sugar',
    tags: ['peanut', 'natural', 'healthy'],
  },
  {
    id: '15',
    name: 'Steel Cut Oats',
    category: 'nutrition',
    price: 8.99,
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=300&h=300&fit=crop',
    description: 'Premium steel cut oats for sustained energy',
    tags: ['oats', 'breakfast', 'energy'],
  },
  {
    id: '16',
    name: 'Electrolyte Mix',
    category: 'nutrition',
    price: 24.99,
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=300&h=300&fit=crop',
    description: 'Zero-sugar electrolyte powder for hydration',
    tags: ['hydration', 'electrolytes', 'recovery'],
  },
];
