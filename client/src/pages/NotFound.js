import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

const NotFound = () => {
  return (
    <Container className="mt-5 text-center">
      <Row>
        <Col>
          <h1 className="display-1">404</h1>
          <h2 className="mb-4">Trang không tồn tại</h2>
          <p className="lead mb-4">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
          <Button as={Link} to="/" variant="primary" size="lg">
            Trở về trang chủ
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound; 