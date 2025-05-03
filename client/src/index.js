import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { LanguageProvider } from './context/LanguageContext';
import { BrowserRouter as Router } from 'react-router-dom';

// Khởi tạo thư viện AOS cho hiệu ứng cuộn
AOS.init({
  duration: 800,
  easing: 'ease-in-out',
  once: false,
  mirror: true
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </Router>
  </React.StrictMode>
);

// Gửi dữ liệu web vitals đến Google Analytics
reportWebVitals(({ name, delta, value, id }) => {
  // Thay YOUR_MEASUREMENT_ID bằng ID đo lường thực tế của bạn
  window.gtag && window.gtag('event', name, {
    value: delta,
    metric_id: id,
    metric_value: value,
    metric_delta: delta,
    metric_category: 'Web Vitals'
  });
});
