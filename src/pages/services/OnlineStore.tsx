import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, MapPin, Phone, Mail, Eye, Plus } from 'lucide-react';
import { toast } from 'sonner';
import MembershipGuard from '@/components/membership/MembershipGuard';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  condition: string;
  location?: string;
  contact_phone?: string;
  contact_email?: string;
  images: string[];
  views: number;
  created_at: string;
  user_id: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

const OnlineStore = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('posting_fee_paid', true)
        .eq('is_sold', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(product => ({
        ...product,
        images: Array.isArray(product.images) ? product.images as string[] : []
      }));
      
      setProducts(transformedData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleViewProduct = async (productId: string) => {
    try {
      await supabase.rpc('increment_product_views', { product_id: productId });
      // Update local state
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, views: p.views + 1 } : p
      ));
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesPrice = priceRange === 'all' || 
                        (priceRange === 'under-10000' && product.price < 10000) ||
                        (priceRange === '10000-50000' && product.price >= 10000 && product.price <= 50000) ||
                        (priceRange === 'over-50000' && product.price > 50000);
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const formatPrice = (price: number, currency: string = 'CFA') => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' ' + currency;
  };

  const handlePostProduct = () => {
    navigate('/my-account?tab=products');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <MembershipGuard requiredFeature="canAccessShop">
      <Layout>
        <PremiumBanner
          title="Online Store"
          description="Buy and sell products directly with other Elverra members"
          backgroundImage="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        />

        <div className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header with Post Product Button */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Browse Products</h1>
                <p className="text-gray-600">Discover items posted by Elverra Global members</p>
              </div>
              <Button onClick={handlePostProduct} className="mt-4 sm:mt-0">
                <Plus className="w-4 h-4 mr-2" />
                Post Product
              </Button>
            </div>

            {/* Search and Filters */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search & Filter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Price Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="under-10000">Under 10,000 CFA</SelectItem>
                      <SelectItem value="10000-50000">10,000 - 50,000 CFA</SelectItem>
                      <SelectItem value="over-50000">Over 50,000 CFA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Search className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery || selectedCategory !== 'all' || priceRange !== 'all' 
                      ? 'Try adjusting your search criteria' 
                      : 'Be the first to post a product!'
                    }
                  </p>
                  <Button onClick={handlePostProduct}>
                    <Plus className="w-4 h-4 mr-2" />
                    Post First Product
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="aspect-square bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                        {product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-gray-400">No Image</div>
                        )}
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{product.category}</Badge>
                        <Badge variant="outline">{product.condition}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-2 mb-3">
                        {product.description}
                      </CardDescription>
                      
                      <div className="space-y-2 mb-4">
                        <div className="text-2xl font-bold text-primary">
                          {formatPrice(product.price, product.currency)}
                        </div>
                        
                        {product.location && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-1" />
                            {product.location}
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <Eye className="w-4 h-4 mr-1" />
                          {product.views} views
                        </div>
                      </div>

                      <div className="space-y-2">
                        {product.contact_phone && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              handleViewProduct(product.id);
                              window.open(`tel:${product.contact_phone}`, '_self');
                            }}
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Call Seller
                          </Button>
                        )}
                        
                        {product.contact_email && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              handleViewProduct(product.id);
                              window.open(`mailto:${product.contact_email}`, '_self');
                            }}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Email Seller
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>
      </Layout>
    </MembershipGuard>
  );
};

export default OnlineStore;