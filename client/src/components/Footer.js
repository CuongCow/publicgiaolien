import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="mt-auto py-3">
      <Container>
        <Row className="text-center">
          <Col>
            <div className="dmca-badge-container mt-3">
              <a href="https://www.dmca.com/Protection/Status.aspx?ID=8aa85ee5-a9f4-41c9-84bc-2d3003d45773" 
                 title="DMCA.com Protection Status" 
                 className="dmca-badge"
                 target="_blank" 
                 rel="noopener noreferrer">
                <img src="https://images.dmca.com/Badges/dmca-badge-w150-5x1-07.png?ID=8aa85ee5-a9f4-41c9-84bc-2d3003d45773" 
                     alt="DMCA.com Protection Status" 
                     width="150" 
                     height="50" />
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 