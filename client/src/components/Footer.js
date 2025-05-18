import React, { useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './Footer.css';

const Footer = () => {
  // Thêm script DMCA Badge Helper
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://images.dmca.com/Badges/DMCABadgeHelper.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <footer className="mt-auto py-3">
      <Container>
        <Row className="text-center">
          <Col>
            <div className="dmca-badge-container mt-3">
              <a href="https://www.dmca.com/Protection/Status.aspx?ID=8aa85ee5-a9f4-41c9-84bc-2d3003d45773&refurl=https://www.giaolien.com/" title="DMCA.com Protection Status" className="dmca-badge">
                <img src="https://images.dmca.com/Badges/dmca-badge-w150-5x1-07.png?ID=8aa85ee5-a9f4-41c9-84bc-2d3003d45773" alt="DMCA.com Protection Status" />
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 