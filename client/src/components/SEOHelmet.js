import React from 'react';
import { Helmet } from 'react-helmet';
import { generateMetaKeywords } from '../utils/seo-keywords';
import { seoKeywords } from '../utils/seo-keywords';

/**
 * Component SEO giúp tối ưu hóa thẻ meta cho trang
 * @param {Object} props - Props của component
 * @param {string} props.title - Tiêu đề trang
 * @param {string} props.description - Mô tả trang
 * @param {string} props.pageName - Tên trang để lấy từ khóa
 * @param {string} props.canonicalUrl - URL chính thức của trang (tùy chọn)
 * @param {string} props.imageUrl - URL hình ảnh cho thẻ og:image (tùy chọn)
 * @param {Array} props.additionalKeywords - Từ khóa bổ sung (tùy chọn)
 * @param {string} props.seasonType - Loại mùa để thêm từ khóa theo mùa (tùy chọn - 'summer', 'schoolYear', 'holiday')
 * @param {string} props.industryType - Loại lĩnh vực để thêm từ khóa ngành (tùy chọn - 'education', 'corporate', 'community')
 */
const SEOHelmet = ({ 
  title, 
  description, 
  pageName,
  canonicalUrl,
  imageUrl = '/logo192.png',
  additionalKeywords = [],
  seasonType,
  industryType
}) => {
  // Tạo chuỗi từ khóa dựa trên trang
  let keywords = generateMetaKeywords(pageName);
  
  // Thêm từ khóa theo mùa nếu được chỉ định
  if (seasonType && seoKeywords.seasonal && seoKeywords.seasonal[seasonType]) {
    const seasonalKeywords = seoKeywords.seasonal[seasonType].join(', ');
    keywords = `${keywords}, ${seasonalKeywords}`;
  }
  
  // Thêm từ khóa theo ngành nếu được chỉ định
  if (industryType && seoKeywords.industry && seoKeywords.industry[industryType]) {
    const industryKeywords = seoKeywords.industry[industryType].join(', ');
    keywords = `${keywords}, ${industryKeywords}`;
  }
  
  // Thêm từ khóa bổ sung
  if (additionalKeywords.length > 0) {
    keywords = `${keywords}, ${additionalKeywords.join(', ')}`;
  }
  
  // URL chính thức mặc định
  const defaultCanonical = `https://www.giaolien.com/${pageName === 'home' ? '' : pageName}`;
  
  // Chuẩn bị schema markup dựa trên loại trang
  let schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Hệ thống Giao Liên",
    "url": "https://www.giaolien.com/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.giaolien.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
  
  // Thêm schema BreadcrumbList
  const breadcrumbItems = [];
  
  // Thêm trang chủ cho breadcrumb
  breadcrumbItems.push({
    "@type": "ListItem",
    "position": 1,
    "name": "Trang chủ",
    "item": "https://www.giaolien.com/"
  });
  
  // Nếu không phải trang chủ, thêm trang hiện tại
  if (pageName !== 'home') {
    breadcrumbItems.push({
      "@type": "ListItem",
      "position": 2,
      "name": title,
      "item": canonicalUrl || defaultCanonical
    });
  }
  
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems
  };
  
  return (
    <Helmet>
      {/* Tiêu đề cơ bản */}
      <title>{title} | Hệ thống Giao Liên</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl || defaultCanonical} />
      
      {/* Open Graph tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl || defaultCanonical} />
      <meta property="og:image" content={`https://www.giaolien.com${imageUrl}`} />
      <meta property="og:site_name" content="Giao Liên" />
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`https://www.giaolien.com${imageUrl}`} />
      
      {/* Cấu trúc dữ liệu cho Google */}
      <script type="application/ld+json">
        {JSON.stringify(schemaMarkup)}
      </script>
      
      {/* Breadcrumb Schema */}
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </Helmet>
  );
};

export default SEOHelmet; 