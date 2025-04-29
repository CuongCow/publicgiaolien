import React, { useState, useEffect } from 'react';
import { Container, Table, Card, Row, Col, Spinner, Badge, Button, Modal, Alert } from 'react-bootstrap';
import AdminNavbar from '../../components/Navbar';
import { submissionApi } from '../../services/api';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { stationApi } from '../../services/api';
import { formatDateTime, replaceStationTerm } from '../../utils/helpers';
import TermReplacer from '../../utils/TermReplacer';
import { useLanguage } from '../../context/LanguageContext';

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
  const { t } = useLanguage();

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
          console.error(t('error_fetching_station_data'), err);
        }
      }
      
      setError(null);
    } catch (err) {
      setError(t('ranking_load_error'));
      console.error(t('error_fetching_ranking'), err);
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
      const rankingSheet = workbook.addWorksheet(t('ranking_sheet_name'));
      
      // Thêm header
      rankingSheet.columns = [
        { header: t('rank'), key: t('rank'), width: 10 },
        { header: t('table_team_name'), key: t('table_team_name'), width: 30 },
        { header: t('total_score'), key: t('total_score'), width: 15 },
        { header: replaceStationTerm(t('table_completed_stations')), key: replaceStationTerm(t('table_completed_stations')), width: 20 },
        { header: t('time_participated'), key: t('time_participated'), width: 25 }
      ];
      
      // Làm đậm header
      rankingSheet.getRow(1).font = { bold: true };
      
      // Thêm dữ liệu
      rankingSheet.addRows(data.ranking);

      // Trang tính chi tiết từng đội
      const detailsSheet = workbook.addWorksheet(t('team_details_sheet_name'));
      
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
            A: t('table_team_name'),
            B: row['Tên đội'],
            C: t('total_score'),
            D: row['Tổng điểm'],
            E: replaceStationTerm(t('table_completed_stations')),
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
            A: t('stt'),
            B: t('station_name_label'),
            C: t('score'),
            D: t('completed_time')
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
        ? `${t('ranking_file_prefix')} ${data.gameName} ${new Date().toLocaleDateString('vi-VN')}.xlsx`
        : `${t('ranking_game_file_prefix')} ${new Date().toLocaleDateString('vi-VN')}.xlsx`;
      
      saveAs(new Blob([buffer]), fileName);
      
      setSuccess(t('excel_export_success'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(t('excel_export_error'));
      console.error(t('error_exporting_excel'), err);
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
      
      setSuccess(t('ranking_reset_success'));
      
      // Làm mới dữ liệu
      setRanking([]);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(t('ranking_reset_error'));
      console.error(t('error_resetting_ranking'), err);
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
      
      setSuccess(t('scores_reset_success', { count: response.data.teamsAffected || 0 }));
      
      // Làm mới dữ liệu
      await fetchRanking();
      
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      setError(t('scores_reset_error'));
      console.error(t('error_resetting_scores'), err);
    } finally {
      setResetScoresLoading(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <Container className="py-4 pt-3 mt-2">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>{t('team_ranking_title')}</h1>
          
          <div>
            <Button 
              variant="warning"
              className="me-2"
              onClick={() => setShowResetScoresModal(true)}
              disabled={resetScoresLoading || ranking.length === 0}
              title={t('reset_scores_tooltip')}
            >
              {resetScoresLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-1" />
                  {t('deleting')}
                </>
              ) : (
                <>
                  <i className="bi bi-eraser me-1"></i>
                  {t('reset_scores')}
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
                  {t('deleting')}
                </>
              ) : (
                <>
                  <i className="bi bi-trash me-1"></i>
                  {t('delete_all')}
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
        
        {gameName && (
          <div className="mb-4">
            <p className="text-primary">{gameName}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">{t('loading')}</p>
          </div>
        ) : ranking.length === 0 ? (
          <Card className="text-center p-5">
            <Card.Body>
              <h3>{t('no_team_completed_station')}</h3>
              <p className="text-muted">
                {t('ranking_will_show')}
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
                      <th>{t('rank')}</th>
                      <th>{t('table_team_name')}</th>
                      <th>{t('total_score')}</th>
                      <th><TermReplacer>{t('table_completed_stations')}</TermReplacer></th>
                      <th>{t('time_participated')}</th>
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

            <h2 className="mb-4"><TermReplacer>{t('completed_stations_details')}</TermReplacer></h2>
            
            {ranking.map(team => (
              <Card key={team._id} className="shadow-sm mb-4">
                <Card.Header>
                  <h4>{team.name} - {team.totalScore} {t('points')}</h4>
                </Card.Header>
                <Card.Body>
                  {team.completedStations.length === 0 ? (
                    <p className="text-muted"><TermReplacer>{t('no_stations_completed')}</TermReplacer></p>
                  ) : (
                    <Table striped bordered responsive>
                      <thead>
                        <tr>
                          <th>{t('stt')}</th>
                          <th><TermReplacer>{t('station_name_label')}</TermReplacer></th>
                          <th>{t('score')}</th>
                          <th>{t('completed_time')}</th>
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
            <Modal.Title>{t('confirm_delete_all')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{t('confirm_delete_ranking_question')}</p>
            <p className="text-danger fw-bold">{t('note_action_will_delete')}:</p>
            <ul className="text-danger">
              <li><strong>{t('all_teams')}</strong></li>
              <li>{t('scores_and_completed_stations')}</li>
              <li>{t('submission_history')}</li>
            </ul>
            <p className="text-danger"><strong>{t('action_cannot_be_undone')}</strong></p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowResetModal(false)}>
              {t('cancel')}
            </Button>
            <Button 
              variant="danger" 
              onClick={handleResetRanking}
              disabled={resetLoading}
            >
              {resetLoading ? t('deleting') : t('confirm_delete')}
            </Button>
          </Modal.Footer>
        </Modal>
        
        {/* Modal xác nhận xóa điểm số */}
        <Modal show={showResetScoresModal} onHide={() => !resetScoresLoading && setShowResetScoresModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title className="text-warning">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {t('reset_scores')}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{t('confirm_reset_scores_question')}</p>
            <p><strong>{t('note')}:</strong></p>
            <ul>
              <li className="text-danger"><strong>{t('delete')}:</strong> {t('scores_and_completed_stations')}</li>
              <li className="text-danger"><strong>{t('delete')}:</strong> {t('submission_history')}</li>
            </ul>
            <p className="text-warning"><strong>{t('action_cannot_be_undone')}</strong></p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowResetScoresModal(false)} disabled={resetScoresLoading}>
              {t('cancel')}
            </Button>
            <Button 
              variant="warning" 
              onClick={handleResetScores}
              disabled={resetScoresLoading}
            >
              {resetScoresLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-1" />
                  {t('deleting')}
                </>
              ) : (
                <>
                  <i className="bi bi-eraser me-1"></i>
                  {t('reset_scores')}
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