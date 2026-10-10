export const PRODUCTS = [
  {
    id: "laptop",
    name: "Alder 14 Laptop",
    category: "Computers",
    price: 72990,
    rating: 4.7,
    description:
      "A compact 14-inch laptop for classes and studio work. 16 GB memory, all-day battery, and a quiet keyboard.",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "headphones",
    name: "Harbor Wireless Headphones",
    category: "Audio",
    price: 12990,
    rating: 4.6,
    description:
      "Over-ear headphones with clear mids, a long-lasting battery, and a fold-flat case for commuting.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "watch",
    name: "Field Smart Watch",
    category: "Wearables",
    price: 16499,
    rating: 4.4,
    description:
      "Track workouts, sleep, and campus reminders. Water-resistant with a week of typical use.",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "keyboard",
    name: "Quill Mechanical Keyboard",
    category: "Accessories",
    price: 8499,
    rating: 4.8,
    description:
      "Tactile switches, warm backlight, and a compact layout that leaves room for a notebook.",
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "mouse",
    name: "Drift Wireless Mouse",
    category: "Accessories",
    price: 2499,
    rating: 4.5,
    description:
      "A quiet, precise mouse with a USB-C receiver and a shape that stays comfortable during long study sessions.",
    image:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "backpack",
    name: "Summit Day Backpack",
    category: "Bags",
    price: 3499,
    rating: 4.6,
    description:
      "Padded laptop sleeve, bottle pocket, and a weather-resistant shell for wet walks across campus.",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "phone",
    name: "Cedar Smartphone",
    category: "Phones",
    price: 54999,
    rating: 4.3,
    description:
      "A balanced phone with a sharp display, reliable cameras, and software updates for several years.",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "speaker",
    name: "Cove Bluetooth Speaker",
    category: "Audio",
    price: 4999,
    rating: 4.5,
    description:
      "Room-filling sound in a small body. Pair quickly and keep the playlist going through a full afternoon.",
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "camera",
    name: "Lumen Mirrorless Camera",
    category: "Photo",
    price: 89990,
    rating: 4.7,
    description:
      "Compact interchangeable-lens camera for travel, events, and class projects. 4K video included.",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "controller",
    name: "Arcade Gaming Controller",
    category: "Gaming",
    price: 5499,
    rating: 4.4,
    description:
      "Low-latency wireless controller with textured grips and mappable rear buttons.",
    image:
      "https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "monitor",
    name: "Studio 27 Display",
    category: "Computers",
    price: 22990,
    rating: 4.6,
    description:
      "A 27-inch IPS display with thin bezels and accurate color for design work and late-night coding.",
    image:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "shoes",
    name: "Ridge Runner Shoes",
    category: "Footwear",
    price: 7999,
    rating: 4.5,
    description:
      "Everyday running shoes with a cushioned sole and a knit upper. A simple pair for campus walks and short workouts.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "webcam",
    name: "ClearCast Webcam",
    category: "Accessories",
    price: 6499,
    rating: 4.2,
    description:
      "1080p webcam with an auto-framing sensor and a privacy shutter for interviews and lectures.",
    image:
      "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?auto=format&fit=crop&w=1200&q=80",
  },
];

export function getProduct(id) {
  return PRODUCTS.find((item) => item.id === id);
}

export const CATEGORIES = ["All", ...new Set(PRODUCTS.map((item) => item.category))];
