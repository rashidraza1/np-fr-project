import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


// High-quality stock images corresponding to specific product titles
const productImageMap: Record<string, string> = {
  "RSI Payment Solutions": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80",
  "RSI Queue Management System": "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80",
  "RSI Customer Feedback System": "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=600&q=80",
  "RSI Performance Management System": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
  "RSI AI Chatbot": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80",
};

const defaultImage = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80";

// Backend API response interfaces
interface ApiProduct {
  TableID: string;
  Title: string;
  IsActive: string;
}

interface Product {
  id: string;
  title: string;
  image: string;
  path: string;
  isActive: boolean;
}

const ProductSelection: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        // Using provided API endpoint with querystring
        const url =
          "https://rsidemos.com/rsiusp/webservice/?class=general&action=RSIGeneralProducts&WebServiceUserName=WebserviceUser&Password=oqkq12345234";

        // Required API payload
        const payload = {
          SecretKey: "TWpBeU5pOHdNaTh3TWc9PQ==",
          Lang: "en",
          UserID: "10007",
        };

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.status === "SUCCESS" && data.data && data.data.RecordListing) {
          const apiProducts: ApiProduct[] = data.data.RecordListing;

          // Map backend data to local frontend models
          const formattedProducts = apiProducts.map((p) => {
            // Determine route based on title/ID
            const path = p.Title.includes("Payment")
              ? "/dashboard"
              : `/dashboard/product-${p.TableID}`;

            // Map image by title or fallback to a gorgeous default
            const image = productImageMap[p.Title] || defaultImage;

            return {
              id: p.TableID,
              title: p.Title,
              image: image,
              path: path,
              isActive: p.IsActive === "1",
            };
          });

          setProducts(formattedProducts);
        } else {
          setError("Failed to load products from API.");
        }
      } catch (err) {
        console.error("API error:", err);
        setError("Error connecting to server. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-white flex flex-col items-center pb-8 transition-all duration-700 animate-in fade-in slide-in-from-bottom-4">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-[120px]" />
        <div className="absolute top-[60%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-50/50 blur-[120px]" />
      </div>

      {/* Full Width Hero Image */}
      <div className="w-full mb-12 sm:mb-16 relative z-10">
        <div className="relative group w-full">
          <div className="absolute inset-0 bg-blue-400/10 blur-3xl rounded-full transform scale-90 group-hover:scale-100 transition-transform duration-700 opacity-30" />
          <img
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1600&h=400&q=80"
            alt="Unified Platform"
            className="relative w-full h-56 sm:h-72 lg:h-80 object-cover shadow-xl border-y border-white/20 transform transition-all duration-700"
          />
        </div>
      </div>

      <div className="max-w-5xl w-full mx-auto px-6 sm:px-10 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center mb-4 px-4 py-1.5 rounded-full bg-blue-50/80 border border-blue-200/50 text-blue-600 text-xs sm:text-sm font-bold tracking-widest uppercase shadow-sm backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
            Welcome Back
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 transition-all hover:scale-[1.01] duration-300 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-blue-800 to-indigo-900">
            RSI Unified Software Platform
          </h1>
          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Please select the software module you would like to use.
          </p>
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center text-red-500 font-semibold bg-red-50 p-6 rounded-2xl border border-red-100">
            {error}
          </div>
        )}

        {/* Responsive Grid */}
        {!isLoading && !error && (
          <>
            <div className="mb-8 flex items-center gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                Our Solutions
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
              {products.map((product) => {
                const isDisabled = !product.isActive;

                return (
                  <div
                    key={product.id}
                    onClick={() => !isDisabled && navigate(product.path)}
                    role={isDisabled ? "presentation" : "button"}
                    tabIndex={isDisabled ? -1 : 0}
                    aria-disabled={isDisabled}
                    aria-label={`Select ${product.title}`}
                    onKeyDown={(e) => {
                      if (!isDisabled && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        navigate(product.path);
                      }
                    }}
                    className={`relative bg-white/70 backdrop-blur-md rounded-3xl overflow-hidden transform transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${isDisabled
                      ? "opacity-60 cursor-not-allowed grayscale border border-slate-200/60 shadow-sm"
                      : "group cursor-pointer hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 border border-blue-100 shadow-lg shadow-slate-200/50"
                      }`}
                  >
                    {/* Image Container with hover scale effect */}
                    <div className="h-32 sm:h-36 w-full overflow-hidden bg-slate-100 relative border-b border-slate-100">
                      {/* Subtle overlay on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 z-10 ${!isDisabled ? "group-hover:opacity-100" : ""
                        }`} />

                      {isDisabled && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-100/30 backdrop-blur-[2px]">
                          <div className="bg-white/80 p-2 rounded-full shadow-sm text-slate-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                        </div>
                      )}

                      <img
                        src={product.image}
                        alt={product.title}
                        loading="lazy"
                        className={`w-full h-full object-cover transform transition-transform duration-700 ease-out ${!isDisabled ? "group-hover:scale-110" : ""
                          }`}
                      />
                    </div>

                    {/* Card Content */}
                    <div className="p-6 relative bg-transparent">
                      <div className="flex items-center justify-between">
                        <h2 className={`text-xl font-bold text-slate-800 transition-colors duration-300 ${!isDisabled ? "group-hover:text-blue-600" : ""
                          }`}>
                          {product.title}
                        </h2>

                        {/* Arrow Icon that appears on hover */}
                        {!isDisabled && (
                          <div className="transform opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out bg-blue-50 p-2 rounded-full">
                            <svg
                              className="w-5 h-5 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      {!isDisabled && (
                        <p className="mt-2 text-sm text-slate-500 font-medium">Click to access dashboard</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductSelection;
