import { useState, useMemo, memo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Star,
  ShoppingCart,
  Plus,
} from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { products, categories, type Product } from "@/data/shopData";

const Shop = memo(() => {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);

  const accentStyle = {
    backgroundColor: `hsl(${accentColor.hue}, ${accentColor.saturation}%, ${accentColor.lightness}%)`,
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleAddToCart = (product: Product) => {
    setCartCount((prev) => prev + 1);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  const categoryVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 400, damping: 20 },
    },
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/profile")}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </motion.button>
            <div className="text-center flex-1 px-4">
              <h1 className="text-xl font-bold text-foreground">
                Shop & Supplements
              </h1>
              <p className="text-xs text-muted-foreground">
                Buy supplements, accessories, merch & nutrition from your gym.
              </p>
            </div>
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-muted"
            >
              <ShoppingCart className="h-5 w-5 text-foreground" />
              {cartCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={accentStyle}
                >
                  {cartCount}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl bg-muted border-0"
            />
          </div>
        </motion.div>

        <div className="p-4 space-y-6">
          {/* Categories */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Categories
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {categories.map((category) => (
                <motion.div key={category.id} variants={categoryVariants}>
                  <GlassCard
                    hover
                    onClick={() =>
                      setSelectedCategory(
                        selectedCategory === category.id ? null : category.id
                      )
                    }
                    className={`p-4 cursor-pointer transition-all ${
                      selectedCategory === category.id
                        ? "ring-2 ring-primary"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col items-center text-center gap-2">
                      <span className="text-3xl">{category.icon}</span>
                      <span className="font-medium text-foreground text-sm">
                        {category.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {category.count} items
                      </span>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Products Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-foreground">
                {selectedCategory
                  ? categories.find((c) => c.id === selectedCategory)?.name
                  : "All Products"}
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredProducts.length} items
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <p className="text-muted-foreground">No products found</p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                  <motion.div key={product.id} variants={itemVariants}>
                    <GlassCard hover className="overflow-hidden">
                      {/* Product Image */}
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                          loading="lazy"
                        />
                        <Badge
                          variant="secondary"
                          className="absolute top-2 left-2 text-xs capitalize"
                        >
                          {product.category}
                        </Badge>
                      </div>

                      {/* Product Info */}
                      <div className="p-3 space-y-2">
                        <h3 className="font-medium text-foreground text-sm line-clamp-2 leading-tight">
                          {product.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-muted-foreground">
                            {product.rating}
                          </span>
                        </div>

                        {/* Price & Add to Cart */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="font-bold text-foreground">
                            ${product.price.toFixed(2)}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleAddToCart(product)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-white transition-shadow hover:shadow-lg"
                            style={accentStyle}
                          >
                            <Plus className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
});

Shop.displayName = "Shop";

export default Shop;
