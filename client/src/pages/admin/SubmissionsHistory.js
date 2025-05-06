import React, { useState, useEffect } from 'react';
import { Container, Table, Card, Row, Col, Form, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import AdminNavbar from '../../components/Navbar';
import { submissionApi, stationApi } from '../../services/api';
import { formatDateTime, replaceStationTerm } from '../../utils/helpers';
import TermReplacer from '../../utils/TermReplacer';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useLanguage } from '../../context/LanguageContext';

const SubmissionsHistory = () => {
  const [submissions, setSubmissions] = useState([]);
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [stationFilter, setStationFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [uniqueStations, setUniqueStations] = useState([]);
  const [uniqueTeams, setUniqueTeams] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [stationsData, setStationsData] = useState({}); // Lưu trữ thông tin trạm dựa vào ID
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Thiết lập cập nhật tự động mỗi 1 giây
    let intervalId;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchData(false); // Truyền false để không hiển thị loading spinner mỗi lần cập nhật
      }, 1000);
    }
    
    // Xóa interval khi component unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh]);

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      // Lấy danh sách tất cả các trạm (sẽ cần để map ID với tên)
      const stationsResponse = await stationApi.getAll();
      const stationsById = {};
      
      stationsResponse.data.forEach(station => {
        stationsById[station._id] = {
          id: station._id,
          name: station.name || `Trạm ${station._id.substring(0, 6)}...`
        };
      });
      
      // console.log('Stations data loaded:', Object.keys(stationsById).length);
      setStationsData(stationsById);
      
      // Lấy submissions
      const submissionsResponse = await submissionApi.getAll();
      
      // Thêm tên trạm vào mỗi submission dựa trên stationId
      const enrichedSubmissions = submissionsResponse.data.map(sub => {
        // Nếu submission đã có stationName thì giữ nguyên
        if (sub.stationName) {
          return sub;
        }
        
        // Nếu không có stationName, thử lấy từ danh sách trạm đã tải
        if (sub.stationId && stationsById[sub.stationId]) {
          return {
            ...sub,
            stationName: stationsById[sub.stationId].name
          };
        }
        
        // Trường hợp không tìm thấy thông tin trạm, tạo tên mặc định
        return {
          ...sub,
          stationName: sub.stationId ? `Trạm ${sub.stationId.substring(0, 6)}...` : 'Không rõ trạm'
        };
      });
      
      // console.log('Submissions enriched:', enrichedSubmissions.length);
      setSubmissions(enrichedSubmissions);
      setLastUpdated(new Date());
      
      // Trích xuất danh sách trạm duy nhất từ submissions đã làm phong phú
      const uniqueStationsList = [];
      const stationIds = new Set();
      
      enrichedSubmissions.forEach(sub => {
        if (sub.stationId && !stationIds.has(sub.stationId)) {
          stationIds.add(sub.stationId);
          uniqueStationsList.push({
            id: sub.stationId,
            name: sub.stationName
          });
        }
      });
      
      // console.log('Unique stations extracted:', uniqueStationsList.length);
      setUniqueStations(uniqueStationsList);
      
      // Lấy danh sách đội duy nhất
      const teams = [...new Set(enrichedSubmissions.map(sub => sub.teamName).filter(Boolean))];
      setUniqueTeams(teams);
      
      setError(null);
    } catch (err) {
      // Chỉ hiển thị lỗi nếu không phải đang cập nhật tự động
      if (showLoading) {
        setError(t('load_data_error'));
      }
      console.error('Error fetching data:', err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Xuất lịch sử trả lời ra Excel
  const exportToExcel = async () => {
    try {
      setExportLoading(true);
      setError(null);

      // Tạo workbook mới
      const workbook = new ExcelJS.Workbook();
      
      // Tạo worksheet
      const worksheet = workbook.addWorksheet('Lịch sử trả lời');
      
      // Thiết lập header
      worksheet.columns = [
        { header: 'Thời gian', key: 'time', width: 20 },
        { header: 'Đội', key: 'team', width: 25 },
        { header: replaceStationTerm('Trạm'), key: 'station', width: 25 },
        { header: 'Đáp án đã gửi', key: 'answer', width: 40 },
        { header: 'Kết quả', key: 'result', width: 15 },
      ];
      
      // Đặt style cho header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      
      // Lọc dữ liệu nếu có filter
      const dataToExport = filteredSubmissions;
      
      // Thêm dữ liệu
      dataToExport.forEach(submission => {
        worksheet.addRow({
          time: formatDateTime(submission.timestamp),
          team: submission.teamName,
          station: submission.stationName,
          answer: submission.answer,
          result: submission.isCorrect ? 'Đúng' : 'Sai',
        });
      });
      
      // Format cho các ô
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          // Format kết quả đúng/sai
          const resultCell = row.getCell(5);
          if (resultCell.value === 'Đúng') {
            resultCell.font = { color: { argb: 'FF008000' }, bold: true };
          } else if (resultCell.value === 'Sai') {
            resultCell.font = { color: { argb: 'FFFF0000' } };
          }
          
          // Đặt viền cho các ô
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
        }
      });
      
      // Xuất file
      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `Lịch_sử_trả_lời_${new Date().toLocaleDateString('vi-VN')}.xlsx`;
      
      saveAs(new Blob([buffer]), fileName);
      
      setSuccess(t('export_excel_success'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(t('export_excel_error'));
      console.error('Error exporting to Excel:', err);
    } finally {
      setExportLoading(false);
    }
  };

  // Lọc submissions dựa trên các bộ lọc đã chọn
  const filteredSubmissions = submissions.filter(submission => {
    return (
      (stationFilter === '' || (submission.stationId && submission.stationId === stationFilter)) &&
      (teamFilter === '' || (submission.teamName && submission.teamName === teamFilter))
    );
  });

  // Lấy tên trạm dựa vào stationId
  const getStationName = (stationId) => {
    if (!stationId) return 'N/A';
    
    // Kiểm tra nếu có trong danh sách trạm đã tải
    if (stationsData[stationId]) {
      return stationsData[stationId].name;
    }
    
    // Tìm trong danh sách submissions
    const found = submissions.find(sub => sub.stationId === stationId && sub.stationName);
    if (found) {
      return found.stationName;
    }
    
    // Mặc định trả về ID rút gọn nếu không tìm thấy tên
    return `Trạm ${stationId.substring(0, 6)}...`;
  };

  // Hàm xóa tất cả dữ liệu lịch sử trả lời
  const deleteAllSubmissions = async () => {
    try {
      setDeleteLoading(true);
      setError(null);
      
      // Gọi API để xóa dữ liệu (chỉ xóa submissions, không ảnh hưởng đến teams)
      const response = await submissionApi.deleteAllSubmissions();
      
      // Cập nhật giao diện
      setSubmissions([]);
      setUniqueStations([]);
      setUniqueTeams([]);
      
      // Thông báo thành công
      setSuccess(`Đã xóa ${response.data.deletedCount || 'tất cả'} bản ghi lịch sử trả lời thành công!`);
      setTimeout(() => setSuccess(null), 5000);
      
      // Đóng modal xác nhận
      setShowDeleteModal(false);
    } catch (err) {
      setError('Không thể xóa dữ liệu. Vui lòng thử lại sau.');
      console.error('Error deleting submissions:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <Container className="py-4 pt-3 mt-2">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">{t('submissions_history_heading')}</h1>
          
          <div>
            <Button 
              variant={autoRefresh ? "secondary" : "outline-secondary"} 
              className="me-2"
              onClick={() => setAutoRefresh(!autoRefresh)}
              title={autoRefresh ? t('stop_auto_refresh') : t('start_auto_refresh')}
            >
              <i className={`bi bi-${autoRefresh ? 'pause-circle' : 'play-circle'}`}></i>
              {autoRefresh ? t('stop_auto_refresh') : t('start_auto_refresh')}
            </Button>
            
            <Button
              variant="danger"
              className="me-2"
              onClick={() => setShowDeleteModal(true)}
              disabled={deleteLoading || submissions.length === 0}
              title={t('delete_all_submissions')}
            >
              <i className="bi bi-trash me-1"></i>
              {t('delete_all_submissions')}
            </Button>
            
            <Button 
              variant="success" 
              onClick={exportToExcel}
              disabled={exportLoading || filteredSubmissions.length === 0}
            >
              {exportLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-1" />
                  {t('exporting')}
                </>
              ) : (
                <>
                  <i className="bi bi-file-excel me-1"></i>
                  {t('export_excel')}
                </>
              )}
            </Button>
          </div>
        </div>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        {lastUpdated && (
          <div className="text-muted mb-2 d-flex align-items-center">
            <small>
              <i className="bi bi-clock me-1"></i>
              {t('last_updated')} {formatDateTime(lastUpdated)}
              {autoRefresh && <span className="ms-2"><Spinner animation="border" size="sm" style={{ width: '1rem', height: '1rem' }} /></span>}
            </small>
          </div>
        )}
        
        <Card className="mb-4">
          <Card.Body>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label><TermReplacer>{t('filter_by_station')}</TermReplacer></Form.Label>
                  <Form.Control 
                    as="select" 
                    value={stationFilter} 
                    onChange={(e) => {
                      console.log('Selected station:', e.target.value);
                      setStationFilter(e.target.value);
                    }}
                  >
                    <option value="">{t('all_stations')}</option>
                    {uniqueStations.map((station) => (
                      <option key={station.id} value={station.id}>
                        {station.name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('filter_by_team')}</Form.Label>
                  <Form.Control 
                    as="select" 
                    value={teamFilter} 
                    onChange={(e) => setTeamFilter(e.target.value)}
                  >
                    <option value="">{t('all_teams')}</option>
                    {uniqueTeams.map((team) => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              
              <Col md={4} className="d-flex align-items-end">
                <Button 
                  variant="secondary" 
                  className="mb-3"
                  onClick={() => {
                    setStationFilter('');
                    setTeamFilter('');
                  }}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  {t('clear_filters')}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        
        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">{t('loading_data')}</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <Card className="text-center p-5">
            <Card.Body>
              <h3>{t('no_results')}</h3>
              <p className="text-muted">
                {t('no_submissions_found')}
              </p>
            </Card.Body>
          </Card>
        ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>{t('team')}</th>
                    <th><TermReplacer>{t('stations')}</TermReplacer></th>
                    <th>{t('input')}</th>
                    <th>{t('result')}</th>
                    <th>{t('time')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission._id}>
                      <td>{submission.teamName || 'N/A'}</td>
                      <td>
                        <TermReplacer>
                          {submission.stationName || getStationName(submission.stationId) || 'N/A'}
                        </TermReplacer>
                      </td>
                      <td>{submission.answer || 'N/A'}</td>
                      <td>
                        {submission.isCorrect ? (
                          <span className="text-success">
                            <i className="bi bi-check-circle-fill me-1"></i>
                            {t('correct')}
                          </span>
                        ) : (
                          <span className="text-danger">
                            <i className="bi bi-x-circle-fill me-1"></i>
                            {t('incorrect')}
                          </span>
                        )}
                      </td>
                      <td>{formatDateTime(submission.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
        )}
        
        {/* Modal xác nhận xóa */}
        <Modal show={showDeleteModal} onHide={() => !deleteLoading && setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title className="text-danger">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {t('delete_submissions_title')}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p dangerouslySetInnerHTML={{ __html: t('delete_submissions_confirm') }}></p>
            <p className="text-danger">
              <strong>{t('warning')}:</strong> {t('delete_submissions_warning')}
            </p>
            <p dangerouslySetInnerHTML={{ __html: t('delete_submissions_note') }}></p>
            <ul>
              <li>{t('teams_list')}</li>
              <li>{t('team_ranking')}</li>
              <li>{t('station_info')}</li>
            </ul>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>
              {t('cancel')}
            </Button>
            <Button 
              variant="danger" 
              onClick={deleteAllSubmissions}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-1" />
                  {t('deleting')}
                </>
              ) : (
                <>
                  <i className="bi bi-trash me-1"></i>
                  {t('delete_all')}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default SubmissionsHistory;