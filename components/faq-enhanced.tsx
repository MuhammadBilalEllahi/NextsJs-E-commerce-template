"use client"

import { useState, useEffect } from "react"
import { Search, HelpCircle, ChevronDown, ChevronRight, Loader2 } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpfulCount: number;
}

interface FAQEnhancedProps {
  productId?: string;
  category?: string;
}

export function FAQEnhanced({ productId, category = "all" }: FAQEnhancedProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(category)
  const [expandedFaqs, setExpandedFaqs] = useState<Set<string>>(new Set())

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "general", label: "General" },
    { value: "products", label: "Products" },
    { value: "shipping", label: "Shipping" },
    { value: "returns", label: "Returns" },
    { value: "payment", label: "Payment" },
    { value: "account", label: "Account" }
  ]

  // Fetch FAQs from backend
  const fetchFAQs = async (cat = selectedCategory, search = searchTerm) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cat && cat !== "all") params.append("category", cat);
      if (search) params.append("search", search);
      
      const response = await fetch(`/api/faqs?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setFaqs(data.faqs);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle FAQ expansion
  const toggleFAQ = (faqId: string) => {
    const newExpanded = new Set(expandedFaqs);
    if (newExpanded.has(faqId)) {
      newExpanded.delete(faqId);
    } else {
      newExpanded.add(faqId);
    }
    setExpandedFaqs(newExpanded);
  };

  // Handle search
  const handleSearch = () => {
    fetchFAQs(selectedCategory, searchTerm);
  };

  // Handle category change
  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory);
    fetchFAQs(newCategory, searchTerm);
  };

  // Load FAQs on mount
  useEffect(() => {
    fetchFAQs(selectedCategory, searchTerm);
  }, []);

  // Handle search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Frequently Asked Questions</h3>
        <p className="text-muted-foreground">
          Find answers to common questions about our products and services
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </div>

      {/* FAQs List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No FAQs found for your search criteria.</p>
            <p className="text-sm">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          faqs.map((faq) => (
            <div key={faq.id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full px-4 py-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <h4 className="font-medium text-left">{faq.question}</h4>
                  </div>
                  {expandedFaqs.has(faq.id) ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              </button>
              
              {expandedFaqs.has(faq.id) && (
                <div className="px-4 pb-4 border-t bg-gray-50">
                  <div className="pt-4 space-y-3">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    
                    {faq.tags && faq.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {faq.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Category: {categories.find(c => c.value === faq.category)?.label}</span>
                      <button className="flex items-center gap-1 hover:text-gray-700">
                        <span>Helpful ({faq.helpfulCount})</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Quick Links */}
      <div className="border-t pt-6">
        <h4 className="font-medium mb-4">Still need help?</h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="text-center p-4 border rounded-lg hover:border-blue-300 transition-colors">
            <h5 className="font-medium mb-2">Contact Support</h5>
            <p className="text-sm text-muted-foreground mb-3">
              Get in touch with our customer service team
            </p>
            <Button variant="outline" size="sm">
              Contact Us
            </Button>
          </div>
          
          <div className="text-center p-4 border rounded-lg hover:border-blue-300 transition-colors">
            <h5 className="font-medium mb-2">Live Chat</h5>
            <p className="text-sm text-muted-foreground mb-3">
              Chat with us in real-time for instant help
            </p>
            <Button variant="outline" size="sm">
              Start Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}







