import React, { useState, useEffect } from 'react';
import { Container, Table, Card, Row, Col, Spinner, Badge, Button, Modal, Alert } from 'react-bootstrap';
import AdminNavbar from '../../components/Navbar';
import { submissionApi } from '../../services/api';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { stationApi } from '../../services/api';
import { formatDateTime, replaceStationTerm } from '../../utils/helpers';
import TermReplacer from '../../utils/TermReplacer';

const TeamRanking = () => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetScoresLoading, setResetScoresLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showResetScoresModal, setShowResetScoresModal] = useState(false);
  const [gameName, setGameName] = useState('');

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      setLoading(true);
      const response = await submissionApi.getRanking();
      setRanking(response.data);
      
      // Kiểm tra và đặt tên mật thư nếu có
      if (response.data.length > 0 && 
          response.data[0].completedStations && 
          response.data[0].completedStations.length > 0 &&
          response.data[0].completedStations[0].stationId) {
        
        try {
          const stationResponse = await stationApi.getById(response.data[0].completedStations[0].stationId);
          if (stationResponse.data && stationResponse.data.gameName) {
            setGameName(stationResponse.data.gameName);
          }
        } catch (err) {
          console.error('Error fetching station data for game name:', err);
        }
      }
      
      setError(null);
    } catch (err) {
      setError('Không thể tải bảng xếp hạng. Vui lòng thử lại sau.');
      console.error('Error fetching ranking:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExportLoading(true);
      setError(null);

      // Lấy dữ liệu đã định dạng cho Excel
      const response = await submissionApi.exportRanking();
      const data = response.data;

      // Tạo một workbook mới
      const workbook = new ExcelJS.Workbook();
      
      // Trang tính bảng xếp hạng chung
      const rankingSheet = workbook.addWorksheet('Bảng xếp hạng');
      
      // Thêm header
      rankingSheet.columns = [
        { header: 'Hạng', key: 'Hạng', width: 10 },
        { header: 'Tên đội', key: 'Tên đội', width: 30 },
        { header: 'Tổng điểm', key: 'Tổng điểm', width: 15 },
        { header: replaceStationTerm('Số trạm hoàn thành'), key: replaceStationTerm('Số trạm hoàn thành'), width: 20 },
        { header: 'Thời gian tham gia', key: 'Thời gian tham gia', width: 25 }
      ];
      
      // Làm đậm header
      rankingSheet.getRow(1).font = { bold: true };
      
      // Thêm dữ liệu
      rankingSheet.addRows(data.ranking);

      // Trang tính chi tiết từng đội
      const detailsSheet = workbook.addWorksheet('Chi tiết các đội');
      
      // Thêm dữ liệu chi tiết
      let rowIndex = 1;
      data.teamDetails.forEach(row => {
        const keys = Object.keys(row);
        if (keys.length === 0) {
          // Dòng trống
          detailsSheet.addRow({});
          rowIndex++;
        } else if (keys.includes('Tên đội')) {
          // Header đội
          const headerRow = detailsSheet.addRow({
            A: 'Tên đội',
            B: row['Tên đội'],
            C: 'Tổng điểm',
            D: row['Tổng điểm'],
            E: replaceStationTerm('Số trạm hoàn thành'),
            F: row[replaceStationTerm('Số trạm hoàn thành')]
          });
          headerRow.font = { bold: true };
          headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFCCCCCC' }
          };
          rowIndex++;
          
          // Header cho bảng chi tiết
          const subHeaderRow = detailsSheet.addRow({
            A: 'STT',
            B: 'Tên trạm',
            C: 'Điểm',
            D: 'Thời gian hoàn thành'
          });
          subHeaderRow.font = { bold: true };
          rowIndex++;
        } else {
          // Dòng dữ liệu trạm
          detailsSheet.addRow({
            A: row['STT'],
            B: row['Tên trạm'],
            C: row['Điểm'],
            D: row['Thời gian hoàn thành']
          });
          rowIndex++;
        }
      });
      
      // Điều chỉnh độ rộng cột cho trang chi tiết
      detailsSheet.columns = [
        { width: 10 }, // A
        { width: 30 }, // B
        { width: 15 }, // C
        { width: 25 }, // D
        { width: 20 }, // E
        { width: 20 }  // F
      ];

      // Xuất file
      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = data.gameName 
        ? `Bảng xếp hạng ${data.gameName} ${new Date().toLocaleDateString('vi-VN')}.xlsx`
        : `Bảng xếp hạng trò chơi ${new Date().toLocaleDateString('vi-VN')}.xlsx`;
      
      saveAs(new Blob([buffer]), fileName);
      
      setSuccess('Xuất Excel thành công!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Không thể xuất file Excel. Vui lòng thử lại sau.');
      console.error('Error exporting to Excel:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const handleResetRanking = async () => {
    try {
      setResetLoading(true);
      setError(null);
      
      await submissionApi.resetRanking();
      setShowResetModal(false);
      
      setSuccess('Đã xóa bảng xếp hạng và tất cả đội chơi thành công!');
      
      // Làm mới dữ liệu
      setRanking([]);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError('Không thể xóa bảng xếp hạng. Vui lòng thử lại sau.');
      console.error('Error resetting ranking:', err);
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetScores = async () => {
    try {
      setResetScoresLoading(true);
      setError(null);
      
      const response = await submissionApi.resetScores();
      setShowResetScoresModal(false);
      
      setSuccess(`Đã xóa điểm số và thứ hạng thành công! (${response.data.teamsAffected || 0} đội đã được đặt lại điểm)`);
      
      // Làm mới dữ liệu
      await fetchRanking();
      
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      setError('Không thể xóa điểm số. Vui lòng thử lại sau.');
      console.error('Error resetting scores:', err);
    } finally {
      setResetScoresLoading(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Bảng xếp hạng đội chơi</h1>
          
          <div>
            <Button 
              variant="warning"
              className="me-2"
              onClick={() => setShowResetScoresModal(true)}
              disabled={resetScoresLoading || ranking.length === 0}
              title="Xóa điểm số và thứ hạng, giữ lại đội chơi"
            >
              {resetScoresLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-1" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <i className="bi bi-eraser me-1"></i>
                  Xóa điểm số
                </>
              )}
            </Button>
            
            <Button 
              variant="danger"
              className="me-2"
              onClick={() => setShowResetModal(true)}
              disabled={resetLoading || ranking.length === 0}
            >
              {resetLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-1" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <i className="bi bi-trash me-1"></i>
                  Xóa tất cả
                </>
              )}
            </Button>
            
            <Button 
              variant="success"
              onClick={handleExportExcel}
              disabled={exportLoading || ranking.length === 0}
            >
              {exportLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-1" />
                  Đang xuất...
                </>
              ) : (
                <>
                  <i className="bi bi-file-excel me-1"></i>
                  Xuất Excel
                </>
              )}
            </Button>
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        {gameName && (
          <div className="mb-4">
            <p className="text-primary">{gameName}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Đang tải...</p>
          </div>
        ) : ranking.length === 0 ? (
          <Card className="text-center p-5">
            <Card.Body>
              <h3>Chưa có đội nào hoàn thành trạm</h3>
              <p className="text-muted">
                Bảng xếp hạng sẽ hiển thị khi các đội bắt đầu hoàn thành các trạm
              </p>
            </Card.Body>
          </Card>
        ) : (
          <>
            <Row className="mb-4">
              <Col>

                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Hạng</th>
                          <th>Tên đội</th>
                          <th>Tổng điểm</th>
                          <th><TermReplacer>Trạm đã hoàn thành</TermReplacer></th>
                          <th>Thời gian tham gia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ranking.map((team, index) => (
                          <tr key={team._id}>
                            <td>
                              {index === 0 && <Badge bg="danger" className="rank-badge" style={{fontSize: '1.2rem', padding: '8px 12px', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(192, 192, 192, 0.98)'}}>1</Badge>}
                              {index === 1 && <Badge bg="warning" className="rank-badge" style={{fontSize: '1.1rem', padding: '7px 10px', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(255, 215, 0, 0.5)', color: '#000'}}>2</Badge>}
                              {index === 2 && <Badge bg="secondary" className="rank-badge" style={{fontSize: '1rem', padding: '6px 9px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', color: '#FFE6CC'}}>3</Badge>}
                              {index > 2 && <span className="text-muted">{index + 1}</span>}
                            </td>
                            <td><strong>{team.name}</strong></td>
                            <td>{team.totalScore}</td>
                            <td>{team.completedStations.length}</td>
                            <td>{formatDateTime(team.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
              </Col>
            </Row>

            <h2 className="mb-4"><TermReplacer>Chi tiết trạm hoàn thành</TermReplacer></h2>
            
            {ranking.map(team => (
              <Card key={team._id} className="shadow-sm mb-4">
                <Card.Header>
                  <h4>{team.name} - {team.totalScore} điểm</h4>
                </Card.Header>
                <Card.Body>
                  {team.completedStations.length === 0 ? (
                    <p className="text-muted"><TermReplacer>Chưa hoàn thành trạm nào</TermReplacer></p>
                  ) : (
                    <Table striped bordered responsive>
                      <thead>
                        <tr>
                          <th>STT</th>
                          <th><TermReplacer>Tên trạm</TermReplacer></th>
                          <th>Điểm</th>
                          <th>Thời gian hoàn thành</th>
                        </tr>
                      </thead>
                      <tbody>
                        {team.completedStations.map((station, index) => (
                          <tr key={station._id}>
                            <td>{index + 1}</td>
                            <td>{station.stationName}</td>
                            <td>{station.score}</td>
                            <td>{formatDateTime(station.completedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            ))}
          </>
        )}
        
        {/* Modal xác nhận xóa bảng xếp hạng */}
        <Modal show={showResetModal} onHide={() => setShowResetModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Xác nhận xóa tất cả</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Bạn có chắc chắn muốn xóa toàn bộ bảng xếp hạng không?</p>
            <p className="text-danger fw-bold">Lưu ý: Hành động này sẽ xóa:</p>
            <ul className="text-danger">
              <li><strong>Tất cả đội chơi</strong></li>
              <li>Điểm số và trạm đã hoàn thành</li>
              <li>Lịch sử nộp bài</li>
            </ul>
            <p className="text-danger"><strong>Thao tác này không thể hoàn tác sau khi xác nhận!</strong></p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowResetModal(false)}>
              Hủy
            </Button>
            <Button 
              variant="danger" 
              onClick={handleResetRanking}
              disabled={resetLoading}
            >
              {resetLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
            </Button>
          </Modal.Footer>
        </Modal>
        
        {/* Modal xác nhận xóa điểm số */}
        <Modal show={showResetScoresModal} onHide={() => !resetScoresLoading && setShowResetScoresModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title className="text-warning">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Xóa điểm số
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Bạn có chắc chắn muốn xóa <strong>tất cả điểm số</strong> và <strong>thứ hạng</strong> không?</p>
            <p><strong>Lưu ý:</strong></p>
            <ul>
              <li className="text-danger"><strong>Xóa:</strong> Điểm số và trạm đã hoàn thành</li>
              <li className="text-danger"><strong>Xóa:</strong> Lịch sử nộp bài</li>
            </ul>
            <p className="text-warning"><strong>Thao tác này không thể hoàn tác sau khi xác nhận!</strong></p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowResetScoresModal(false)} disabled={resetScoresLoading}>
              Hủy
            </Button>
            <Button 
              variant="warning" 
              onClick={handleResetScores}
              disabled={resetScoresLoading}
            >
              {resetScoresLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-1" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <i className="bi bi-eraser me-1"></i>
                  Xóa điểm số
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default TeamRanking; 