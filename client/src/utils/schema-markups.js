/**
 * Tập hợp các Schema Markup cho Google Structured Data
 * Theo quy định của Schema.org
 */

/**
 * Tạo Schema WebSite cho trang chủ
 * @returns {Object} Đối tượng schema
 */
export const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Hệ thống Giao Liên",
  "url": "https://www.giaolien.com/",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://www.giaolien.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  "description": "Hệ thống quản lý trò chơi mật thư, quản lý trạm, đội chơi và bảng xếp hạng"
};

/**
 * Tạo Schema SoftwareApplication cho ứng dụng
 * @returns {Object} Đối tượng schema
 */
export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Hệ thống Giao Liên",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Web, Android, iOS",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "VND"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "125"
  }
};

/**
 * Tạo Schema Organization cho tổ chức
 * @returns {Object} Đối tượng schema
 */
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Giao Liên",
  "url": "https://www.giaolien.com",
  "logo": "https://www.giaolien.com/logo192.png",
  "sameAs": [
    "https://www.facebook.com/giaolientcl",
    "https://twitter.com/giaolientcl",
    "https://www.youtube.com/channel/giaolientcl"
  ]
};

/**
 * Tạo Schema FAQPage cho trang FAQ
 * @param {Array} questions - Danh sách câu hỏi và trả lời
 * @returns {Object} Đối tượng schema
 */
export const faqPageSchema = (questions) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": questions.map(q => ({
    "@type": "Question",
    "name": q.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": q.answer
    }
  }))
});

/**
 * Tạo Schema Game cho trò chơi
 * @returns {Object} Đối tượng schema
 */
export const gameSchema = {
  "@context": "https://schema.org",
  "@type": "Game",
  "name": "Trò chơi Mật thư Giao Liên",
  "description": "Trò chơi giải mật thư, tìm kiếm trạm và hoàn thành nhiệm vụ cho các đội chơi",
  "genre": ["Puzzle", "Adventure", "Educational"],
  "numberOfPlayers": {
    "@type": "QuantitativeValue",
    "minValue": 3,
    "maxValue": 10
  },
  "gameLocation": {
    "@type": "Place",
    "name": "Địa điểm ngoài trời",
    "description": "Có thể chơi ở nhiều địa điểm khác nhau, từ trường học đến công viên"
  }
};

/**
 * Tạo Schema BreadcrumbList cho breadcrumb
 * @param {Array} items - Danh sách các mục breadcrumb
 * @returns {Object} Đối tượng schema
 */
export const breadcrumbSchema = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": `https://www.giaolien.com${item.url}`
  }))
}); 