import React from 'react';
import { Helmet } from 'react-helmet';
import { generateMetaKeywords } from '../utils/seo-keywords';

/**
 * Component SEO giúp tối ưu hóa thẻ meta cho trang
 * @param {Object} props - Props của component
 * @param {string} props.title - Tiêu đề trang
 * @param {string} props.description - Mô tả trang
 * @param {string} props.pageName - Tên trang để lấy từ khóa
 * @param {string} props.canonicalUrl - URL chính thức của trang (tùy chọn)
 * @param {string} props.imageUrl - URL hình ảnh cho thẻ og:image (tùy chọn)
 */
const SEOHelmet = ({ 
  title, 
  description, 
  pageName,
  canonicalUrl,
  imageUrl = '/logo192.png'
}) => {
  // Tạo chuỗi từ khóa dựa trên trang
  const keywords = generateMetaKeywords(pageName);
  
  // URL chính thức mặc định
  const defaultCanonical = `https://www.giaolien.com/${pageName === 'home' ? '' : pageName}`;
  
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
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Hệ thống Giao Liên",
          "url": "https://www.giaolien.com/",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.giaolien.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEOHelmet; 