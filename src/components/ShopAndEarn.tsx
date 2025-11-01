import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  ExternalLink, 
  Gift, 
  Users, 
  Crown, 
  Tag,
  TrendingUp,
  BookOpen,
  Sparkles
} from "lucide-react";
import bookCover from "@/assets/book-cover.jpg";

export const ShopAndEarn = () => {
  const affiliateProducts = [
    {
      title: "Rules of the Road - Official Textbook",
      description: "Complete driving education textbook",
      price: "¥2,800",
      image: bookCover,
      link: "https://www.amazon.co.jp/s?k=Rules+of+the+Road+Textbook",
      commission: "Up to 5% commission",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
          Shop & Earn
        </h2>
        <p className="text-lg text-muted-foreground">Get study materials and earn rewards</p>
      </div>

      {/* Featured Products Carousel */}
      <Card className="border-4 border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-amber-600" />
            <div>
              <CardTitle className="text-2xl">Featured Products</CardTitle>
              <CardDescription>Best-selling study materials</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {affiliateProducts.map((product, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-6 p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl">
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-full md:w-40 h-48 object-cover rounded-lg shadow-md"
                />
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-bold">{product.title}</h3>
                    <p className="text-muted-foreground">{product.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-green-500 text-white text-lg px-3 py-1">{product.price}</Badge>
                    <Badge variant="outline" className="text-amber-600 border-amber-400">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {product.commission}
                    </Badge>
                  </div>
                  <Button asChild size="lg" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                    <a href={product.link} target="_blank" rel="noopener noreferrer">
                      Buy Now <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Premium Features */}
      <Card className="border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Crown className="h-8 w-8 text-purple-600" />
            <div>
              <CardTitle className="text-2xl">Premium Subscription</CardTitle>
              <CardDescription>Unlock advanced features and AI-powered practice</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-600"></div>
              <span className="font-medium">Unlimited AI-generated questions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-600"></div>
              <span className="font-medium">Personalized study plans</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-600"></div>
              <span className="font-medium">Advanced progress analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-600"></div>
              <span className="font-medium">Priority support</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-purple-600">¥980</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <Button size="lg" className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700">
            Upgrade to Premium <Crown className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Referral Program */}
      <Card className="border-2 border-blue-300 dark:border-blue-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <CardTitle className="text-2xl">Referral Program</CardTitle>
              <CardDescription>Earn commissions by sharing</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Share this app with friends and earn <span className="font-bold text-blue-600">10% commission</span> on their premium subscriptions and textbook purchases!
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Gift className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="font-bold">Share</p>
              <p className="text-sm text-muted-foreground">Send your link</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="font-bold">They Buy</p>
              <p className="text-sm text-muted-foreground">Friend purchases</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="font-bold">You Earn</p>
              <p className="text-sm text-muted-foreground">10% commission</p>
            </div>
          </div>
          <Button size="lg" className="w-full" variant="outline">
            Get Your Referral Link <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Special Offers */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Tag className="h-8 w-8 text-red-600" />
            <div>
              <CardTitle className="text-2xl">Special Offers & Bundles</CardTitle>
              <CardDescription>Limited-time deals</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border-2 border-dashed border-red-300">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">Starter Bundle</h3>
                <p className="text-muted-foreground mb-2">Textbook + 3 Months Premium</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-red-600">¥5,500</span>
                  <Badge variant="destructive">Save 25%</Badge>
                </div>
              </div>
              <Button size="lg" className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700">
                Get Bundle <ShoppingCart className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
